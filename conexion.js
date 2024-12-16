require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs');
const app = express();


const mysql = require('mysql');

const moment = require('moment');

app.use(bodyParser.json());

app.set('view engine', 'ejs'); // Change 'ejs' to your templating engine if different

app.use(express.static(path.join(__dirname, 'estilos')));
app.use(express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'imagenes')));





// Set the views directory
app.set('views', path.join(__dirname, 'views')); // Ensure this points to your views folder

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'server')));

app.use(express.static('public'));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Middleware de autenticación
function requireAuth(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  } else {
    res.redirect('/');
  }
}





app.use(session({
  secret: process.env.SESSION_SECRET ,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));






//conexion.js

const connection = require('./private/db');

const usuarioRouter = require('./routes/crearUsuario'); // Ajusta la ruta según tu estructura
app.use('/', usuarioRouter);

const serviciosRouter = require('./routes/servicios'); // Ajusta la ruta según tu estructura
app.use('/', serviciosRouter);

const almacenRouter = require('./routes/almacen'); // Ajusta la ruta según tu estructura
app.use('/', almacenRouter);


const pagosRouter = require('./routes/pagos'); // Ajusta la ruta según tu estructura
app.use('/', pagosRouter);


const correccionesRouter = require('./routes/correcciones'); // Ajusta la ruta según tu estructura
app.use('/', correccionesRouter);


const graficosRouter = require('./routes/graficos'); // Ajusta la ruta según tu estructura
app.use('/', graficosRouter);


// Middleware para bloquear el acceso a la carpeta 'private'
app.use((req, res, next) => {
  // Verifica si la ruta solicitada contiene la carpeta 'private'
  if (req.path.startsWith('/private')) {
    return res.status(403).send('Acceso denegado');
  }
  next();
});



// Ruta de inicio de sesión (formulario de inicio de sesión)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
  
  // Ruta de inicio de sesión (formulario de inicio de sesión)
  app.get('/login', (req, res) => {
      res.sendFile(__dirname + '/login.html');
    });
  
  



    
// Ruta de inicio de sesión (formulario de inicio de sesión)
app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/login1.html');
  });

  app.post('/login1', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const selectQuery = 'SELECT * FROM login1 WHERE username = ? AND password = ?';
      connection.query(selectQuery, [username, password], async (error, results) => {
        if (error) {
          console.error('Error al ejecutar la consulta:', error);
          res.status(500).send('Error al autenticar al usuario');
        } else {
          if (results.length > 0) {
            req.session.usuario = username;
            req.session.password= password;  // Establece la sesión de usuario_id
            res.redirect('/menu');
          } else {
            res.status(401).send('Credenciales inválidas');
          }
        }
      });
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).send('Error al autenticar al usuario');
    }
  });
  
  
  // Manejar la solicitud POST del formulario de inicio de sesión
  app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Verificar las credenciales en la base de datos
    connection.query('SELECT * FROM login WHERE username = ? AND password = ?', [username, password], (error, results) => {
      if (error) {
        console.error('Error al ejecutar la consulta: ' + error.message);
        return res.status(500).send('Error interno del servidor');
      }
      
      if (results.length > 0) {
        // Usuario autenticado correctamente
        req.session.loggedin = true; // Almacenar información de sesión
        req.session.username = username;
        res.redirect('/mensajes'); // Redirigir a la página principal
      } else {
        // Credenciales inválidas
        res.send('Nombre de usuario o contraseña incorrectos');
      }
    });
  });
  
  app.get('/login', (req, res) => {
      if (req.session.loggedin) {
        res.redirect('/mensajes'); // Redirigir a la ruta de mensajes si el usuario está autenticado
      } else {
        res.send('Debes iniciar sesión para acceder a esta página');
      }
    });



    // Ruta de inicio de sesión (formulario de inicio de sesión)
