const { User } = require('../database/models');



/**
 * Método para verificar que exista un usuario y se tenga acceso a él.
 * Debe ser usado en conjunto a validateJWT (JsonWebToken)
 * @param {integer} userId id del usuario
 * @param {object} request `requerido` objeto con la data de la petición
 * @param {import('express').Request} request.req
 * @returns {boolean} `bool`
 */
const validateUserId = async (userId, { req }) => {
   let message = '';

   try {
      const user = await User.findByPk(userId);

      const authUser = req.authUser;

      if (!user) {
         message = 'El id es inválido';
         throw new Error(message);
      }

      if (user.companyId !== authUser.companyId) {
         message = 'No posee acceso a este usuario';
         throw new Error(message);
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error(message);
   }
}

/**
 * Método para verificar que exista un usuario y sea administrador.
 * @param {integer} userId id del usuario
 * @returns {boolean} `bool`
 */
const validateAdminId = async (userId) => {
   let message = '';
   
   try {
      const user = await User.findByPk(userId);

      if (!user) {
         message = 'El id es inválido';
         throw new Error(message);
      }

      if (user.companyId) {
         message = 'El usuario no es un administrador';
         throw new Error(message);
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error(message);
   }
}



module.exports = {
   validateUserId,
   validateAdminId
}