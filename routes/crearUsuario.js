


const express = require('express');
const router = express.Router();

const path = require('path');
const ejs = require('ejs');

const session = require('express-session');

const moment = require('moment');



const mysql = require('mysql2');


// Middleware de autenticación
function requireAuth(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  } else {
    res.redirect('/');
  }
}



//routes/crearusuario.js

const connection = require('../private/db');







router.use(session({
  secret: process.env.SESSION_SECRET ,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));





router.get('/users/agregar', requireAuth, (req, res) => {
  const getVelocidadesQuery = 'SELECT velocidad, precio FROM velocidades';

  connection.query(getVelocidadesQuery, (error, results) => {
    if (error) {
      console.error('Error fetching velocidades:', error);
      return res.status(500).send('Error fetching velocidades');
    }

    res.render('create', { velocidades: results });
  });
});



router.post('/verificar-direccion', (req, res) => {
    const { direccion } = req.body;

    const checkAddressQuery = 'SELECT COUNT(*) AS count FROM users WHERE direccion = ?';

    connection.query(checkAddressQuery, [direccion], (error, results) => {
        if (error) {
            console.error('Error al verificar la dirección:', error);
            return res.status(500).send('Error al verificar la dirección');
        }

        res.json({ existe: results[0].count > 0 });
    });
});


router.post('/verificar-dni', (req, res) => {
  const { dni } = req.body;

  const checkDniQuery = 'SELECT COUNT(*) AS count FROM users WHERE dni = ?';

  connection.query(checkDniQuery, [dni], (error, results) => {
      if (error) {
          console.error('Error al verificar el DNI:', error);
          return res.status(500).send('Error al verificar el DNI');
      }

      res.json({ existe: results[0].count > 0 });
  });
});



router.post('/users/agregar', requireAuth, (req, res) => {
  const {
    apellidos,
    nombres,
    direccion,
    telefono,
    dni,
    vivienda,
    nodo,
    estado_cable,
    servicio,
    fecha_instalacion,
    senal,
    tipo_servicio,
    precio,
    num_decos,
    descripcion_catv,
    estado_internet,
    tipo_servicio2,
    instalacion_int,
    velocidad,
    precio2,
    tipo_onu,
    MAC,
    usuario,
    contrasena,
    ppp_name,
    ppp_password,
    nro_tarjeta,
    nro_puerto,
    descripcion_int,
    inscripcion_cable,
    inscripcion_internet,
    costo_materiales_internet,
    costo_materiales_cable
  } = req.body;

  // Asegurarse de que al menos uno de los servicios esté en estado 'Act'
  if (!hasActiveStatus(estado_cable, estado_internet)) {
    return res.status(400).send('Al menos uno de los servicios debe estar en estado "Act".');
  }

 
  // Consulta SQL para verificar si la dirección o el DNI ya existen
  const checkAddressDniQuery = `
    SELECT COUNT(*) AS count FROM users
    WHERE direccion = ? OR dni = ?
  `;

  // Consulta SQL para verificar si el DNI ya existe
  const checkDniQuery = `
    SELECT COUNT(*) AS count
    FROM users
    WHERE dni = ?
  `;

  const insertQuery = `
    INSERT INTO users (
      apellidos,
      nombres,
      direccion,
      telefono,
      dni,
      vivienda,
      nodo
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const insertServiciosQuery = `
    INSERT INTO servicios (
      user_id,
      estado_cable,
      servicio,
      fecha_instalacion,
      senal,
      tipo_servicio,
      precio,
      num_decos,
      descripcion_catv,
      estado_internet,
      tipo_servicio2,
      instalacion_int,
      velocidad,
      precio2,
      tipo_onu,
      MAC,
      usuario,
      contrasena,
      ppp_name,
      ppp_password,
      nro_tarjeta,
      nro_puerto,
      descripcion_int,
      nodo,
      total,
      activacion_cable,
      corte_cable,
      activacion_internet,
      corte_internet,
      inscripcion_cable,
      inscripcion_internet,
      costo_materiales_internet,
      costo_materiales_cable
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const insertDecoQuery = `
    INSERT INTO decos (
      user_id,
      card_number,
      STB_id,
      nro_deco,
      apellidos,
      nombres,
      direccion,
      fecha_instalacion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())
  `;

  // Variables para determinar si las fechas deben ser NULL
  const fechaInstalacionValue = fecha_instalacion || null;
  const instalacionIntValue = instalacion_int || null;

   // Ejecutar la consulta para verificar si la dirección o el DNI ya existen
   connection.query(checkAddressDniQuery, [direccion, dni], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error al verificar la dirección o el DNI:', checkError);
      return res.status(500).send('Error al verificar la dirección o el DNI');
    }

    // Si la dirección o el DNI ya existen, devolver un mensaje de error
    if (checkResults[0].count > 0) {
      return res.status(400).send('La dirección o el DNI ya están registrados');
    }

    // Insertar datos en la tabla users
    connection.query(
      insertQuery,
      [apellidos, nombres, direccion, telefono, dni, vivienda, nodo],
      (error, userResults) => {
        if (error) {
          console.error('Error al insertar datos en la tabla users:', error);
          return res.status(500).send('Error al registrar el usuario');
        }

        console.log('Datos insertados correctamente en la tabla users.');





          // Extraer el ID del usuario insertado
          const userId = userResults.insertId;

          // Insertar datos en la tabla servicios
          connection.query(
            insertServiciosQuery,
            [
              userId,
              estado_cable,
              servicio,
              fechaInstalacionValue,
              senal,
              tipo_servicio,
              precio,
              num_decos || null,
              descripcion_catv,
              estado_internet,
              tipo_servicio2,
              instalacionIntValue,
              velocidad,
              precio2,
              tipo_onu,
              MAC,
              usuario,
              contrasena,
              ppp_name,
              ppp_password,
              nro_tarjeta,
              nro_puerto,
              descripcion_int,
              nodo,
              0, // total
              fechaInstalacionValue, // activacion_cable
              null, // corte_cable
              instalacionIntValue, // activacion_internet
              null, // corte_internet
              inscripcion_cable,
              inscripcion_internet,
              costo_materiales_internet,
              costo_materiales_cable
            ],
            (serviciosError, serviciosResults) => {
              if (serviciosError) {
                console.error('Error al insertar datos en la tabla servicios:', serviciosError);
                return res.status(500).send('Error al registrar el servicio');
              }

              console.log('Datos insertados correctamente en la tabla servicios.');

              // Bucle para insertar los datos de decos
              for (let i = 1; i <= num_decos; i++) {
                const cardNumber = req.body[`card_number_${i}`];
                const STBId = req.body[`STB_id_${i}`];
                const nroDeco = req.body[`nro_deco_${i}`];

                // Insertar datos en la tabla decos
                connection.query(
                  insertDecoQuery,
                  [userId, cardNumber, STBId, nroDeco, apellidos, nombres, direccion],
                  (decoError, decoResults) => {
                    if (decoError) {
                      console.error('Error al insertar datos en la tabla decos:', decoError);
                      return res.status(500).send('Error al registrar los decos');
                    }

                    console.log('Datos insertados correctamente en la tabla decos.');
                  }
                );
              }

              const deudasInserts = [];

              // Agregar datos a deudasInserts si existen
              if (inscripcion_cable) {
                const currentDate = fechaInstalacionValue;
                const nombreMes = currentDate ? obtenerNombreMes(new Date(currentDate).getMonth() + 1) : null;
                deudasInserts.push([userId, 'inscripcion_catv', inscripcion_cable, currentDate, nombreMes]);
              }

              if (costo_materiales_cable) {
                const currentDate = fechaInstalacionValue;
                const nombreMes = currentDate ? obtenerNombreMes(new Date(currentDate).getMonth() + 1) : null;
                deudasInserts.push([userId, 'materiales_catv', costo_materiales_cable, currentDate, nombreMes]);
              }

              if (inscripcion_internet) {
                const currentDate = instalacionIntValue;
                const nombreMes = currentDate ? obtenerNombreMes(new Date(currentDate).getMonth() + 1) : null;
                deudasInserts.push([userId, 'inscripcion_int', inscripcion_internet, currentDate, nombreMes]);
              }

              if (costo_materiales_internet) {
                const currentDate = instalacionIntValue;
                const nombreMes = currentDate ? obtenerNombreMes(new Date(currentDate).getMonth() + 1) : null;
                deudasInserts.push([userId, 'materiales_int', costo_materiales_internet, currentDate, nombreMes]);
              }

              // Consulta SQL para insertar datos en la tabla deudas
              const insertDeudasQuery = `
                INSERT INTO deudas (user_id, tipo_deuda, deuda, fecha_deuda, mes_deuda)
                VALUES ?
              `;

              // Ejecutar la consulta para insertar datos en la tabla deudas
              connection.query(insertDeudasQuery, [deudasInserts], (deudasError, deudasResults) => {
                if (deudasError) {
                  console.error('Error al insertar datos en la tabla deudas:', deudasError);
                  return res.status(500).send('Error al registrar las deudas');
                }

                console.log('Datos insertados correctamente en la tabla deudas.');
                res.status(200).send('Usuario y servicios registrados correctamente');
              });
            }
          );
        }
      );
    });
  });



  const hasActiveStatus = (estado_cable, estado_internet) => {
    return estado_cable === 'Act' || estado_internet === 'Act';
  };
  


