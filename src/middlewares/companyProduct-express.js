const { CompanyProduct } = require('../database/models');



/**
 * Función para validar que exista el stock necesario de un producto
 * dentro de la colección company_has_product, dado su id
 * @param {{productId:integer|qty:integer}} productId id del estado
 * @returns {boolean}
 */
const validateStock = async ({productId, qty}) => {
   let message = 'Ha ocurrido un error';

   try {
      const product = await CompanyProduct.findByPk(productId);

      if (!product) {
         message = 'El producto no se encuentra en la base de datos';
         throw new Error(message);
      }

      if (product.stock < qty) {
         message = 'El stock es insuficiente';
         throw new Error(message);
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error(message);
   }
}



module.exports = {
   validateStock
}