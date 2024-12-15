


const express = require('express');
const router = express.Router();


const ejs = require('ejs');

const session = require('express-session');

const moment = require('moment');

const path = require('path');
const mysql = require('mysql2');

const bodyParser = require('body-parser');


// Middleware de autenticación
function requireAuth(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  } else {
    res.redirect('/');
  }
}



const connection = require('../private/db');

router.use(bodyParser.json());


router.use(express.static(path.join(__dirname, 'views')));


router.use(express.static(path.join(__dirname, 'public')));


router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.urlencoded({ extended: false }));
router.use(express.json());






router.use(session({
  secret: process.env.SESSION_SECRET ,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
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
  


// Ruta GET para obtener los datos del servicio y mostrar el formulario de actualización
router.get('/servicios/actualizar/:id', requireAuth, async (req, res) => {
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
        res.render('users-cable', { user: user }); // Pasa los datos del servicio a la plantilla
      } else {
        res.send('No se encontró ningún servicio con el ID especificado');
      }
    }
  });
});




router.post('/servicios/actualizar', async (req, res) => {
  let { user_id, estado_cable, fecha_instalacion, senal, servicio, precio, num_decos, descripcion_catv, tipo_servicio , inscripcion_cable,costo_materiales_cable} = req.body;

  // Asegurarse de que num_decos tenga un valor válido
  num_decos = parseInt(num_decos, 10) || 0;  // Convertir a entero o usar 0 si es inválido
  
  // Si fecha_instalacion está vacío, establecerlo en null
  const fechaInstalacionValidada = fecha_instalacion || null;

  try {
    // Consulta para verificar si el servicio ya existe para el usuario
    const checkServiceQuery = 'SELECT COUNT(*) AS count FROM servicios WHERE user_id = ? AND servicio = ?';
    const checkServiceValues = [user_id, servicio];

    const [checkResult] = await new Promise((resolve, reject) => {
      connection.query(checkServiceQuery, checkServiceValues, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });

    if (checkResult.count > 0) {
      // Si el servicio ya existe para el usuario, enviar un estado de error 400
      return res.status(400).send('El servicio de cable ya existe');
    }

    // Consulta para actualizar los datos del servicio en la tabla servicios
    const updateQuery = `
      UPDATE servicios
      SET estado_cable = ?,
          fecha_instalacion = ?,
          activacion_cable = ?, 
          senal = ?,
          num_decos = ?,
          servicio = ?,
          precio = ?,
          
          inscripcion_cable = ?,
          costo_materiales_cable = ?,
          descripcion_catv = ?,
          tipo_servicio = ?
      WHERE user_id = ?;
    `;

    // Valores a actualizar en la base de datos
    const updateValues = [
      estado_cable,
      fechaInstalacionValidada,
      fechaInstalacionValidada,
      senal,
      num_decos,
      servicio,
      precio,
        inscripcion_cable ,
          costo_materiales_cable ,
      descripcion_catv,
      tipo_servicio,
      user_id
    ];

    // Ejecutar la consulta de actualización
    await new Promise((resolve, reject) => {
      connection.query(updateQuery, updateValues, async (error, results) => {
        if (error) return reject(error);

        // Aquí puedes hacer cualquier otra tarea necesaria después de la actualización, si es necesario
        
        resolve(results); // Resuelve la promesa principal una vez que todo esté completado
      });
    });

    // Redireccionar a la página del menú o alguna otra página deseada después de la actualización
    res.redirect('/users');

  } catch (error) {
    console.error('Error al actualizar los datos del servicio o insertar decos:', error);
    res.status(500).send('Error al actualizar los datos del servicio o insertar decos');
  }
});

// Función para calcular la deuda
function calcularDeuda1(fechaInstalacion, precioServicio, tipoDeuda) {
  // Convertir la fecha de instalación a un objeto Date
  const fechaInstalacionMoment = moment.utc(fechaInstalacion).local('+05:00');
  // Obtener el último día del mes de la fecha de instalación
  const ultimoDiaMes = moment(fechaInstalacionMoment).endOf('month');
  // Calcular la cantidad de días en el mes de la fecha de instalación
  const diasEnMes = fechaInstalacionMoment.daysInMonth();
  // Calcular la cantidad de días consumidos desde la fecha de instalación hasta el último día del mes
  const diasConsumidos = ultimoDiaMes.diff(fechaInstalacionMoment, 'days') + 1;
  // Calcular la deuda multiplicando el precio diario del servicio por los días consumidos
  const deuda = (precioServicio / diasEnMes) * diasConsumidos;
  // Devolver la deuda calculada
  return deuda;
}




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



router.get('/users/agregar0', requireAuth, (req, res) => {
  const getVelocidadesQuery = 'SELECT velocidad, precio FROM velocidades';

  connection.query(getVelocidadesQuery, (error, results) => {
    if (error) {
      console.error('Error fetching velocidades:', error);
      return res.status(500).send('Error fetching velocidades');
    }

    res.render('create', { velocidades: results });
  });
});





router.post('/servicios/actualizarInt', async (req, res) => {
  let { user_id, estado_internet, tipo_servicio2, instalacion_int, velocidad, precio2, tipo_onu, MAC, usuario, contrasena, ppp_name, ppp_password, nro_tarjeta, nro_puerto, descripcion_int, inscripcion_internet, costo_materiales_internet } = req.body;

  try {
    // Consulta para verificar si el tipo de servicio ya existe para el usuario
    const checkServiceQuery = 'SELECT COUNT(*) AS count FROM servicios WHERE user_id = ? AND tipo_servicio2 = ?';
    const checkServiceValues = [user_id, tipo_servicio2];

    const [checkResult] = await new Promise((resolve, reject) => {
      connection.query(checkServiceQuery, checkServiceValues, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });

    if (checkResult.count > 0) {
      // Si el tipo de servicio ya existe para el usuario, enviar un estado de error 400
      return res.status(400).send('El tipo de servicio de internet ya existe');
    }

    // Consulta para actualizar los datos del servicio de internet en la tabla servicios
    const updateQuery = `
      UPDATE servicios
      SET 
          estado_internet = ?,
          tipo_servicio2 = ?,
          instalacion_int = ?,
          activacion_internet = ?,  -- Agregar activacion_internet
          velocidad = ?,
          precio2 = ?,
          tipo_onu = ?,
          MAC = ?,
          usuario = ?,
          contrasena = ?,
          ppp_name = ?,
          inscripcion_internet = ?,
           costo_materiales_internet = ?,
          ppp_password = ?,
          nro_tarjeta = ?,
          nro_puerto = ?,
          descripcion_int = ?
      WHERE user_id = ?;
    `;

    // Valores a actualizar en la base de datos
    const updateValues = [
      estado_internet,
      tipo_servicio2,
      instalacion_int,
      instalacion_int, // Usar el mismo valor para activacion_internet
      velocidad,
      precio2,
      tipo_onu,
      MAC,
      usuario,
      contrasena,
      ppp_name,
       inscripcion_internet ,
           costo_materiales_internet ,
      ppp_password,
      nro_tarjeta,
      nro_puerto,
      descripcion_int,
      user_id
    ];

    // Ejecutar la consulta de actualización
    await new Promise((resolve, reject) => {
      connection.query(updateQuery, updateValues, async (error, results) => {
        if (error) return reject(error);
        
        resolve(results); // Resuelve la promesa principal una vez que todo esté completado
      });
    });

    // Redireccionar a la página del menú o alguna otra página deseada después de la actualización
    res.redirect('/users');

  } catch (error) {
    console.error('Error al actualizar los datos del servicio de internet:', error);
    res.status(500).send('Error al actualizar los datos del servicio de internet');
  }
});



// Función para calcular la deuda
function calcularDeuda2(fechaDeuda, precioServicio, tipoDeuda) {
  const fechaDeudaMoment = moment.utc(fechaDeuda).local('+05:00');
  fechaDeudaMoment.locale('es');
  const diasEnMes = fechaDeudaMoment.daysInMonth();
  const diasConsumidos = fechaDeudaMoment.daysInMonth() - fechaDeudaMoment.date() + 1;
  const deuda = (precioServicio / diasEnMes) * diasConsumidos;
  return deuda;
}




// Ruta GET para obtener los datos del servicio y mostrar el formulario de actualización
router.get('/servicios/actualizar1/:id', requireAuth, async (req, res) => {
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
        res.render('users-cableAct', { user: user }); // Pasa los datos del servicio a la plantilla
      } else {
        res.send('No se encontró ningún servicio con el ID especificado');
      }
    }
  });
});

