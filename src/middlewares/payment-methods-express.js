const { PaymentMethod, PaymentType } = require('../database/models');



/**
 * Método para validar que exista un método de pago, obtener su data y 
 * setear la información del tipo de pago como parte del request
 * @param {integer} paymentTypeId Id del método de pago
 * @param {object} request `requerido` objeto con la data de la petición
 * @param {import('express').Request} request.req
 * @returns {boolean} `bool`
 */
const validatePaymentMethodId = async (paymentMethodId, { req }) => {
   try {
      const method = await PaymentMethod.findByPk(paymentMethodId, {
         include: {
            model: PaymentType,
            as: 'paymentType'
         }
      });

      if (!method) {
         throw new Error('El id es inválido');
      }

      req.paymentType = method.paymentType;

      return true;
   } catch (error) {
      console.log(error);
      throw new Error('El id es inválido');
   }
}



module.exports = {
   validatePaymentMethodId
}