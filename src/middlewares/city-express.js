const validator = require('validator');

const { City, Country, State } = require('../database/models');



/**
 * Método para verificar que exista una ciudad.
 * Almacena la data de la ciudad y sus relaciones con
 * estado y país en `req.body.cityData`
 * @param {integer} cityId id de la ciudad
 * @param {object} request `requerido` objeto con la data de la petición
 * @param {import('express').Request} request.req
 * @returns {boolean} `bool`
 */
const validateCityId = async (cityId, { req }) => {
   try {
      const city = await City.findByPk(cityId, {
         include: {
            model: State,
            as: 'state',
            include: {
               model: Country,
               as: 'country'
            }
         }
      });

      if (!city) {
         throw new Error('El id es inválido');
      }

      req.body.cityData = city;

      return true;
   } catch (error) {
      console.log(error);
      throw new Error('El id es inválido');
   }
}

/**
 * Método para verificar un número de teléfono. Para esto
 * es necesario que exista el atributo cityData en
 * `req.body.cityData`
 * @param {string} phone `string` Número de teléfono
 * @param {object} request `requerido` Objeto con la data de la petición
 * @param {import('express').Request} request.req
 * @returns {boolean} `bool`
 */
const validatePhone = async (phone, { req }) => {
   try {
      const city = req.body.cityData;

      if (!city) {
         return true;
      }

      const { locale, phoneExtension } = city.state.country;

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
   validateCityId,
   validatePhone
}