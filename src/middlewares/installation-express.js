const validator = require('validator');



/**
 * Método para verificar un número de teléfono. Para esto
 * es necesario que existan los atributos `locale` y `phoneExtension`
 * en el body de la petición
 * `req.body.cityData`
 * @param {string} phone `string` Número de teléfono
 * @param {object} request `requerido` Objeto con la data de la petición
 * @param {import('express').Request} request.req
 * @returns {boolean} `bool`
 */
const validateInstallationPhone = async (phone, { req }) => {
   try {
      const { locale, phoneExtension } = req.body;

      if (!locale) {
         throw new Error('El código local es necesario');
      }

      if (!phoneExtension) {
         throw new Error('La extensión telefónica es necesaria');
      }

      if (!validator.isMobilePhone(`${phoneExtension}${phone}`, locale, { strictMode: true })) {
         throw new Error('El teléfono es inválido');
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error('El teléfono es inválido');
   }
}



module.exports = {
   validateInstallationPhone
}