app.get('/menu', requireAuth, async (req, res) => {
    res.render('menu');
   });
 
 
 


   const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

   // Función para formatear la fecha en español
   function formatarFecha(fecha) {
     const partesFecha = fecha.split(' '); // Suponiendo que la fecha viene como "06 2024"
     const mesNumero = parseInt(partesFecha[0]) - 1; // Convertir el mes a índice del array
     const nombreMes = meses[mesNumero]; // Obtener el nombre del mes en base al índice
     return `${nombreMes} ${partesFecha[1]}`; // Devuelve algo como "junio 2024"
   }
   
   
   
   app.post('/webhook', (req, res) => {
    // Verificar si la solicitud es válida y proviene de Dialogflow
    if (!req.body || !req.body.queryResult) {
      return res.status(400).send('Solicitud no válida');
    }
  
    // Obtener los datos relevantes de la solicitud de Dialogflow
    const intentName = req.body.queryResult.intent.displayName;
    const messageText = req.body.queryResult.queryText;
  
    // Verificar el intent y responder en consecuencia
    if (intentName === 'Saludo y Nombre') {
      // Manejar el intent de saludo y nombre como antes
      const nombreUsuario = req.body.queryResult.parameters['nombre'];
      if (!nombreUsuario) {
        return res.status(400).send('Nombre de usuario no proporcionado');
      }
  
      // Insertar el mensaje en la base de datos como antes
      const insertQuery = 'INSERT INTO mensajes_chatbot (intent, mensaje, fecha) VALUES (?, ?, NOW())';
      const values = [intentName, messageText];
  
      connection.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error('Error al insertar mensaje en la base de datos:', err);
          return res.status(500).send('Error al guardar mensaje en la base de datos');
        }
        console.log('Mensaje guardado en la base de datos');
  
        // Construir la respuesta con las opciones de servicios
        const response = {
          fulfillmentMessages: [
            {
              text: {
                text: [`Saludos, ${nombreUsuario}. ¿En qué podemos ayudarte hoy?`]
              }
            },
            {
              payload: {
                richContent: [
                  [
                    {
                      type: "info",
                      subtitle: "Puedes seleccionar una de estas opciones:"
                    },
                    {
                      type: "list",
                      title: "Servicios",
                      subtitle: "¿Cable, Internet o Duo?",
                      event: {
                        name: "servicios"
                      }
                    },
                    {
                      type: "divider"
                    },
                    {
                      type: "list",
                      title: "Cobertura",
                      event: {
                        name: "cobertura"
                      }
                    },
                    {
                      type: "divider"
                    },
                    {
                      type: "list",
                      title: "Contacto",
                      event: {
                        name: "telefono"
                      }
                    },
                    {
                      type: "divider"
                    },
                    {
                      type: "list",
                      title: "Lista de Canales",
                      event: {
                        name: "grilla"
                      }
                    },
                    {
                      type: "divider"
                    },
                    {
                      type: "list",
                      title: "Medio de Pagos",
                      event: {
                        name: "pagos"
                      }
                    },
                    {
                      type: "divider"
                    },
                    {
                      type: "list",
                      title: "Consulta de Deuda",
                      event: {
                        name: "deuda"
                      }
                    },
                    {
                      type: "divider"
                    },
                    {
                      type: "list",
                      title: "Olvidé mi Wi-Fi",
                      event: {
                        name: "wifi"
                      }  
                      },
                       {
                       type: "divider"
                    },
                    
                     {
                      type: "list",
                      title: "Quiero Contratar un Servicio",
                      event: {
                        name: "contrato"
                      }  
                      },
                       {
                       type: "divider"
                    },
                    {
                      type: "list",
                      title: "Tengo un problema con el servicio",
                      event: {
                        name: "averia"
                      }
                    }
                  ]
                ]
              }
            }
          ]
        };
  
        res.json(response);
      });
    }
    
   
   
    else if (intentName === 'servicios') {
      // Manejar el intent de servicios como antes
      const response = {
        fulfillmentMessages: [
          {
            payload: {
              richContent: [
                [
                  {
                    type: "info",
                    title: "Selecciona a qué distrito perteneces:"
                  },
                  {
                    type: "list",
                    title: "Nasca",
                    event: {
                      name: "nasca",
                      parameters: {
                        name: "nasca"
                      }
                    }
                  },
                  {
                    type: "list",
                    title: "Marcona",
                    event: {
                      name: "marcona",
                      parameters: {
                        name: "marcona"
                      }
                    }
                  },
                  {
                    type: "list",
                    title: "San Juan de Miraflores",
                    event: {
                      name: "sanjuan",
                      parameters: {
                        name: "sanjuan"
                      }
                    }
                  },
                  {
                    type: "list",
                    title: "Villa El Salvador",
                    event: {
                      name: "villaelsalvador",
                      parameters: {
                        name: "villaelsalvador"
                      }
                    }
                  }
                ]
              ]
            }
          }
        ]
      };
  
      res.json(response);
    }else if (intentName === 'averias') {
      // Manejar el intent de averías
      const servicio = req.body.queryResult.parameters['servicio'];
      const comentario = req.body.queryResult.parameters['comentario'];
      const direccion = req.body.queryResult.parameters['direccion'];
      const telefono = req.body.queryResult.parameters['telefono'];
  
      if (!servicio || !comentario || !direccion || !telefono) {
          return res.status(400).send('Información de avería incompleta');
      }
  
      // Insertar el reporte de avería en la base de datos
      const insertAveriaQuery = 'INSERT INTO reportes_averias (servicio, comentario, direccion, telefono, fecha_reporte) VALUES (?, ?, ?, ?, NOW())';
      const averiaValues = [servicio, comentario, direccion, telefono];
  
      connection.query(insertAveriaQuery, averiaValues, (err, result) => {
          if (err) {
              console.error('Error al insertar reporte de avería en la base de datos:', err);
              return res.status(500).send('Error al guardar reporte de avería en la base de datos');
          }
          console.log('Reporte de avería guardado en la base de datos');
  
          // Construir la respuesta de confirmación
          const response = {
              fulfillmentMessages: [
                  {
                      text: {
                          text: [`Gracias por informarnos sobre el problema con el servicio de ${servicio}. Hemos registrado su reporte.`]
                      }
                  }
              ]
          };
  
          res.json(response);
      });
  }
  
    else if (intentName === "contrato") {
   const tipo_servicio = req.body.queryResult.parameters.tipo_servicio;
   const nombre_usuario = req.body.queryResult.parameters.nombre_usuario;
   const direccion = req.body.queryResult.parameters.direccion;
   const telefono = req.body.queryResult.parameters.telefono;

   // Insertar en la base de datos
   const query = `
     INSERT INTO chatbot_contratos (tipo_servicio, nombre_usuario, direccion, telefono)
     VALUES (?, ?, ?, ?)
   `;
   connection.query(query, [tipo_servicio, nombre_usuario, direccion, telefono], (err, result) => {
     if (err) {
       console.error("Error al insertar datos:", err);
       return res.json({
         fulfillmentText: "Hubo un error al registrar tu contrato. Por favor, inténtalo más tarde.",
       });
     }

     console.log("Contrato registrado correctamente:", result);
     return res.json({
       fulfillmentText: `Gracias ${nombre_usuario}, hemos registrado tu contrato para el servicio de ${tipo_servicio}.`,
     });
   });
 } 
    
    else if (intentName === 'consulta_deuda') {
      // Obtener el DNI del usuario desde los parámetros de la solicitud
      const dniUsuario = req.body.queryResult.parameters['dni'];
      if (!dniUsuario) {
        return res.status(400).send('DNI no proporcionado');
      }
  
      console.log('DNI del usuario:', dniUsuario);
  
      // Consultar la deuda del usuario en la base de datos
      const consultaDeuda = `
        SELECT d.tipo_deuda, d.deuda, DATE_FORMAT(d.fecha_deuda, '%m %Y') as fecha_deuda
        FROM deudas d
        INNER JOIN users u ON d.user_id = u.id
        WHERE u.dni = ? AND d.deuda > 0
      `;
  
      console.log('Consulta SQL:', consultaDeuda);
  
      // Ejecutar la consulta en la base de datos
      connection.query(consultaDeuda, [dniUsuario], (err, resultados) => {
        if (err) {
          console.error('Error al consultar la deuda:', err);
          return res.status(500).send('Error al consultar la deuda');
        }
  
        console.log('Resultados de la consulta:', resultados);
  
        if (resultados.length > 0) {
          // Preparar la respuesta con los datos de la deuda
          const deudas = resultados.map(deuda => ({
            tipo_deuda: deuda.tipo_deuda,
            monto_deuda: deuda.deuda,
            fecha_deuda: formatarFecha(deuda.fecha_deuda) // Formatear la fecha aquí
          }));
  
          const response = {
            fulfillmentMessages: [
              {
                text: {
                  text: ['Aquí están tus deudas:']
                }
              },
              {
                text: {
                  text: deudas.map(deuda => `Tipo Servicio: ${deuda.tipo_deuda}, Monto: ${deuda.monto_deuda}, Fecha de la Deuda: ${deuda.fecha_deuda}`)
                }
              },
              {
                payload: {
                  richContent: [
                    [
                      {
                        type: "info",
                        title: "Por el momento no está en funcionamiento esta opción para todos los clientes"
                      }
                    ]
                  ]
                }
              }
            ]
          };
  
          console.log('Respuesta enviada:', response);
          res.json(response);
        } else {
          const response = {
            fulfillmentMessages: [
              {
                text: {
                  text: ['No se encontraron deudas para el DNI proporcionado.']
                }
              },
              {
                payload: {
                  richContent: [
                    [
                      {
                        type: "info",
                        title: "Por el momento no está en funcionamiento esta opción para todos los clientes"
                      }
                    ]
                  ]
                }
              }
            ]
          };
  
          console.log('Respuesta enviada:', response);
          res.json(response);
        }
      });
    } else if (intentName === 'consulta_usuario_contraseña') {
      // Obtener el DNI del usuario desde los parámetros de la solicitud
      const dniUsuario = req.body.queryResult.parameters['dni'];
      if (!dniUsuario) {
        return res.status(400).send('DNI no proporcionado');
      }
  
      console.log('DNI del usuario:', dniUsuario);
  
      // Consultar el usuario y contrasena en la base de datos
      const consultaUsuarioContrasena = `
        SELECT s.usuario, s.contrasena
        FROM servicios s
        INNER JOIN users u ON s.user_id = u.id
        WHERE u.dni = ?
      `;
  
      console.log('Consulta SQL:', consultaUsuarioContrasena);
  
      // Ejecutar la consulta en la base de datos
      connection.query(consultaUsuarioContrasena, [dniUsuario], (err, resultados) => {
        if (err) {
          console.error('Error al consultar usuario y contraseña:', err);
          return res.status(500).send('Error al consultar usuario y contraseña');
        }
  
        console.log('Resultados de la consulta:', resultados);
  
        if (resultados.length > 0) {
          // Preparar la respuesta con los datos de usuario y contraseña
          const servicios = resultados.map(servicio => ({
            usuario: servicio.usuario,
            contrasena: servicio.contrasena
          }));
  
          const response = {
            fulfillmentMessages: [
              {
                text: {
                  text: ['Aquí están los datos de tus servicios:']
                }
              },
              {
                text: {
                  text: servicios.map(servicio => `Usuario: ${servicio.usuario}, Contraseña: ${servicio.contrasena}`)
                }
              },
              {
                payload: {
                  richContent: [
                    [
                      {
                        type: "info",
                        title: "Por el momento no está en funcionamiento esta opción para todos los clientes"
                      }
                    ]
                  ]
                }
              }
            ]
          };
  
          console.log('Respuesta enviada:', response);
          res.json(response);
        } else {
          const response = {
            fulfillmentMessages: [
              {
                text: {
                  text: ['No se encontraron datos para el DNI proporcionado.']
                }
              },
              {
                payload: {
                  richContent: [
                    [
                      {
                        type: "info",
                        title: "Por el momento no está en funcionamiento esta opción para todos los clientes"
                      }
                    ]
                  ]
                }
              }
            ]
          };
  
          console.log('Respuesta enviada:', response);
          res.json(response);
        }
      });
    } else if (intentName === 'solicitar_datos_usuario') {
      const response = {
        fulfillmentMessages: [
          {
            text: {
              text: ['Por favor proporcione su número de teléfono, dirección y detalles del servicio que desea.']
            }
          }
        ]
      };
  
      res.json(response);
    } else if (intentName === 'insertar_o_actualizar_datos_usuario') {
      // Obtener los parámetros de la solicitud
      const telefono = req.body.queryResult.parameters['telefono'];
      const direccion = req.body.queryResult.parameters['direccion'];
      const servicio = req.body.queryResult.parameters['servicio'];
  
      // Validar los datos
      if (!telefono || !direccion || !servicio) {
        return res.status(400).send('Datos incompletos proporcionados');
      }
  
      // Insertar o actualizar los datos en la base de datos
      const upsertQuery = `
        INSERT INTO users (telefono, direccion, servicio, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
        direccion = VALUES(direccion),
        servicio = VALUES(servicio),
        updated_at = NOW()
      `;
  
      const values = [telefono, direccion, servicio];
  
      connection.query(upsertQuery, values, (err, result) => {
        if (err) {
          console.error('Error al insertar o actualizar datos:', err);
          return res.status(500).send('Error al guardar datos en la base de datos');
        }
  
        const response = {
          fulfillmentMessages: [
            {
              text: {
                text: ['Datos actualizados correctamente.']
              }
            }
          ]
        };
  
        res.json(response);
      });
    } else {
      // Manejar otros intents si es necesario
      const response = {
        fulfillmentMessages: [
          {
            text: {
              text: ['Lo siento, no puedo procesar esa solicitud en este momento.']
            }
          }
        ]
      };
  
      res.json(response);
    }
  });
  
  
  
  app.get('/reportes-averias', requireAuth, (req, res) => {
    // Consultar todos los campos de los reportes de averías ordenados por fecha de reporte
    const query = 'SELECT servicio, comentario, direccion, telefono, DATE_FORMAT(fecha_reporte, "%Y-%m-%d %H:%i") AS fecha_reporte FROM reportes_averias ORDER BY fecha_reporte DESC';
    connection.query(query, (error, results) => {
      if (error) {
        console.error('Error al ejecutar la consulta: ' + error.message);
        return res.status(500).send('Error interno del servidor');
      }
  
      // Renderizar la página HTML con los reportes de averías en una tabla
      res.render('reportes_averias', { reportes: results });
    });
  });
  
  

