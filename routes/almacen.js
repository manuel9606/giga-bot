const express = require('express');
const router = express.Router();


const ejs = require('ejs');


const mysql = require('mysql');


const session = require('express-session');
const bodyParser = require('body-parser');



router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

// Middleware para verificar si el usuario es 'almacen'
function verificarRolAlmacen(req, res, next) {
  if (req.session.usuario) {
    const selectQuery = 'SELECT rol FROM login1 WHERE username = ?';
    connection.query(selectQuery, [req.session.usuario], (error, results) => {
      if (error) {
        console.error('Error al verificar rol:', error);
        return res.status(500).send('Error al verificar rol');
      }
      if (results.length > 0 && (results[0].rol === 'almacen' || results[0].rol === 'admin')) {
        return next(); // El usuario tiene rol 'almacen' o 'admin', continuar con la ruta
      } else {
        return res.status(403).send('Acceso denegado. Rol no autorizado.');
      }
    });
  } else {
    res.redirect('/');  // Redirige al inicio si no está autenticado
  }
}

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





router.get('/almacen',  requireAuth, verificarRolAlmacen, async (req, res) => {
  res.render('almacen'); // 'formularioAlmacen' es el nombre de la plantilla para el formulario
});




router.post('/almacen', requireAuth, async (req, res) => {
  const { nombreMaterial, cantidad, fechaIngreso, descripcion, unidades } = req.body;

  try {
    let descripcionInput = descripcion;
    if (!descripcion) {
      descripcionInput = null;
    }

    // Consulta SQL para insertar los datos en la tabla almacen
    const insertAlmacenQuery = `
      INSERT INTO almacen (nombreMaterial, cantidad, fecha_ingreso, descripcion, unidades) 
      VALUES (?, ?, ?, ?, ?)
    `;

    // Ejecutar la consulta SQL para insertar en la tabla almacen
    connection.query(
      insertAlmacenQuery,
      [nombreMaterial, cantidad, fechaIngreso, descripcionInput, unidades],
      (error, results) => {
        if (error) {
          console.error('Error al insertar datos en la tabla Almacen:', error);
          return res.status(500).send('Error al guardar los datos de materiales en el almacén');
        }

        console.log('Datos insertados correctamente en la tabla Almacen.');

        // Consulta SQL para insertar los mismos datos en la tabla materiales
        const insertMaterialesQuery = `
          INSERT INTO materiales (nombreMaterial, cantidad, fecha_ingreso, descripcion, unidades) 
          VALUES (?, ?, ?, ?, ?)
        `;

        // Ejecutar la consulta SQL para insertar en la tabla materiales
        connection.query(
          insertMaterialesQuery,
          [nombreMaterial, cantidad, fechaIngreso, descripcionInput, unidades],
          (error, results) => {
            if (error) {
              console.error('Error al insertar datos en la tabla Materiales:', error);
              return res.status(500).send('Error al guardar los datos de materiales');
            }

            console.log('Datos insertados correctamente en la tabla Materiales.');
            res.redirect('/almacen');
          }
        );
      }
    );
  } catch (error) {
    console.error('Error al guardar los datos de materiales:', error);
    res.status(500).send('Error al guardar los datos de materiales en el almacén');
  }
});





router.get('/materiales', requireAuth,verificarRolAlmacen, (req, res) => {
  // Consulta SQL para obtener los datos del almacén
  const selectQuery = 'SELECT * FROM almacen';

  // Ejecutar la consulta a la base de datos
  connection.query(selectQuery, (error, results) => {
    if (error) {
      console.error('Error al obtener los datos del almacén:', error);
      res.status(500).send('Error al obtener los datos del almacén');
    } else {
      // Renderizar la plantilla HTML con los datos obtenidos de la base de datos
      res.render('Materiales', { materiales: results });

    }
  });
});


router.get('/materialesIngreso', requireAuth,verificarRolAlmacen, (req, res) => {
 // Consulta SQL para obtener los datos del almacén
 const selectQuery = 'SELECT * FROM materiales';

 // Ejecutar la consulta a la base de datos
 connection.query(selectQuery, (error, results) => {
   if (error) {
     console.error('Error al obtener los datos del almacén:', error);
     res.status(500).send('Error al obtener los datos del almacén');
   } else {
     // Renderizar la plantilla HTML con los datos obtenidos de la base de datos
     res.render('MaterialesIngreso', { materiales: results });

   }
 });
});