router.get('/deudasMensuales', requireAuth, async (req, res) => {
  try {
    // Aplicar adelantos en las deudas por usuario antes de obtener los datos de los usuarios
   

    const usersData = await fetchUsersData();
    const deudasData = calculateUserDebts(usersData);

    await insertAndCalculateDebts(deudasData);

    res.render('usersTable', { data: deudasData });
  } catch (error) {
    console.error('Error al obtener deudas:', error);
    res.status(500).send('Error al obtener las deudas');
  }
});





router.get('/users', requireAuth, async (req, res) => {
  try {
    // Aplicar adelantos en las deudas por usuario antes de obtener los datos de los usuarios
    await aplicarAdelantosEnDeudasPorUsuario();
    await actualizarDeudasPosterioresACorte();
    await actualizarPrecioServicios();

await actualizarNodoUsuariosYServicios();


    const usersData = await fetchUsersData();
    const deudasData = calculateUserDebts(usersData);

   

    res.render('usersTable', { data: deudasData });
  } catch (error) {
    console.error('Error al obtener deudas:', error);
    res.status(500).send('Error al obtener las deudas');
  }
});






async function fetchUsersData() {
  const selectQuery = `
    SELECT
      s.user_id,
      u.apellidos,
      u.nombres,
      u.dni,
      u.direccion,
      u.telefono,
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
      (SELECT SUM(d.deuda) FROM deudas d WHERE d.user_id = s.user_id) AS deuda_total
    FROM servicios s
    LEFT JOIN users u ON s.user_id = u.id
  `;

  return new Promise((resolve, reject) => {
    connection.query(selectQuery, (error, results) => {
      if (error) {
        return reject('Error al obtener los datos de la tabla servicios:', error);
      }
      resolve(results);
    });
  });
}

