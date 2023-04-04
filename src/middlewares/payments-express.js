const { Payment, PaymentStatus } = require('../database/models');



/**
 * Método para validar que exista un pago y verificar
 * que posea cierto status
 * @param {integer} paymentId Id del pago a validar
 * @param {{status:string,errorMessage:string|undefined}} param1 Objeto de configuración
 * @returns 
 */
const validatePaymentAndHasStatus = async (paymentId, { status, errorMessage }) => {
   let message = '';
   try {
      const payment = await Payment.findByPk(paymentId, {
         include: {
            model: PaymentStatus,
            as: 'status'
         }
      });

      if (!payment) {
         message = `El id: ${paymentId} no se encuentra en la base de datos`;
         throw new Error(message);
      }

      if (payment.status.name != status) {
         if (errorMessage) {
            message = errorMessage;
         } else {
            message = `El status del pago es inválido. Status actual: '${payment.status.name}', status necesario: '${status}'`;
         }

         throw new Error(message);
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error(message);
   }
}

/**
 * 
 * @param {string} attrName 
 * @param  {...string} typesForNeeded 
 * @returns {boolean}
 */
const isPaymentNeededAttribute = (attrName, ...typesForNeeded) => {
   return (_, { req }) => {
      if (typesForNeeded.includes(req.paymentType.name.toLocaleLowerCase())) {
         return true;
      } else {
         req.body[attrName] = undefined;
         return false;
      }
   }
}



module.exports = {
   validatePaymentAndHasStatus,
   isPaymentNeededAttribute
}