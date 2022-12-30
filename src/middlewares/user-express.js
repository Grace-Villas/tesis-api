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
   try {
      const user = await User.findByPk(userId);

      const authUser = req.authUser;

      if (!user) {
         throw new Error('El id es inválido');
      }

      if (user.companyId !== authUser.companyId) {
         throw new Error('No posee acceso a este usuario');
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error('El id es inválido');
   }
}



module.exports = {
   validateUserId,
}