function calculateUserDebts(results) {
  const today = moment().startOf('day');
  const deudasData = [];

  results.forEach(row => {
    const usuario = {
      userId: row.user_id,
      apellidos: row.apellidos,
      nombres: row.nombres,
      dni: row.dni,
      direccion: row.direccion,
      telefono: row.telefono,
      servicio: row.servicio,
      senal: row.senal,
      precioCable: row.precioCable,
      precioInternet: row.precioInternet,
      estado_cable: row.estado_cable,
      num_decos: row.num_decos,
      tipo_servicio2: row.tipo_servicio2,
      velocidad: row.velocidad,
      usuario: row.usuario,
      contrasena: row.contrasena,
      estado_internet: row.estado_internet,
      total: row.deuda_total,
      deudas: []
    };

    if (row.servicio) {
      const deudaCatv = calcularDeuda(row.activacion_cable, row.precioCable, 'catv', row.estado_cable);
      usuario.deudas.push(deudaCatv);
    }

    if (row.tipo_servicio2) {
      const deudaInternet = calcularDeuda(row.activacion_internet, row.precioInternet, 'internet', row.estado_internet);
      usuario.deudas.push(deudaInternet);
    }

    if (usuario.deudas.length > 0) {
      calculateMonthlyDebts(usuario, row, today);
      usuario.deudas.sort((a, b) => moment(a.fechaDeuda, 'DD-MM-YYYY') - moment(b.fechaDeuda, 'DD-MM-YYYY'));
      deudasData.push(usuario);
    }
  });

  return deudasData;
}

function calculateMonthlyDebts(usuario, row, today) {
  if (row.servicio && row.estado_cable !== 'Bt' && moment(row.activacion_cable).isBefore(today)) {
    let nextMonthDateCable = moment(row.activacion_cable).add(1, 'month').startOf('month');
    while (nextMonthDateCable.isBefore(today, 'month') || nextMonthDateCable.isSame(today, 'month')) {
      const deudaInfo = calcularDeuda(nextMonthDateCable, row.precioCable, 'catv');
      deudaInfo.fechaDeuda = nextMonthDateCable.format('DD-MM-YYYY');
      usuario.deudas.push(deudaInfo);
      nextMonthDateCable.add(1, 'month');
    }
  }

  if (row.tipo_servicio2 && row.estado_internet !== 'Bt' && moment(row.activacion_internet).isBefore(today)) {
    let nextMonthDateInternet = moment(row.activacion_internet).add(1, 'month').startOf('month');
    while (nextMonthDateInternet.isBefore(today, 'month') || nextMonthDateInternet.isSame(today, 'month')) {
      const deudaInfo = calcularDeuda(nextMonthDateInternet, row.precioInternet, 'internet');
      deudaInfo.fechaDeuda = nextMonthDateInternet.format('DD-MM-YYYY');
      usuario.deudas.push(deudaInfo);
      nextMonthDateInternet.add(1, 'month');
    }
  }
}




function calcularDeuda(fechaDeuda, precioServicio, tipoDeuda) {
    const fechaDeudaMoment = moment.utc(fechaDeuda).local('+05:00');
    fechaDeudaMoment.locale('es');
    const mesDeuda = fechaDeudaMoment.format('MMMM');
    const diasEnMes = fechaDeudaMoment.daysInMonth();
    const diasConsumidos = fechaDeudaMoment.daysInMonth() - fechaDeudaMoment.date() + 1;
    const deuda = (precioServicio / diasEnMes) * diasConsumidos ;
  
    return {
      fechaDeuda: fechaDeudaMoment.format('DD-MM-YYYY'), // Formato 'YYYY-MM-DD' para almacenar en la base de datos
      mesDeuda,
      deuda,
      tipoDeuda: tipoDeuda
    };
  }
  
  








