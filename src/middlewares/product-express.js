const { Product } = require('../database/models');



/**
 * Función para validar la existencia de un producto dentro de la colección productos, dado su id
 * @param {integer} productId id del producto
 * @returns {boolean}
 */
const validateProductId = async (productId) => {
   try {
      const product = await Product.findByPk(productId);

      if (!product) {
         throw new Error(`El id: ${productId} no se encuentra en la base de datos`);
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error(`El id: ${productId} no se encuentra en la base de datos`);
   }
}



module.exports = {
   validateProductId
}