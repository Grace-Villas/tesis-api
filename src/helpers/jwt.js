const jwt = require('jsonwebtoken');



// Funciones

/**
 * Generar jsonwebtoken para un usuario
 * @param {number} id id del usuario en cuestión
 * @param {string} uuid string uuid del usuario en cuestión
 * @param {string|number|undefined} expiresIn Tiempo de expiración, ejemplo: 60, "2 days", "10h", "7d". Unidad por defecto: ms
 * @returns 
 */
const generateJWT = (id = '', uuid = '', expiresIn = undefined) => {
   return new Promise((resolve, reject) => {
      jwt.sign({ id, uuid }, process.env.SECRETORPRIVATEKEY, {
         // Tiempo de expiración
         expiresIn
      }, (err, token) => {
         if(err) {
            console.log(err);
            reject('No se pudo generar el JWT');
         } else {
            resolve(token);
         }
      });
   });
}



// Exportando funciones
module.exports = {
   generateJWT
}