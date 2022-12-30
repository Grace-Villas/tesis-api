

/**
 * Función para generar una contraseña aleatoria entre letras y números.
 * @param {integer} length `integer`. cantidad de caracteres de la contraseña. default: 8.
 * @returns {string} contraseña aleatoria que contiene números y letras mayúsculas y minúsculas
 */
const generatePassword = (length = 8) => {
   const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

   let password = "";

   for (let i = 0; i < length; ++i) {
      password += charset.charAt(Math.round(Math.random() * charset.length));
   }

   return password;
}



module.exports = {
   generatePassword,
}