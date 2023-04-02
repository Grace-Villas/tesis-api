const { PaymentType } = require('../database/models');
const { capitalize } = require('../helpers/format');



/**
 * Método para validar que exista un tipo de pago, obtener su data y 
 * setearla como parte del request
 * @param {integer} paymentTypeId Id del tipo de pago
 * @param {object} request `requerido` objeto con la data de la petición
 * @param {import('express').Request} request.req
 * @returns {boolean} `bool`
 */
const validatePaymentTypeId = async (paymentTypeId, { req }) => {
   try {
      const type = await PaymentType.findByPk(paymentTypeId);

      if (!type) {
         throw new Error('El id es inválido');
      }

      req.paymentType = type;

      return true;
   } catch (error) {
      console.log(error);
      throw new Error('El id es inválido');
   }
}

/**
 * Función para determinar si fue validado el tipo de pago a crear
 * @param {any} _ Atributo a evaluar
 * @param {object} request `requerido` objeto con la data de la petición
 * @param {import('express').Request} request.req
 * @returns 
 */
const validateHasPaymentType = async (_, { req }) => {
   try {
      if (!req.paymentType) {
         throw new Error('El tipo de pago es obligatorio');
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error('El tipo de pago es obligatorio');
   }
}

/**
 * Método condicional para determinar si es requerido un atributo para crear un método de pago
 * @param {string} attrName Nombre del atributo del modelo PaymentType
 * @returns {boolean}
 */
const isPaymentAttributeRequired = (attrName) => {
   const attribute = `has${capitalize(attrName)}`;
   
   return (_, { req }) => {
      if (req.paymentType[attribute]) {
         return true;
      } else {
         req.body[attrName] = undefined;
         return false;
      }
   }
};



module.exports = {
   validatePaymentTypeId,
   validateHasPaymentType,
   isPaymentAttributeRequired
}