async function insertAndCalculateDebts(deudasData) {
  for (const usuario of deudasData) {
    for (const deuda of usuario.deudas) {
      const nuevaDeuda = isNaN(deuda.deuda) ? 0 : deuda.deuda;

      const deudaExistenteQuery = `
        SELECT COUNT(*) AS count
        FROM deudas
        WHERE user_id = ? AND fecha_deuda = ? AND tipo_deuda = ?`;

      const result = await queryDatabase(deudaExistenteQuery, [usuario.userId, moment(deuda.fechaDeuda, 'DD-MM-YYYY').toDate(), deuda.tipoDeuda]);

      if (result[0].count === 0) {
        const mesDeuda = moment(deuda.fechaDeuda, 'DD-MM-YYYY').locale('es').format('MMMM');
        const nuevaDeudaConUnDecimal = nuevaDeuda.toFixed(1);
        const queryInsertDeuda = `
          INSERT INTO deudas (user_id, fecha_deuda, mes_deuda, deuda, tipo_deuda)
          VALUES (?, ?, ?, ?, ?)`;

        await queryDatabase(queryInsertDeuda, [usuario.userId, moment(deuda.fechaDeuda, 'DD-MM-YYYY').toDate(), mesDeuda, nuevaDeudaConUnDecimal, deuda.tipoDeuda]);
      }
    }
  }

  const sumaDeudasQuery = `SELECT user_id, SUM(deuda) AS sumaDeudas FROM deudas GROUP BY user_id`;
  const result = await queryDatabase(sumaDeudasQuery);

  for (const row of result) {
    const actualizarDeudaTotalQuery = `UPDATE servicios SET deuda_total = ? WHERE user_id = ?`;
    await queryDatabase(actualizarDeudaTotalQuery, [row.sumaDeudas, row.user_id]);
  }
}

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





async function aplicarAdelantosEnDeudasPorUsuario() {
  try {
    // Consulta para obtener los usuarios con adelantos pendientes
    const usuariosConAdelantoQuery = `
      SELECT DISTINCT user_id
      FROM adelanto
      WHERE monto > 0`;

    const usuariosConAdelanto = await queryDatabase(usuariosConAdelantoQuery);

    for (const usuario of usuariosConAdelanto) {
      const userId = usuario.user_id;

      // Consulta SQL dinámica para actualizar las deudas y los adelantos para el usuario actual
      const actualizarDeudasYAdelantosQuery = `
        UPDATE deudas d
        JOIN adelanto a ON d.user_id = a.user_id
        SET d.deuda = CASE 
                        WHEN d.deuda > a.monto THEN d.deuda - a.monto 
                        ELSE 0 
                      END,
            a.monto = CASE 
                        WHEN d.deuda > a.monto THEN 0 
                        ELSE a.monto - d.deuda 
                      END
        WHERE d.user_id = ? AND d.deuda > 0 AND a.monto > 0`;

      await queryDatabase(actualizarDeudasYAdelantosQuery, [userId]);
    }

    console.log('Adelantos aplicados exitosamente en las deudas por usuario.');
  } catch (error) {
    console.error('Error al aplicar adelantos en las deudas por usuario:', error);
  }
}


async function actualizarDeudasPosterioresACorte() {
  try {
    // Consulta para obtener los usuarios con estado 'Bt' (corte de servicio) y fechas de corte
    const usuariosConCorteQuery = `
      SELECT user_id, corte_cable, corte_internet
      FROM servicios
      WHERE (estado_cable = 'Bt' AND corte_cable IS NOT NULL) 
         OR (estado_internet = 'Bt' AND corte_internet IS NOT NULL)
    `;

    const usuariosConCorte = await queryDatabase(usuariosConCorteQuery);

    // Recorremos a cada usuario que tiene un corte de servicio
    for (const usuario of usuariosConCorte) {
      const userId = usuario.user_id;

      // Si el usuario tiene corte en CATV (cable)
      if (usuario.corte_cable) {
        const fechaCorteCable = moment(usuario.corte_cable);

        // Actualizamos las deudas de CATV con fecha posterior a la fecha de corte
        const actualizarDeudasCATVQuery = `
          UPDATE deudas
          SET deuda = 0
          WHERE user_id = ? AND tipo_deuda = 'catv' AND fecha_deuda > ?
        `;
        
        await queryDatabase(actualizarDeudasCATVQuery, [userId, fechaCorteCable.toDate()]);
      }

      // Si el usuario tiene corte en Internet
      if (usuario.corte_internet) {
        const fechaCorteInternet = moment(usuario.corte_internet);

        // Actualizamos las deudas de Internet con fecha posterior a la fecha de corte
        const actualizarDeudasInternetQuery = `
          UPDATE deudas
          SET deuda = 0
          WHERE user_id = ? AND tipo_deuda = 'internet' AND fecha_deuda > ?
        `;

        await queryDatabase(actualizarDeudasInternetQuery, [userId, fechaCorteInternet.toDate()]);
      }
    }

    console.log('Deudas posteriores a la fecha de corte actualizadas correctamente.');
  } catch (error) {
    console.error('Error al actualizar deudas posteriores a la fecha de corte:', error);
  }
}





