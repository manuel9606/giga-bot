const express = require('express');
const router = express.Router();


const ejs = require('ejs');


const mysql = require('mysql');


const session = require('express-session');
const bodyParser = require('body-parser');



router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.urlencoded({ extended: false }));
router.use(express.json());



// Middleware de autenticación
function requireAuth(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  } else {
    res.redirect('/');
  }
}

router.use(session({
  secret: process.env.SESSION_SECRET ,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));




const connection = require('../private/db');





// Ruta para obtener la cantidad de clientes con servicio de cable
router.get('/clientes-cable', requireAuth, (req, res) => {
    connection.query('SELECT COUNT(*) AS cantidad_cable FROM servicios WHERE servicio = "cable"', (err, result) => {
        if (err) {
            console.error('Error al obtener cantidad de clientes con servicio de cable:', err);
            return res.status(500).send('Error al obtener datos de clientes');
        }
        const cantidadCable = result[0].cantidad_cable; // Obtiene la cantidad de clientes
        res.json({ cantidadCable }); // Devuelve el número de clientes en formato JSON
    });
});



// Ruta para obtener la cantidad de clientes con servicio de internet
router.get('/clientes-internet', requireAuth, (req, res) => {
    connection.query('SELECT COUNT(*) AS cantidad_internet FROM servicios WHERE tipo_servicio2 = "Internet"', (err, result) => {
        if (err) {
            console.error('Error al obtener cantidad de clientes con servicio de internet:', err);
            return res.status(500).send('Error al obtener datos de clientes');
        }
        const cantidadInternet = result[0].cantidad_internet; // Obtiene la cantidad de clientes
        res.json({ cantidadInternet }); // Devuelve el número de clientes en formato JSON
    });
});

// Ruta para obtener la cantidad de clientes con servicio de cable por estado (Act, Bt y total)
router.get('/clientes-cable-estados', requireAuth, (req, res) => {
    connection.query(
        `SELECT 
            SUM(CASE WHEN estado_cable = 'Act' THEN 1 ELSE 0 END) AS activos, 
            SUM(CASE WHEN estado_cable = 'Bt' THEN 1 ELSE 0 END) AS baja,
            COUNT(*) AS total
        FROM servicios 
        WHERE servicio = 'cable'`,
        (err, result) => {
            if (err) {
                console.error('Error al obtener cantidad de clientes con servicio de cable por estado:', err);
                return res.status(500).send('Error al obtener datos de clientes');
            }
            const activos = result[0].activos; // Total de clientes activos
            const baja = result[0].baja; // Total de clientes en baja
            const total = result[0].total; // Total de clientes con servicio de cable

            res.json({ activos, baja, total }); // Devuelve los datos de los clientes en formato JSON
        }
    );
});


// Ruta para obtener la cantidad de clientes con servicio de internet por estado (Act, Bt y total)
router.get('/clientes-internet-estados', requireAuth, (req, res) => {
    connection.query(
        `SELECT 
            SUM(CASE WHEN estado_internet = 'Act' THEN 1 ELSE 0 END) AS activos, 
            SUM(CASE WHEN estado_internet = 'Bt' THEN 1 ELSE 0 END) AS baja,
            COUNT(*) AS total
        FROM servicios 
        WHERE tipo_servicio2 = 'internet'`,
        (err, result) => {
            if (err) {
                console.error('Error al obtener cantidad de clientes con servicio de internet por estado:', err);
                return res.status(500).send('Error al obtener datos de clientes');
            }
            const activos = result[0].activos; // Total de clientes activos
            const baja = result[0].baja; // Total de clientes en baja
            const total = result[0].total; // Total de clientes con servicio de internet

            res.json({ activos, baja, total }); // Devuelve los datos de los clientes en formato JSON
        }
    );
});




module.exports = router;