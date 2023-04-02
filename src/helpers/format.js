


/**
 * Función para capitalizar la primera letra de un string
 * @param {string} string string a capitalizar
 * @returns {string}
 */
const capitalize = (string) => string.charAt(0).toLocaleUpperCase() + string.slice(1);

/**
 * Función para capitalizar todas las palabras de un texto
 * @param {string} string texto a capitalizar
 * @returns {string} texto capitalizado
 */
const capitalizeAllWords = (string) => {
   const splitted = string.split(' ');

   const formated = splitted.map(word => {
      const first = word.charAt(0).toLocaleUpperCase();
      const rest = word.slice(1);

      return first + rest;
   });

   return formated.join(' ');
}



module.exports = {
   capitalize,
   capitalizeAllWords
}