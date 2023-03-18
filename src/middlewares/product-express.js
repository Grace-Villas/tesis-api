const { Product } = require('../database/models');



/**
 * Función para validar la existencia de un producto dentro de la colección productos, dado su id
 * @param {integer} stateId id del estado
 * @returns {boolean}
 */
const validateProductId = async (countryId) => {
   try {
      const product = await Product.findByPk(countryId);

      if (!product) {
         throw new Error(`El id: ${countryId} no se encuentra en la base de datos`);
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error(`El id: ${countryId} no se encuentra en la base de datos`);
   }
}



module.exports = {
   validateProductId
}