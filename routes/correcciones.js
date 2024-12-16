const express = require('express');
const router = express.Router();


const ejs = require('ejs');

const moment = require('moment-timezone');
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







router.get('/user/:userId/debts', requireAuth, async (req, res) => {
    try {
      const userId = req.params.userId;
      const userDebts = await fetchUserDebts(userId);
  
      if (!userDebts) {
        return res.status(404).send('Usuario no encontrado');
      }
  
      res.render('deudas-usuario', { data: userDebts });
    } catch (error) {
      console.error('Error al obtener las deudas del usuario:', error);
      res.status(500).send('Error al obtener las deudas del usuario');
    }
  });
  
  
  //CORREGIR DEUDAS
  async function fetchUserDebts(userId) {
    const selectQuery = `
      SELECT
        u.apellidos,
        u.nombres,
        u.dni,
        u.direccion,
        u.telefono,
        s.user_id,
        s.servicio,
        s.senal,
        s.fecha_instalacion,
        s.instalacion_int,
        s.precio AS precioCable,
        s.estado_cable,
        s.num_decos,
        s.tipo_servicio2,
        s.precio2 AS precioInternet,
        s.estado_internet,
        s.velocidad,
        s.usuario,
        s.contrasena,
        s.corte_cable,
        s.corte_internet,
        s.activacion_cable,
        s.activacion_internet,
        d.fecha_deuda,
        d.mes_deuda,
        d.deuda,
        d.tipo_deuda
      FROM servicios s
      LEFT JOIN deudas d ON s.user_id = d.user_id
      INNER JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ?`;
  
    return new Promise((resolve, reject) => {
      connection.query(selectQuery, [userId], (error, results) => {
        if (error) {
          reject('Error al obtener las deudas del usuario:', error);
          return;
        }
        if (results.length === 0) {
          resolve(null);
          return;
        }
  
        const usuario = {
          userId: results[0].user_id,
          apellidos: results[0].apellidos,
          nombres: results[0].nombres,
          dni: results[0].dni,
          direccion: results[0].direccion,
          telefono: results[0].telefono,
          servicio: results[0].servicio,
          senal: results[0].senal,
          precioCable: results[0].precioCable,
          precioInternet: results[0].precioInternet,
          estado_cable: results[0].estado_cable,
          num_decos: results[0].num_decos,
          tipo_servicio2: results[0].tipo_servicio2,
          velocidad: results[0].velocidad,
          usuario: results[0].usuario,
          contrasena: results[0].contrasena,
          estado_internet: results[0].estado_internet,
          deudas: []
        };
  
        results.forEach(row => {
          if (row.fecha_deuda) {
            usuario.deudas.push({
              fechaDeuda: moment(row.fecha_deuda).format('DD-MM-YYYY'),
              mesDeuda: row.mes_deuda,
              deuda: row.deuda,
              tipoDeuda: row.tipo_deuda
            });
          }
        });
  
        resolve(usuario);
      });
    });
  }
  
  
  
  
// Ruta para ajustar la deuda
router.post('/user/:userId/debt/:fechaDeuda/adjust',  async (req, res) => {
    try {
      const userId = req.params.userId;
      const fechaDeuda = moment(req.params.fechaDeuda, 'DD-MM-YYYY').format('YYYY-MM-DD');
      const amount = parseFloat(req.body.amount); // Convertir a un número flotante
      const tipoDeuda = req.body.tipoDeuda;
      const motivo = req.body.motivo;
  
      // Validar que el monto sea un número válido
      if (isNaN(amount) || !isFinite(amount)) {
        return res.status(400).send('El monto proporcionado no es válido.');
      }
  
      // Obtener la deuda actual
      const getCurrentDebtQuery = `
        SELECT deuda
        FROM deudas
        WHERE user_id = ? AND fecha_deuda = ? AND tipo_deuda = ?
      `;
      const currentDebtResult = await queryDatabase(getCurrentDebtQuery, [userId, fechaDeuda, tipoDeuda]);
  
      if (currentDebtResult.length === 0) {
        return res.status(404).send('Deuda no encontrada.');
      }
  
      const currentDebt = parseFloat(currentDebtResult[0].deuda);
      const newDebt = parseFloat((currentDebt + amount).toFixed(2)); // Redondear a 2 decimales
  
      // Actualizar la deuda en la base de datos
      const updateDebtQuery = `
        UPDATE deudas
        SET deuda = ?, motivo = ?
        WHERE user_id = ? AND fecha_deuda = ? AND tipo_deuda = ?
      `;
      await queryDatabase(updateDebtQuery, [newDebt, motivo, userId, fechaDeuda, tipoDeuda]);
  
      // Insertar la corrección
      const insertCorrectionQuery = `
        INSERT INTO correcciones (user_id, fecha_deuda_corregida, fecha_correccion, deuda_anterior, monto_corregido, motivo, tipo_deuda)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await queryDatabase(insertCorrectionQuery, [
        userId,
        fechaDeuda,
        moment().format('YYYY-MM-DD'),
        currentDebt,
        amount,
        motivo,
        tipoDeuda,
      ]);
  
      res.redirect(`/user/${userId}/debts`);
    } catch (error) {
      console.error('Error al ajustar la deuda:', error);
      res.status(500).send('Error al ajustar la deuda');
    }
  });
  
  
  
  function queryDatabase(query, params) {
    return new Promise((resolve, reject) => {
      connection.query(query, params, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }
  
  
 router.get('/correcciones', requireAuth, async (req, res) => {
    try {
      const allCorrections = await fetchAllCorrections();
  
      if (!allCorrections) {
        return res.status(404).send('No se encontraron correcciones');
      }
  
      res.render('correcciones-usuario', { data: allCorrections });
    } catch (error) {
      console.error('Error al obtener las correcciones:', error);
      res.status(500).send('Error al obtener las correcciones');
    }
  });
  
  
  
  
  
  //CORREGIR DEUDAS
  
  async function fetchAllCorrections() {
    const selectQuery = `
      SELECT
        u.nombres,
        u.apellidos,
        u.direccion,
        c.fecha_deuda_corregida,
        c.fecha_correccion,
        c.deuda_anterior,
        c.monto_corregido,
        c.motivo,
        c.tipo_deuda
      FROM correcciones c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.fecha_correccion DESC
    `;
  
    return new Promise((resolve, reject) => {
      connection.query(selectQuery, (error, results) => {
        if (error) {
          return reject(error);
        }
        if (results.length === 0) {
          return resolve([]);
        }
  
        const correcciones = results.map(row => ({
          nombres: row.nombres,
          apellidos: row.apellidos,
          direccion: row.direccion,
          fechaDeudaCorregida: moment(row.fecha_deuda_corregida).format('DD-MM-YYYY'),
          fechaCorreccion: moment(row.fecha_correccion).format('DD-MM-YYYY'),
          deudaAnterior: row.deuda_anterior,
          montoCorregido: row.monto_corregido,
          motivo: row.motivo,
          tipoDeuda: row.tipo_deuda
        }));
  
        resolve(correcciones);
      });
    });
  }
  

  module.exports = router;