async function actualizarPrecioServicios() {
  try {
    // Consulta para actualizar el precio y estado_cable basado en las condiciones especificadas
    const updateQuery = `
      UPDATE servicios
      SET precio = 
        CASE
          WHEN tipo_servicio2 = 'Internet' AND estado_internet = 'Act' AND estado_cable = 'Act' AND velocidad = '100 MB' THEN
            CASE
              WHEN num_decos <= 2 THEN 49
              ELSE 49 + (num_decos - 2) * 12
            END
          WHEN tipo_servicio2 = 'Internet' AND estado_internet = 'Act' AND estado_cable = 'Act' AND velocidad > '100 MB' THEN
            CASE
              WHEN num_decos <= 2 THEN 45
              ELSE 45 + (num_decos - 2) * 12
            END
        END,
      estado_cable = 'Act'
      WHERE tipo_servicio2 = 'Internet' AND estado_internet = 'Act' AND estado_cable = 'Act' 
        AND (precio != 
          CASE
            WHEN tipo_servicio2 = 'Internet' AND estado_internet = 'Act' AND estado_cable = 'Act' AND velocidad = '100 MB' THEN
              CASE
                WHEN num_decos <= 2 THEN 49
                ELSE 49 + (num_decos - 2) * 12
              END
            WHEN tipo_servicio2 = 'Internet' AND estado_internet = 'Act' AND estado_cable = 'Act' AND velocidad > '100 MB' THEN
              CASE
                WHEN num_decos <= 2 THEN 45
                ELSE 45 + (num_decos - 2) * 12
              END
          END
          OR precio IS NULL
        );
    `;

    // Ejecutar la consulta de actualización
    await new Promise((resolve, reject) => {
      connection.query(updateQuery, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });

    console.log('Actualización de precios completada.');

  } catch (error) {
    console.error('Error al actualizar el precio de servicios de Internet:', error);
    throw error; // Propagar el error para manejarlo fuera de esta función si es necesario
  }
}




//ACTUALIZAR NODOS DESPUES DE CREAR UN NODO

async function actualizarNodoUsuariosYServicios() {
  try {
    // Consulta para encontrar coincidencias entre users y nodes y actualizar users y servicios
    const consulta = `
      UPDATE users u
      JOIN nodes n ON u.direccion LIKE CONCAT('%', n.direccion, '%')
      JOIN servicios s ON u.id = s.user_id
      SET u.nodo = n.nodo,
          s.nodo = n.nodo
      WHERE u.nodo = 'nodo desconocido'`;

    // Ejecutar la consulta en la base de datos
    const resultado = await queryDatabase(consulta);

    console.log(`Se han actualizado ${resultado.affectedRows} registros en las tablas users y servicios.`);
  } catch (error) {
    console.error('Error al actualizar los nodos en las tablas users y servicios:', error);
  }
}





router.get('/users/actualizarEstado/:id', requireAuth, async (req, res) => {
  const userId = req.params.id;

  // Consulta SQL para obtener los datos del usuario y servicios
  const selectQuery = `
    SELECT u.*, s.*
    FROM users u
    JOIN servicios s ON u.id = s.user_id
    WHERE u.id = ?`;

  // Ejecutar la consulta a la base de datos
  connection.query(selectQuery, [userId], (error, results) => {
    if (error) {
      console.error('Error al obtener los datos del usuario:', error);
      res.status(500).send('Error al obtener los datos del usuario');
    } else {
      // Comprobar si se encontraron resultados
      if (results.length > 0) {
        const user = results[0];
        res.render('actualizarEstado', { user: user }); // Pasa los datos del usuario a la plantilla
      } else {
        res.send('No se encontró ningún usuario con el ID especificado');
      }
    }
  });
});


const activarServicio = async (user_id, tipo_servicio, fecha_activacion, precio_servicio) => {
  const fecha_activacion_moment = moment.utc(fecha_activacion).local('+05:00');
  fecha_activacion_moment.locale('es');
  const mes_deuda = fecha_activacion_moment.format('MMMM');
  const dias_en_mes = fecha_activacion_moment.daysInMonth();
  const dias_consumidos = dias_en_mes - fecha_activacion_moment.date();
  const deuda = ((precio_servicio / dias_en_mes) * dias_consumidos).toFixed(1);

  // Insertar una nueva entrada de deuda
  const insertar_deuda_query = `
    INSERT INTO deudas (user_id, fecha_deuda, mes_deuda, deuda, tipo_deuda)
    VALUES (?, ?, ?, ?, ?)
  `;

  // Cambiar el tipo_deuda a 'catv' o 'internet'
  const tipo_deuda = tipo_servicio;

  const insertar_valores = [
    user_id,
    fecha_activacion,
    mes_deuda,
    deuda,
    tipo_deuda
   
  ];

  await new Promise((resolve, reject) => {
    connection.query(insertar_deuda_query, insertar_valores, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};

router.post('/users/actualizarEstado', async (req, res) => {
  const {
    user_id,
   
    tipo_servicios,
    estados,
    fecha_activacion_corte,
    motivo
  } = req.body;

  try {
    // Query to check current states
    const checkStateQuery = `
      SELECT estado_cable, estado_internet, precio AS precioCable, precio2 AS precioInternet
      FROM servicios 
      WHERE user_id = ?;
    `;

    const currentState = await new Promise((resolve, reject) => {
      connection.query(checkStateQuery, [user_id], (error, results) => {
        if (error) return reject(error);
        resolve(results[0]);
      });
    });

    // Verify if the service exists
    if ((tipo_servicios === 'catv' && !currentState.estado_cable) ||
        (tipo_servicios === 'internet' && !currentState.estado_internet)) {
      return res.status(400).send('El servicio no existe.');
    }

    // Avoid updating to 'Bt' if already 'Bt'
    if ((tipo_servicios === 'catv' && currentState.estado_cable === 'Bt') ||
        (tipo_servicios === 'internet' && currentState.estado_internet === 'Bt')) {
      if (estados === 'Bt') {
        return res.status(400).send('El servicio ya está cortado.');
      }
    }

    // Prepare the update query and values
    const updateQuery = `
      UPDATE servicios
      SET
        estado_cable = CASE WHEN ? = 'catv' THEN ? ELSE estado_cable END,
        estado_internet = CASE WHEN ? = 'internet' THEN ? ELSE estado_internet END,
        activacion_cable = CASE WHEN ? = 'Act' AND ? = 'catv' THEN ? ELSE activacion_cable END,
        corte_cable = CASE WHEN ? = 'Bt' AND ? = 'catv' THEN ? ELSE corte_cable END,
        activacion_internet = CASE WHEN ? = 'Act' AND ? = 'internet' THEN ? ELSE activacion_internet END,
        corte_internet = CASE WHEN ? = 'Bt' AND ? = 'internet' THEN ? ELSE corte_internet END
      WHERE user_id = ?;
    `;

    const updateValues = [
      tipo_servicios, estados, // estado_cable
      tipo_servicios, estados, // estado_internet
      estados, tipo_servicios, fecha_activacion_corte, // activacion_cable
      estados, tipo_servicios, fecha_activacion_corte, // corte_cable
      estados, tipo_servicios, fecha_activacion_corte, // activacion_internet
      estados, tipo_servicios, fecha_activacion_corte, // corte_internet
      user_id
    ];

    await new Promise((resolve, reject) => {
      connection.query(updateQuery, updateValues, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });

    // Function to update debt
    const actualizarDeuda = async (tipoServicio, fechaCorte) => {
      const fechaInicioMes = moment(fechaCorte).startOf('month').format('YYYY-MM-DD');
      const fechaFinMes = moment(fechaCorte).endOf('month').format('YYYY-MM-DD');

      // Query to get existing debt for the month
      const obtenerDeudaQuery = `
        SELECT deuda, fecha_corte
        FROM deudas 
        WHERE user_id = ? AND tipo_deuda = ? AND fecha_deuda >= ? AND fecha_deuda <= ?
      `;

      const existingDebt = await new Promise((resolve, reject) => {
        connection.query(obtenerDeudaQuery, [user_id, tipoServicio, fechaInicioMes, fechaFinMes], (error, results) => {
          if (error) return reject(error);
          resolve(results[0]);
        });
      });

      if (existingDebt) {
        // Calculate the new debt
        const fechaInicioDeuda = moment(fechaInicioMes, 'YYYY-MM-DD');
        const diasConsumidos = moment(fechaCorte).diff(fechaInicioDeuda, 'days') + 1;
        const nuevaDeuda = ((existingDebt.deuda / fechaInicioDeuda.daysInMonth()) * diasConsumidos).toFixed(1);

        // Update the existing debt
        const updateDeudaQuery = `
          UPDATE deudas
          SET deuda = ?, fecha_corte = ?
          WHERE user_id = ? AND tipo_deuda = ? AND fecha_deuda >= ? AND fecha_deuda <= ?
        `;

        await new Promise((resolve, reject) => {
          connection.query(updateDeudaQuery, [nuevaDeuda, fechaCorte, user_id, tipoServicio, fechaInicioMes, fechaFinMes], (error, results) => {
            if (error) return reject(error);
            resolve(results);
          });
        });
      }

      // Insert a new debt entry for service cut
      const tipoDeudaCorte = tipoServicio === 'catv' ? 'reconexion-catv' : 'reconexion-int';
      const nuevaDeudaCorteFecha = moment(fechaCorte).format('YYYY-MM-DD');
      const nuevaDeudaCorteMes = moment(fechaCorte).locale('es').format('MMMM');
      let nuevaDeudaCorteMonto = 15.00; // Default amount for 'deuda' or 'otro' motivo

      if (motivo === 'solicitud' || motivo === 'viaje') {
        nuevaDeudaCorteMonto = 0; // Set the amount to 0 for 'solicitud' o 'viaje'
      }

      const insertDeudasCorteQuery = `
        INSERT INTO deudas (user_id, fecha_deuda, mes_deuda, deuda, tipo_deuda)
        VALUES (?, ?, ?, ?, ?)
      `;

      const insertCorteValues = [
        user_id,
        nuevaDeudaCorteFecha,
        nuevaDeudaCorteMes,
        nuevaDeudaCorteMonto,
        tipoDeudaCorte
        
      ];

      await new Promise((resolve, reject) => {
        connection.query(insertDeudasCorteQuery, insertCorteValues, (error, results) => {
          if (error) return reject(error);
          resolve(results);
        });
      });
    }

    // If the state is 'Bt'
    if (estados === 'Bt') {
      if (tipo_servicios === 'catv') {
        await actualizarDeuda('catv', fecha_activacion_corte);
      } else if (tipo_servicios === 'internet') {
        await actualizarDeuda('internet', fecha_activacion_corte);
      }
    }

    // If the state is 'Act'
    if (estados === 'Act') {
      if (tipo_servicios === 'catv') {
        await activarServicio(user_id, 'catv', fecha_activacion_corte,  currentState.precioCable);
      } else if (tipo_servicios === 'internet') {
        await activarServicio(user_id, 'internet', fecha_activacion_corte, currentState.precioInternet);
      }
    }

   
   

    // Insert into estados table
    if (fecha_activacion_corte) {
      const insertEstadosQuery = `
        INSERT INTO estados (user_id,  tipo_servicio, fecha_activacion_corte, estado_servicio, motivo)
        VALUES (?, ?, ?, ?, ?);
      `;

      const insertEstadosValues = [user_id, tipo_servicios, fecha_activacion_corte, estados, motivo];

      await new Promise((resolve, reject) => {
        connection.query(insertEstadosQuery, insertEstadosValues, (error, results) => {
          if (error) return reject(error);
          resolve(results);
        });
      });
    }

    // Redirigir a la página de actualización del estado del usuario con el ID especificado
    res.redirect(`/users/actualizarEstado/${user_id}`);

  } catch (error) {
    console.error('Error al actualizar los datos del usuario:', error);
    res.status(500).send('Error al actualizar los datos del usuario');
  }
});



router.get('/user-deudas/:userId', requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Consulta SQL para obtener las deudas de un usuario específico
    const selectDebtsQuery = `
      SELECT *
      FROM deudas
      WHERE user_id = ?`;

    // Consulta SQL para obtener los datos del usuario y servicios
    const selectUserAndServiceQuery = `
      SELECT u.apellidos, u.nombres, u.direccion, u.dni, 
             s.estado_cable, s.corte_cable, s.estado_internet, s.corte_internet, 
             s.fecha_instalacion, s.instalacion_int, SUM(d.deuda) AS deuda_total
      FROM users u
      JOIN servicios s ON u.id = s.user_id
      LEFT JOIN deudas d ON s.user_id = d.user_id
      WHERE u.id = ?
      GROUP BY u.apellidos, u.nombres, u.direccion, u.dni, 
               s.estado_cable, s.corte_cable, s.estado_internet, s.corte_internet, 
               s.fecha_instalacion, s.instalacion_int`;

    // Ejecutar la consulta a la base de datos para obtener las deudas
    connection.query(selectDebtsQuery, [userId], (error, debts) => {
      if (error) {
        console.error('Error al obtener las deudas del usuario:', error);
        res.status(500).send('Error al obtener las deudas del usuario');
        return;
      }
      
      // Ejecutar la consulta a la base de datos para obtener los datos del usuario y servicios
      connection.query(selectUserAndServiceQuery, [userId], (error, user) => {
        if (error) {
          console.error('Error al obtener los datos del usuario:', error);
          res.status(500).send('Error al obtener los datos del usuario');
          return;
        }

        // Renderizar la plantilla HTML con los datos obtenidos de la base de datos
        res.render('userDebts', { userId, user: user[0], debts });
      });
    });
  } catch (error) {
    console.error('Error al obtener las deudas del usuario:', error);
    res.status(500).send('Error al obtener las deudas del usuario');
  }
});





// Ruta GET para obtener los datos del usuario y mostrar el formulario de actualización
router.get('/users/actualizarDatos/:id', requireAuth, async (req, res) => {
  const userId = req.params.id;

  // Consulta SQL para obtener los datos del usuario desde la tabla users
  const selectQuery = 'SELECT * FROM users WHERE id = ?';

  // Ejecutar la consulta a la base de datos
  connection.query(selectQuery, [userId], (error, results) => {
    if (error) {
      console.error('Error al obtener los datos del usuario:', error);
      res.status(500).send('Error al obtener los datos del usuario');
    } else {
      // Comprobar si se encontraron resultados
      if (results.length > 0) {
        const user = results[0];
        res.render('users', { user: user }); // Pasa los datos del usuario a la plantilla
      } else {
        res.send('No se encontró ningún usuario con el ID especificado');
      }
    }
  });
});





router.post('/users/editar/:id', requireAuth, (req, res) => {
  const userId = req.params.id;
  const { apellidos, nombres, direccion, telefono, dni, vivienda, nodo } = req.body;

  const getUserDireccionQuery = 'SELECT direccion FROM users WHERE id = ?';

  connection.query(getUserDireccionQuery, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching user address:', error);
      return res.status(500).send('Error fetching user address');
    }

    if (results.length === 0) {
      return res.status(404).send('User not found');
    }

    const direccionAnterior = results[0].direccion;

    const updateUserQuery = `
      UPDATE users
      SET apellidos = ?, nombres = ?, direccion = ?, telefono = ?, dni = ?, vivienda = ?, nodo = ?
      WHERE id = ?
    `;

    connection.query(
      updateUserQuery,
      [apellidos, nombres, direccion, telefono, dni, vivienda, nodo, userId],
      (error, results) => {
        if (error) {
          console.error('Error updating user data:', error);
          return res.status(500).send('Error updating user data');
        }

        if (results.affectedRows === 0) {
          return res.status(404).send('User not found');
        }

        const insertTrasladoQuery = `
          INSERT INTO traslado (user_id, direccion_anterior, direccion_nueva)
          VALUES (?, ?, ?)
        `;

        connection.query(
          insertTrasladoQuery,
          [userId, direccionAnterior, direccion],
          (error, results) => {
            if (error) {
              console.error('Error logging address change:', error);
              return res.status(500).send('Error logging address change');
            }

            res.redirect('/users'); // Redirige al menú después de actualizar
          }
        );
      }
    );
  });
});

// Ruta GET para obtener los datos del servicio y mostrar el formulario de actualización
app.get('/servicios/actualizarVEL/:id', requireAuth, async (req, res) => {
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
      res.render('actualizar-internet', { user: user, velocidades: velocidadesResults });
    } else {
      res.send('No se encontró ningún servicio con el ID especificado');
    }
  } catch (error) {
    console.error('Error al obtener los datos del servicio y las velocidades:', error);
    res.status(500).send('Error al obtener los datos del servicio y las velocidades');
  }
});




