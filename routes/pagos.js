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





router.post('/add-debt', async (req, res) => {
    try {
      const { userId, monto, tipoDocumento, cobrador, numeroSerie, numeroDocumento, metodo } = req.body;
      const banco = req.body.banco || null;
      const forma = req.body.forma || null;
      const cod_operacion = req.body.cod_operacion || null;
      const cod_cuenta = req.body.cod_cuenta || null;
      const observacion = req.body.observacion || null;
      const fechaPago = new Date(); // Obtener la fecha y hora actual
  
      // Verificar si el número de documento ya existe
      const documentoExistente = await queryDatabase('SELECT * FROM pago WHERE numero_documento = ?', [numeroDocumento]);
      if (documentoExistente.length > 0) {
        return res.status(400).send('Error: El número de documento ya existe.');
      }
  
      // Obtener las deudas del usuario
      const usuarioDeudas = await queryDatabase('SELECT * FROM deudas WHERE user_id = ?', [userId]);
  
      let montoRestante = monto;
  
      // Si el usuario tiene deudas, calcular el monto a pagar
      if (usuarioDeudas.length > 0) {
        // Separar las deudas de reconexión y las demás
        const deudasReconex = usuarioDeudas.filter(deuda => deuda.tipo_deuda === 'reconexion-int' || deuda.tipo_deuda === 'reconexion-catv');
        const otrasDeudas = usuarioDeudas.filter(deuda => deuda.tipo_deuda !== 'reconexion-int' && deuda.tipo_deuda !== 'reconexion-catv');
  
        // Ordenar las demás deudas del usuario primero por fecha_deuda de manera ascendente y luego por tipo_deuda (catv antes de internet)
        otrasDeudas.sort((a, b) => {
          if (moment(a.fecha_deuda).isSame(moment(b.fecha_deuda))) {
            // Ordenar por tipo_deuda cuando las fechas de deuda son iguales
            if (a.tipo_deuda === 'catv' && b.tipo_deuda === 'internet') {
              return -1;
            } else if (a.tipo_deuda === 'internet' && b.tipo_deuda === 'catv') {
              return 1;
            }
            return a.tipo_deuda.localeCompare(b.tipo_deuda);
          } else {
            // Ordenar por fecha_deuda
            return moment(a.fecha_deuda) - moment(b.fecha_deuda);
          }
        });
  
        // Concatenar las deudas de reconexión al inicio de la lista de deudas
        const todasDeudas = [...deudasReconex, ...otrasDeudas];
  
        for (const deuda of todasDeudas) {
          // Calcular el monto a pagar para esta deuda
          const montoPagar = Math.min(montoRestante, deuda.deuda);
  
          // Restar el monto pagado de la deuda actual
          const nuevaDeuda = deuda.deuda - montoPagar;
  
          // Obtener el mes de la deuda en español
          const mesDeuda = moment(deuda.fecha_deuda).locale('es').format('MMMM');
  
          // Actualizar la deuda en la base de datos
          await queryDatabase('UPDATE deudas SET deuda = ? WHERE user_id = ? AND fecha_deuda = ? AND tipo_deuda = ?', [nuevaDeuda, userId, deuda.fecha_deuda, deuda.tipo_deuda]);
  
          // Insertar el pago en la tabla de pago si el montoPagar es mayor a 0
          if (montoPagar > 0) {
            await queryDatabase('INSERT INTO pago (user_id, monto, tipo_documento, cobrador, numero_serie, numero_documento, fecha_pago, tipo_deuda, mes_deuda, metodo, banco, forma, cod_operacion, cod_cuenta, observacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
              [userId, montoPagar, tipoDocumento, cobrador, numeroSerie, numeroDocumento, fechaPago, deuda.tipo_deuda, mesDeuda, metodo, banco, forma,  cod_operacion, cod_cuenta, observacion]);
          }
          // Actualizar el monto restante
          montoRestante -= montoPagar;
  
          // Si ya se ha pagado todo el monto, salir del bucle
          if (montoRestante === 0) {
            break;
          }
        }
      }
  
      // Si queda monto restante y todas las deudas están saldadas
      if (montoRestante > 0) {
        const fechaAdelanto = new Date(); // Fecha de adelanto puede ser la actual u otra lógica según necesites
        await queryDatabase('INSERT INTO adelanto (user_id, monto, fecha_adelanto, tipo_documento, cobrador, numero_serie, numero_documento, tipo_deuda, metodo, banco, forma, cod_operacion, cod_cuenta, observacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
          [userId, montoRestante, fechaAdelanto, tipoDocumento, cobrador, numeroSerie, numeroDocumento, 'adelanto',  metodo, banco, forma, cod_operacion, cod_cuenta, observacion]);
  
        // Insertar el monto adelanto en la tabla de pagos
        await queryDatabase('INSERT INTO pago (user_id, monto, tipo_documento, cobrador, numero_serie, numero_documento, fecha_pago, tipo_deuda, mes_deuda, metodo, banco, forma, cod_operacion, cod_cuenta, observacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
          [userId, montoRestante, tipoDocumento, cobrador, numeroSerie, numeroDocumento, fechaPago, 'adelanto', null, metodo, banco, forma, cod_operacion, cod_cuenta, observacion]);
      }
  
      
      
      
      
     res.redirect(`/users`);
    
    
      
    } catch (error) {
      console.error('Error al agregar el pago:', error);
      res.status(500).send('Error al agregar el pago.');
    }
  });
  
  // Función para manejar consultas con promesas
  function queryDatabase(query, params) {
    return new Promise((resolve, reject) => {
      connection.query(query, params, (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
  }
  
  

// Ruta para obtener y mostrar los pagos por usuario
router.get('/user-payments/:userId', requireAuth, async (req, res) => {
    try {
      const userId = req.params.userId;
      const pagosQuery = `
        SELECT user_id, monto, tipo_documento, cobrador, numero_serie, numero_documento, fecha_pago, tipo_deuda, mes_deuda, metodo
        FROM pago
        WHERE user_id = ?`;
  
      const pagos = await queryDatabase(pagosQuery, [userId]);
  
      res.render('pagosUsuario', { pagos });
    } catch (error) {
      console.error('Error al obtener los pagos del usuario:', error);
      res.status(500).send('Error al obtener los pagos del usuario.');
    }
  });
  


// En el controlador o en la ruta donde renderizas la vista
router.get('/user-pagos/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const pagos = await queryDatabase('SELECT * FROM pago WHERE user_id = ?', [userId]);

    // Aquí estás pasando userId como parte de los datos que se envían a la vista
    res.render('pagosDiario', { pagos, userId });
  } catch (error) {
    console.error('Error al obtener los pagos del usuario:', error);
    res.status(500).send('Error al obtener los pagos del usuario.');
  }
});




router.post('/delete-payments-today/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const fechaActual = moment().tz('America/Lima').format('YYYY-MM-DD');

    // Verificar si hay pagos del día actual
    const pagosEliminados = await queryDatabase('SELECT * FROM pago WHERE user_id = ? AND DATE(fecha_pago) = ?', [userId, fechaActual]);

    if (pagosEliminados.length === 0) {
      // No hay pagos del día actual
      return res.render('pagosDiario', {
        pagos: await queryDatabase('SELECT * FROM pago WHERE user_id = ?', [userId]),
        userId,
        errorMessage: 'No se encontraron pagos del día actual para eliminar.',
      });
    }

    // Eliminar los pagos del día actual
    await queryDatabase('DELETE FROM pago WHERE user_id = ? AND DATE(fecha_pago) = ?', [userId, fechaActual]);

    // Eliminar el monto correspondiente de la tabla adelanto para la fecha actual
    await queryDatabase('DELETE FROM adelanto WHERE user_id = ? AND DATE(fecha_adelanto) = ?', [userId, fechaActual]);

    // Restablecer las deudas afectadas por los pagos eliminados
    const deudasRestablecer = [];
    for (const pago of pagosEliminados) {
      const deuda = await queryDatabase('SELECT * FROM deudas WHERE user_id = ? AND mes_deuda = ? AND tipo_deuda = ?', [userId, pago.mes_deuda, pago.tipo_deuda]);
      if (deuda.length > 0) {
        const nuevaDeuda = deuda[0].deuda + pago.monto;
        deudasRestablecer.push({ deuda: nuevaDeuda, mes_deuda: deuda[0].mes_deuda, tipo_deuda: deuda[0].tipo_deuda });
      }
    }
    await restablecerDeudas(userId, deudasRestablecer);

    // Redireccionar con éxito
    res.redirect(`/user-pagos/${userId}`);
  } catch (error) {
    console.error('Error al eliminar los pagos del día actual del usuario:', error);
    res.status(500).send('Error al eliminar los pagos del día actual del usuario.');
  }
});



// Función para restablecer deudas
async function restablecerDeudas(userId, deudasRestablecer) {
  try {
    for (const deuda of deudasRestablecer) {
      await queryDatabase('UPDATE deudas SET deuda = ? WHERE user_id = ? AND mes_deuda = ? AND tipo_deuda = ?', [deuda.deuda, userId, deuda.mes_deuda, deuda.tipo_deuda]);
    }
  } catch (error) {
    console.error('Error al restablecer las deudas:', error);
    throw new Error('Error al restablecer las deudas.');
  }
}

// Función para manejar consultas con promesas
function queryDatabase(query, params) {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}






  module.exports = router;