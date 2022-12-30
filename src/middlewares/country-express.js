const { Country } = require('../database/models');



/**
 * Función para validar la existencia de un país dentro de la colección países, dado su id
 * @param {integer} stateId id del estado
 * @returns {boolean}
 */
const validateCountryId = async (countryId) => {
   try {
      const country = await Country.findByPk(countryId);

      if (!country) {
         throw new Error(`El id: ${countryId} no se encuentra en la base de datos`);
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error(`El id: ${countryId} no se encuentra en la base de datos`);
   }
}



module.exports = {
   validateCountryId
}