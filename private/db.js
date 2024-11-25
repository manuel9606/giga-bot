
//private/db.js


const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 10000  // Ajusta el tiempo de espera para la conexión (10 segundos)
});

connection.connect((error) => {
  if (error) {
    console.error('Error al conectar con la base de datos:', error);
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
});

module.exports = connection;