router.post('/servicios/actualizar1', async (req, res) => {
  let {  user_id, senal, num_decos, descripcion_catv, precio ,tipo_servicio } = req.body;

  // Asegurarse de que num_decos tenga un valor válido
  num_decos = parseInt(num_decos, 10) || 0;  // Convertir a entero o usar 0 si es inválido

  try {
    // Consulta para actualizar los datos del servicio en la tabla servicios
    const updateQuery = `
      UPDATE servicios
      SET 
   
          senal = ?,
          num_decos = ?,
          descripcion_catv = ?,
          precio = ?,
          tipo_servicio = ?
      WHERE user_id = ?;
    `;

    // Valores a actualizar en la base de datos
    const updateValues = [ senal, num_decos, descripcion_catv, precio, tipo_servicio, user_id];

    // Ejecutar la consulta de actualización
    await new Promise((resolve, reject) => {
      connection.query(updateQuery, updateValues, async (error, results) => {
        if (error) return reject(error);

        try {
          // Consulta SQL para obtener los datos del usuario del servicio
          const getUserQuery = 'SELECT * FROM servicios WHERE user_id = ?';

          // Ejecutar la consulta para obtener los datos del usuario
          const userResults = await new Promise((resolve, reject) => {
            connection.query(getUserQuery, user_id, (userError, userResults) => {
              if (userError) return reject(userError);
              resolve(userResults);
            });
          });

          // Bucle para insertar los datos de decos
          for (let i = 1; i <= num_decos; i++) {
            const cardNumber = req.body[`card_number_${i}`];
            const STBId = req.body[`STB_id_${i}`];
            const nroDeco = req.body[`nro_deco_${i}`];

            // Insertar los datos del usuario y del deco en la tabla decos
            const insertDecoQuery = `
              INSERT INTO decos (user_id, card_number, STB_id, nro_deco, apellidos, nombres, direccion)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            // Valores a insertar en la tabla decos
            const decoValues = [
              user_id,
              cardNumber,
              STBId,
              nroDeco,
              userResults[0].apellidos, // Obtener apellidos del usuario
              userResults[0].nombres, // Obtener nombres del usuario
              userResults[0].direccion // Obtener dirección del usuario
            ];

            // Ejecutar la consulta de inserción
            await new Promise((resolve, reject) => {
              connection.query(insertDecoQuery, decoValues, (decoError, decoResults) => {
                if (decoError) return reject(decoError);
                resolve(decoResults);
              });
            });
          }

          // Redireccionar a la página del menú o alguna otra página deseada después de la actualización
          res.redirect('/users');
        } catch (userError) {
          console.error('Error al obtener los datos del usuario:', userError);
          res.redirect('/users');
        }
      });
    });
  } catch (error) {
    console.error('Error al actualizar los datos del servicio o insertar decos:', error);
    res.status(500).send('Error al actualizar los datos del servicio o insertar decos');
   
  }
});




module.exports = router;