router.post('/entrega-materiales', requireAuth, async (req, res) => {
  const { nombreMaterial, cantidadEntregada, unidades, fechaSalida, responsable, descripcion, destino } = req.body;

  try {
    let descripcionInput = descripcion;
    if (!descripcion) {
      descripcionInput = null;
    }

    // Consulta SQL para actualizar los datos en la tabla almacen
    const updateQuery = `
    UPDATE almacen 
    SET 
      cantidad = cantidad - ?,
      descripcion = ?
    WHERE nombreMaterial = ?;
  `;
  
  // Ejecutar la consulta SQL para actualizar en la tabla almacen
  connection.query(
    updateQuery,
    [cantidadEntregada, descripcionInput, nombreMaterial],
    (error, updateResults) => {
      if (error) {
        console.error('Error al actualizar datos en la tabla Almacen:', error);
        return res.status(500).send('Error al actualizar los datos del material');
      }

        // Consulta SQL para insertar los datos en la tabla Entregas
        const insertQuery = `
          INSERT INTO Entregas (nombreMaterial, cantidadEntregada, unidades, fechaSalida, responsable, descripcion, destino)
          VALUES (?, ?, ?, ?, ?, ?, ?);
        `;

        // Ejecutar la consulta SQL para insertar en la tabla Entregas
        connection.query(
          insertQuery,
          [nombreMaterial, cantidadEntregada, unidades, fechaSalida, responsable, descripcionInput, destino],
          (error, insertResults) => {
            if (error) {
              console.error('Error al insertar datos en la tabla Entregas:', error);
              return res.status(500).send('Error al guardar los datos de la entrega');
            }

            console.log('Datos insertados correctamente en la tabla Entregas.');
            res.redirect('/materiales');
          }
        );
      }
    );
  } catch (error) {
    console.error('Error al actualizar los datos del material:', error);
    res.status(500).send('Error al actualizar los datos del material');
  }
});


  
 router.get('/entrega-materiales', requireAuth, verificarRolAlmacen, (req, res) => {
 
   // Consulta SQL para obtener los datos del almacén
 const selectQuery = 'SELECT * FROM almacen';

  // Ejecutar la consulta a la base de datos
 connection.query(selectQuery, (error, results) => {
  if (error) {
    console.error('Error al obtener los datos del almacén:', error);
    res.status(500).send('Error al obtener los datos del almacén');
  } else {
    // Renderizar la plantilla HTML con los datos obtenidos de la base de datos
    res.render('EntregaMateriales', { materiales: results });

  }
});

});


router.get('/almacen/actualizar/:id', requireAuth, (req, res) => {
  const materialId = req.params.id;

  // Consulta SQL para obtener los datos del material
  const selectQuery = 'SELECT * FROM almacen WHERE id = ?';

  // Ejecutar la consulta a la base de datos
  connection.query(selectQuery, materialId, (error, results) => {
    if (error) {
      console.error('Error al obtener los datos del material:', error);
      res.status(500).send('Error al obtener los datos del material');
    } else {
      // Comprobar si se encontraron resultados
      if (results.length > 0) {
        const material = results[0];
        res.render('actualizarMaterial', { material: material }); // Pasa los datos del material a la plantilla
      } else {
        res.send('No se encontró ningún material con el ID especificado');
      }
    }
  });
});




router.post('/almacen/actualizar', requireAuth, async (req, res) => {
  const { id, nombreMaterial, cantidad, fechaIngreso, descripcion, unidades } = req.body;

  try {
    let descripcionInput = descripcion;
    if (!descripcion) {
      descripcionInput = null;
    }

    // Consulta SQL para actualizar los datos en la tabla Almacen
    const updateQuery = `
      UPDATE almacen 
      SET 
        nombreMaterial = ?,
        cantidad = ?,
        fecha_ingreso = ?,
        descripcion = ?,
        unidades = ?
      WHERE id = ?;
    `;

    // Ejecutar la consulta SQL para actualizar en la tabla Almacen
    connection.query(
      updateQuery,
      [nombreMaterial, cantidad, fechaIngreso, descripcionInput, unidades, id],
      (error, results) => {
        if (error) {
          console.error('Error al actualizar los datos del material:', error);
          return res.status(500).send('Error al actualizar los datos del material');
        }
        console.log('Datos actualizados correctamente en la tabla Almacen.');
        res.redirect('/materiales');
      }
    );
  } catch (error) {
    console.error('Error al actualizar los datos del material:', error);
    res.status(500).send('Error al actualizar los datos del material');
  }
});

router.post('/almacen/eliminar', requireAuth, (req, res) => {
  const materialId = req.body.materialId;

  // Consulta SQL para eliminar el material de la tabla Almacen
  const deleteQuery = `DELETE FROM almacen WHERE id = ?`;

  // Ejecutar la consulta SQL para eliminar el material
  connection.query(deleteQuery, materialId, (error, results) => {
      if (error) {
          console.error('Error al eliminar el material del almacén:', error);
          return res.status(500).send('Error al eliminar el material del almacén');
      }
      console.log('Material eliminado correctamente del almacén.');
      res.redirect('/materiales');
  });
});










