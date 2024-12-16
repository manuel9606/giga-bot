// Middleware para verificar si el usuario es 'almacen'
function verificarRolAlmacen(req, res, next) {
    if (req.session.usuario) {
      const selectQuery = 'SELECT rol FROM login1 WHERE username = ?';
      connection.query(selectQuery, [req.session.usuario], (error, results) => {
        if (error) {
          console.error('Error al verificar rol:', error);
          return res.status(500).send('Error al verificar rol');
        }
        if (results.length > 0 && results[0].rol === 'almacen') {
          return next(); // El usuario tiene rol 'almacen', continuar con la ruta
        } else {
          return res.status(403).send('Acceso denegado. Rol no autorizado.');
        }
      });
    } else {
      return res.status(401).send('No autenticado. Por favor, inicia sesión.');
    }
  }
  
  // Middleware para verificar si el usuario es 'admin'
  function verificarRolAdmin(req, res, next) {
    if (req.session.usuario) {
      const selectQuery = 'SELECT rol FROM login1 WHERE username = ?';
      connection.query(selectQuery, [req.session.usuario], (error, results) => {
        if (error) {
          console.error('Error al verificar rol:', error);
          return res.status(500).send('Error al verificar rol');
        }
        if (results.length > 0 && results[0].rol === 'admin') {
          return next(); // El usuario tiene rol 'admin', continuar con la ruta
        } else {
          return res.status(403).send('Acceso denegado. Rol no autorizado.');
        }
      });
    } else {
      return res.status(401).send('No autenticado. Por favor, inicia sesión.');
    }
  }
  
  // Middleware para verificar si el usuario es 'empleado'
  function verificarRolEmpleado(req, res, next) {
    if (req.session.usuario) {
      const selectQuery = 'SELECT rol FROM login1 WHERE username = ?';
      connection.query(selectQuery, [req.session.usuario], (error, results) => {
        if (error) {
          console.error('Error al verificar rol:', error);
          return res.status(500).send('Error al verificar rol');
        }
        if (results.length > 0 && results[0].rol === 'empleado') {
          return next(); // El usuario tiene rol 'empleado', continuar con la ruta
        } else {
          return res.status(403).send('Acceso denegado. Rol no autorizado.');
        }
      });
    } else {
      return res.status(401).send('No autenticado. Por favor, inicia sesión.');
    }
  }
  
  module.exports = { verificarRolAlmacen, verificarRolAdmin, verificarRolEmpleado };
  