// Ruta para obtener los contratos desde la base de datos
app.get('/contratos', requireAuth, (req, res) => {
  const query = 'SELECT * FROM chatbot_contratos';

  connection.query('SELECT tipo_servicio, nombre_usuario, direccion, telefono, fecha_registro FROM chatbot_contratos', (err, result) => {
    if (err) {
      console.error("Error al obtener contratos:", err);
      return res.json({
        fulfillmentText: "Hubo un error al obtener los contratos. Por favor, inténtalo más tarde.",
      });
    }
  
    // Formatear la fecha de registro en el formato deseado
    result.forEach(contrato => {
      contrato.fecha_registro = moment(contrato.fecha_registro).format('YYYY-MM-DD HH:mm');
    });
  
    // Pasar los contratos a la vista
    res.render('contratos', { contratos: result });
  });
});
   
   app.get('/dialogflow-config', (req, res) => {
    res.json({
      agentId: process.env.DIALOGFLOW_AGENT_ID,
      languageCode: process.env.DIALOGFLOW_LANGUAGE_CODE,
      chatTitle: process.env.DIALOGFLOW_CHAT_TITLE,
    });
  });


  app.get('/logout', (req, res) => {
    // Destruye la sesión
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al cerrar sesión:', err);
        res.status(500).send('Error al cerrar sesión');
      } else {
        res.redirect('/'); // Redirige a la página de inicio de sesióngit status
      }
    });
  });
  


// Ruta para obtener el total de 'cable' desde la columna correspondiente
app.get('/grafico-servicios', requireAuth, (req, res) => {
  const query = `
    SELECT 
      'cable' AS servicio, 
      COUNT(*) AS total
    FROM servicios
    WHERE servicio = 'cable'
  `;
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta: ' + error.message);
      return res.status(500).send('Error interno del servidor');
    }

    // Enviar los datos al frontend para el gráfico
    res.render('grafico_servicios', { data: results });
  });
});



// Escuchar en el puerto especificado en .env o 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});