router.get('/entregas', requireAuth, verificarRolAlmacen, (req, res) => {
  const selectQuery = 'SELECT * FROM Entregas';

  connection.query(selectQuery, (error, results) => {
    if (error) {
      console.error('Error al obtener los datos de las entregas:', error);
      res.status(500).send('Error al obtener los datos de las entregas');
    } else {
      const entregas = results; // Aquí no necesitas acceder a result.recordset, ya que `results` ya contiene los resultados de la consulta
      res.render('Entregas', { entregas: entregas });
    }
  });
});





router.get('/ver-entregas-materiales', requireAuth, verificarRolAlmacen, (req, res) => {
  const selectQuery = 'SELECT * FROM Entregas';

  connection.query(selectQuery, (error, results) => {
    if (error) {
      console.error('Error al obtener las entregas de materiales:', error);
      res.status(500).send('Error al obtener las entregas de materiales');
    } else {
      const entregas = results;
      let totalPorFecha = {};

      entregas.forEach(entrega => {
          const fechaSalida = new Date(entrega.fechaSalida).toISOString().split('T')[0];
          if (!totalPorFecha[fechaSalida]) {
              totalPorFecha[fechaSalida] = {};
          }
          if (!totalPorFecha[fechaSalida][entrega.nombreMaterial]) {
              totalPorFecha[fechaSalida][entrega.nombreMaterial] = 0;
          }
          totalPorFecha[fechaSalida][entrega.nombreMaterial] += entrega.cantidadEntregada;
      });

      res.render('verMateriales', { entregas: entregas, totalPorFecha: totalPorFecha });
    }
  });
});



router.get('/materiales-dia', requireAuth, verificarRolAlmacen,(req, res) => {
  const selectQuery = 'SELECT * FROM Entregas';

  connection.query(selectQuery, (error, results) => {
    if (error) {
      console.error('Error al obtener las entregas de materiales por día:', error);
      res.status(500).send('Error al obtener las entregas de materiales por día');
    } else {
      const entregas = results;
      let totalPorFecha = {};

      entregas.forEach(entrega => {
        const fechaSalida = new Date(entrega.fechaSalida).toISOString().split('T')[0];
        if (!totalPorFecha[fechaSalida]) {
          totalPorFecha[fechaSalida] = {};
        }
        if (!totalPorFecha[fechaSalida][entrega.nombreMaterial]) {
          totalPorFecha[fechaSalida][entrega.nombreMaterial] = 0;
        }
        totalPorFecha[fechaSalida][entrega.nombreMaterial] += entrega.cantidadEntregada;
      });

      const selectedDate = req.query.fecha; // Obtener la fecha seleccionada del query string

      let materialesPorDia = [];
      if (selectedDate && totalPorFecha[selectedDate]) {
        for (const material in totalPorFecha[selectedDate]) {
          materialesPorDia.push({ 
            nombreMaterial: material, 
            cantidad: totalPorFecha[selectedDate][material],
            responsable: entregas.find(entrega => entrega.nombreMaterial === material && new Date(entrega.fechaSalida).toISOString().split('T')[0] === selectedDate).responsable,
            destino: entregas.find(entrega => entrega.nombreMaterial === material && new Date(entrega.fechaSalida).toISOString().split('T')[0] === selectedDate).destino
          });
        }
      }

      res.render('MaterialesDia', { materialesPorDia: materialesPorDia });
    }
  });
});



router.get('/materiales-responsable', requireAuth,verificarRolAlmacen, (req, res) => {
  const selectedResponsable = req.query.responsable; // Obtener el responsable seleccionado del query string

  let query = 'SELECT * FROM Entregas';
  let params = [];

  if (selectedResponsable) {
    query += ' WHERE responsable = ?';
    params.push(selectedResponsable);
  }

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error('Error al obtener los materiales por responsable:', error);
      res.status(500).send('Error al obtener los materiales por responsable');
    } else {
      const materialesPorResponsable = results.map(entrega => {
        const fechaSalida = new Date(entrega.fechaSalida);
        const formattedFechaSalida = `${fechaSalida.getDate()}-${fechaSalida.getMonth() + 1}-${fechaSalida.getFullYear()}`;
        return {
          fechaSalida: formattedFechaSalida,
          nombreMaterial: entrega.nombreMaterial,
          cantidad: entrega.cantidadEntregada,
          destino: entrega.destino
        };
      });

      let responsablesQuery = 'SELECT DISTINCT responsable FROM Entregas';
      connection.query(responsablesQuery, (error, responsablesResult) => {
        if (error) {
          console.error('Error al obtener los responsables:', error);
          res.status(500).send('Error al obtener los responsables');
        } else {
          const responsables = responsablesResult.map(record => record.responsable);
          res.render('MaterialesResponsable', { 
            responsables: responsables, 
            materialesPorResponsable: materialesPorResponsable,
            selectedResponsable: selectedResponsable 
          });
        }
      });
    }
  });
});

module.exports = router;