


const express = require('express');
const router = express.Router();


const ejs = require('ejs');

const session = require('express-session');

const moment = require('moment');


const mysql = require('mysql');




// Middleware de autenticación
function requireAuth(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  } else {
    res.redirect('/');
  }
}






const connection = mysql.createConnection({
  host: process.env.DB_HOST || '144.217.189.135',
  user: process.env.DB_USER || 'cablesur_almacen',
  password: process.env.DB_PASSWORD || '}k]PL,01!wzz',
  database: process.env.DB_NAME || 'cablesur_ALMACEN'
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos: ' + err.stack);
    return;
  }
  console.log('Conexión a la base de datos exitosa.');
});




// Configuración de session
router.use(session({
  secret: 'tt52yy6re92*',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Cambia a true si usas HTTPS
}));





// Ruta para obtener los datos de servicios de un usuario por su ID
router.get('/user-services/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const userData = await fetchUserData(userId);
      res.json(userData);
    } catch (error) {
      console.error('Error al obtener los datos de servicios del usuario:', error.message);
      res.status(500).send('Error al obtener los datos de servicios del usuario');
    }
  });
  
  // Función para obtener los datos del usuario por su ID desde las tablas users y servicios
  async function fetchUserData(userId) {
    const selectQuery = `
      SELECT
        u.apellidos,
        u.nombres,
        u.direccion,
        u.dni,
        s.estado_cable,
        s.corte_cable,
        s.estado_internet,
        s.corte_internet,
        s.deuda_total
      FROM users u
      JOIN servicios s ON u.id = s.user_id
      WHERE u.id = ?
    `;
  
    return new Promise((resolve, reject) => {
      connection.query(selectQuery, [userId], (error, results) => {
        if (error) {
          console.error('Error al obtener los datos del usuario desde la base de datos:', error);
          reject(new Error('Error al obtener los datos del usuario desde la base de datos'));
        } else {
          if (results.length > 0) {
            resolve(results[0]);
          } else {
            reject(new Error('No se encontraron datos para el usuario con el ID proporcionado'));
          }
        }
      });
    });
  }
  


// Ruta para obtener las deudas y los datos del usuario
router.get('/user-debts/:userId', requireAuth, async (req, res) => {
    try {
      const userId = req.params.userId;
      const debtsAndUserData = await fetchUserDebtsAndUserData(userId); // Cambio de función para obtener los datos del cliente y las deudas
      res.json(debtsAndUserData);
    } catch (error) {
      console.error('Error al obtener deudas y datos del usuario:', error);
      res.status(500).send('Error al obtener las deudas y datos del usuario');
    }
  });
  
  // Función para obtener los datos del usuario y las deudas desde las tablas 'users' y 'servicios'
  async function fetchUserDebtsAndUserData(userId) {
    const selectQuery = `
      SELECT
        u.apellidos,
        u.nombres,
        u.direccion,
        u.dni,
        s.estado_cable,
        s.corte_cable,
        s.estado_internet,
        s.corte_internet,
        d.fecha_deuda,
        d.mes_deuda,
        d.deuda,
        d.tipo_deuda,
        d.fecha_corte,
        SUM(d.deuda) AS deuda_total
      FROM users u
      JOIN servicios s ON u.id = s.user_id
      LEFT JOIN deudas d ON s.user_id = d.user_id
      WHERE u.id = ?
      GROUP BY
        u.apellidos,
        u.nombres,
        u.direccion,
        u.dni,
        s.estado_cable,
        s.corte_cable,
        s.estado_internet,
        s.corte_internet,
        d.fecha_deuda,
        d.mes_deuda,
        d.deuda,
        d.tipo_deuda,
        d.fecha_corte
      ORDER BY d.fecha_deuda ASC
    `;
  
    return new Promise((resolve, reject) => {
      connection.query(selectQuery, [userId], (error, results) => {
        if (error) {
          return reject('Error al obtener las deudas y datos del usuario:', error);
        }
        resolve(results);
      });
    });
  }
  

// Ruta para ver las deudas por usuario en una tabla
router.get('/users/:userId/deudas', requireAuth, (req, res) => {
    const userId = req.params.userId;
    const selectDeudasQuery = `
      SELECT * FROM deudas WHERE user_id = ?
    `;
    connection.query(selectDeudasQuery, [userId], (error, deudasResults) => {
      if (error) {
        console.error('Error al obtener las deudas:', error);
        return res.status(500).send('Error al obtener las deudas del usuario');
      }
      res.render('deudas-usuario', { deudas: deudasResults });
    });
  });
  
 
  
  // Ruta GET para obtener los datos del servicio y mostrar el formulario de actualización
router.get('/servicios/actualizarInt0/:id', requireAuth, async (req, res) => {
    const servicioId = req.params.id;
  
    // Consulta SQL para obtener los datos del servicio desde la tabla servicios
    const selectQuery = 'SELECT * FROM servicios WHERE user_id = ?';
  
    // Ejecutar la consulta a la base de datos
    connection.query(selectQuery, servicioId, (error, results) => {
      if (error) {
        console.error('Error al obtener los datos del servicio:', error);
        res.status(500).send('Error al obtener los datos del servicio');
      } else {
        // Comprobar si se encontraron resultados
        if (results.length > 0) {
          const user = results[0];
          res.render('users-internet', { user: user }); // Pasa los datos del servicio a la plantilla
        } else {
          res.send('No se encontró ningún servicio con el ID especificado');
        }
      }
    });
  });
  
  
  // Ruta GET para obtener los datos del servicio y las velocidades disponibles
  router.get('/servicios/actualizarInt/:id', requireAuth, async (req, res) => {
    const servicioId = req.params.id;
  
    // Consulta SQL para obtener los datos del servicio desde la tabla servicios
    const selectServicioQuery = 'SELECT * FROM servicios WHERE user_id = ?';
  
    // Consulta SQL para obtener las velocidades disponibles desde la tabla velocidades
    const selectVelocidadesQuery = 'SELECT velocidad, precio FROM velocidades';
  
    // Ejecutar ambas consultas en paralelo usando Promise.all
    try {
      const [servicioResults, velocidadesResults] = await Promise.all([
        new Promise((resolve, reject) => {
          connection.query(selectServicioQuery, servicioId, (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        }),
        new Promise((resolve, reject) => {
          connection.query(selectVelocidadesQuery, (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        })
      ]);
  
      // Verificar si se encontraron resultados para el servicio
      if (servicioResults.length > 0) {
        const user = servicioResults[0];
        res.render('users-internet', { user: user, velocidades: velocidadesResults });
      } else {
        res.send('No se encontró ningún servicio con el ID especificado');
      }
    } catch (error) {
      console.error('Error al obtener los datos del servicio y las velocidades:', error);
      res.status(500).send('Error al obtener los datos del servicio y las velocidades');
    }
  });
  


module.exports = router;
