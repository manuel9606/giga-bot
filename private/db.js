require('dotenv').config();
const mysql = require('mysql');

let connection;


// Convertir 3 horas a milisegundos
const timeoutInMillis = 8 * 60 * 60 * 1000; // 3 horas * 60 minutos/hora * 60 segundos/minuto * 1000 milisegundos/segundo


function handleDisconnect() {
  connection = mysql.createConnection({
    host: '144.217.189.135', 
    user: 'cablesur_almacen',
    password: '}k]PL,01!wzz',
    database: 'cablesur_ALMACEN',
    timeout: timeoutInMillis 
  });

  // Conectar a la base de datos
  connection.connect((err) => {
    if (err) {
      console.error('Error al conectar a la base de datos: ' + err.stack);
      setTimeout(handleDisconnect, 2000); 
      return;
    }
    console.log('Conexion a la base de datos exitosa.');
  });
  
  
  


  connection.on('error', (err) => {
    console.error('Error de conexion a la base de datos:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
      handleDisconnect(); 
    } else {
      throw err; 
    }
  });
}


handleDisconnect();


module.exports = connection;
