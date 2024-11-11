


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
  
  
  

  // Consulta SQL para verificar si la dirección ya existe
  const checkAddressQuery = `
    SELECT COUNT(*) AS count
    FROM users
    WHERE direccion = ?
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
      fecha_instalacion  -- Agregar fecha_instalacion a la inserción
    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())  -- Utilizar CURDATE() para la fecha actual
  `;

  // Variables para determinar si las fechas deben ser NULL
  const fechaInstalacionValue = fecha_instalacion || null;
  const instalacionIntValue = instalacion_int || null;

  // Ejecutar la consulta para verificar si la dirección ya existe
  connection.query(checkAddressQuery, [direccion], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error al verificar la dirección:', checkError);
      return res.status(500).send('Error al verificar la dirección');
    }

    // Si la dirección ya existe, devolver un mensaje de error
    if (checkResults[0].count > 0) {
      return res.status(400).send('La dirección ya existe');
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

              // Redireccionar a la página del menú
              res.render('menu');
            });
          }
        );
      }
    );
  });
});




router.get('/users', requireAuth, async (req, res) => {
  try {
    // Aplicar adelantos en las deudas por usuario antes de obtener los datos de los usuarios
    await aplicarAdelantosEnDeudasPorUsuario();
    await eliminarDeudasPosterioresACortePorServicio();
    await actualizarPrecioServicios();

await actualizarNodoUsuariosYServicios();


    const usersData = await fetchUsersData();
    const deudasData = calculateUserDebts(usersData);

    await insertAndCalculateDebts(deudasData);

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


async function eliminarDeudasPosterioresACortePorServicio() {
  try {
    // Consulta para obtener los usuarios con estados y fechas de corte específicas para CATV e Internet
    const usuariosConCorteQuery = `
      SELECT user_id, corte_cable, corte_internet, estado_cable, estado_internet
      FROM servicios
      WHERE (estado_cable = 'Bt' AND corte_cable IS NOT NULL) 
         OR (estado_internet = 'Bt' AND corte_internet IS NOT NULL)`;

    const usuariosConCorte = await queryDatabase(usuariosConCorteQuery);

    for (const usuario of usuariosConCorte) {
      const userId = usuario.user_id;

      if (usuario.estado_cable === 'Bt' && usuario.corte_cable) {
        const fechaCorteCable = moment(usuario.corte_cable);
        const obtenerDeudasCATVQuery = `
          SELECT user_id, fecha_deuda, tipo_deuda
          FROM deudas
          WHERE user_id = ? AND fecha_deuda > ? AND tipo_deuda = 'catv'`;

        const deudasCATV = await queryDatabase(obtenerDeudasCATVQuery, [userId, fechaCorteCable.toDate()]);

        if (deudasCATV.length > 0) {
          const insertarAuditoriaCATVQuery = `
            INSERT INTO auditoria_deudas (user_id, fecha_deuda, tipo_deuda)
            VALUES (?, ?, ?)`;

          for (const deuda of deudasCATV) {
            await queryDatabase(insertarAuditoriaCATVQuery, [deuda.user_id, deuda.fecha_deuda, deuda.tipo_deuda]);
          }

          const eliminarDeudasCATVQuery = `
            DELETE FROM deudas
            WHERE user_id = ? AND fecha_deuda > ? AND tipo_deuda = 'catv'`;

          await queryDatabase(eliminarDeudasCATVQuery, [userId, fechaCorteCable.toDate()]);
        }
      }

      if (usuario.estado_internet === 'Bt' && usuario.corte_internet) {
        const fechaCorteInternet = moment(usuario.corte_internet);
        const obtenerDeudasInternetQuery = `
          SELECT user_id, fecha_deuda, tipo_deuda
          FROM deudas
          WHERE user_id = ? AND fecha_deuda > ? AND tipo_deuda = 'internet'`;

        const deudasInternet = await queryDatabase(obtenerDeudasInternetQuery, [userId, fechaCorteInternet.toDate()]);

        if (deudasInternet.length > 0) {
          const insertarAuditoriaInternetQuery = `
            INSERT INTO auditoria_deudas (user_id, fecha_deuda, tipo_deuda)
            VALUES (?, ?, ?)`;

          for (const deuda of deudasInternet) {
            await queryDatabase(insertarAuditoriaInternetQuery, [deuda.user_id, deuda.fecha_deuda, deuda.tipo_deuda]);
          }

          const eliminarDeudasInternetQuery = `
            DELETE FROM deudas
            WHERE user_id = ? AND fecha_deuda > ? AND tipo_deuda = 'internet'`;

          await queryDatabase(eliminarDeudasInternetQuery, [userId, fechaCorteInternet.toDate()]);
        }
      }
    }

    console.log('Deudas eliminadas y registradas en auditoría exitosamente para servicios con fecha de corte.');
  } catch (error) {
    console.error('Error al eliminar deudas posteriores a la fecha de corte:', error);
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









module.exports = router;