app.post('/servicios/actualizarVEL', async (req, res) => {
  let { user_id, velocidad, precio2, tipo_onu, MAC, usuario, contrasena, ppp_name, ppp_password, nro_tarjeta, nro_puerto, descripcion_int } = req.body;

  try {
    // Consulta para actualizar los datos del servicio de internet en la tabla servicios
    const updateQuery = `
      UPDATE servicios
      SET 
        velocidad = ?,
        precio2 = ?,
        tipo_onu = ?,
        MAC = ?,
        usuario = ?,
        contrasena = ?,
        ppp_name = ?,
        ppp_password = ?,
        nro_tarjeta = ?,
        nro_puerto = ?,
        descripcion_int = ?
      WHERE user_id = ?;
    `;

    // Valores a actualizar en la base de datos
    const updateValues = [
      velocidad,
      precio2,
      tipo_onu,
      MAC,
      usuario,
      contrasena,
      ppp_name,
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

        // Insertar los datos actualizados en la tabla planes_actualizados junto con la fecha actual
        const insertQuery = `
          INSERT INTO planes_actualizados (user_id, velocidad, precio2, tipo_onu, MAC, usuario, contrasena, ppp_name, ppp_password, nro_tarjeta, nro_puerto, descripcion_int, fecha_actualizacion)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW());
        `;

        const insertValues = [
          user_id,
          velocidad,
          precio2,
          tipo_onu,
          MAC,
          usuario,
          contrasena,
          ppp_name,
          ppp_password,
          nro_tarjeta,
          nro_puerto,
          descripcion_int
        ];

        connection.query(insertQuery, insertValues, (insertError, insertResults) => {
          if (insertError) return reject(insertError);

          resolve(results); // Resuelve la promesa principal una vez que todo esté completado
        });
      });
    });

    // Redireccionar a la página del menú o alguna otra página deseada después de la actualización
    res.redirect('/users');

  } catch (error) {
    console.error('Error al actualizar los datos del servicio de internet:', error);
    res.status(500).send('Error al actualizar los datos del servicio de internet');
  }
});





module.exports = router;
