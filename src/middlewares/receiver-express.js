const { Receiver, Company } = require('../database/models');



/**
 * Método para verificar que exista un destinatario
 * y sea parte de la libreta de destinatarios de una
 * empresa.
 * @param {integer} receiverId `integer` id de la compañía
 * @param {object} request `requerido` objeto con la data de la petición
 * @param {import('express').Request} request.req
 * @returns 
 */
const validateReceiverId = async (receiverId, { req }) => {
   let message = '';

   try {
      const receiver = await Receiver.findByPk(receiverId, {
         include: {
            model: Company,
            as: 'company'
         }
      });

      if (!receiver) {
         message = `El id: ${receiverId} no se encuentra en la base de datos`;
         throw new Error(message);
      }

      const user = req.authUser;

      if (!!user.companyId) {
         if (receiver.companyId != user.companyId) {
            message = `El id: ${receiverId} no pertenece a la compañía`;
            throw new Error(message);
         }
      } else {
         const { companyId } = req.body;
      
         if (!companyId) {
            message = `El id de la compañía es obligatorio`;
            throw new Error(message);
         }

         if (receiver.companyId != companyId) {
            message = `El id: ${receiverId} no pertenece a la compañía`;
            throw new Error(message);
         }
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error(message);
   }
}



module.exports = {
   validateReceiverId,
}