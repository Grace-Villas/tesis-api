const { Role } = require('../database/models');



/**
 * Método para verificar que exista un rol y se tenga acceso a él.
 * Debe ser usado en conjunto a validateJWT (JsonWebToken)
 * @param {integer} roleId id del rol
 * @param {object} request `requerido` objeto con la data de la petición
 * @param {import('express').Request} request.req
 * @returns {boolean} `bool`
 */
const validateRoleId = async (roleId, { req }) => {
   try {
      const role = await Role.findByPk(roleId);

      const user = req.authUser;

      if (!role) {
         throw new Error('El id es inválido');
      }

      if (role.companyId !== user.companyId) {
         throw new Error('No posee acceso a este rol');
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error('El id es inválido');
   }
}

/**
 * Método para verificar que exista un rol y se pueda hacer uso de él.
 * Debe ser usado en conjunto a validateJWT (JsonWebToken)
 * @param {integer} roleId id del rol
 * @param {object} request `requerido` objeto con la data de la petición
 * @param {import('express').Request} request.req
 * @returns {boolean} `bool`
 */
const validateRoleIdToAllocate = async (roleId, { req }) => {
   try {
      const role = await Role.findByPk(roleId);

      const user = req.authUser;

      if (!role) {
         throw new Error('El id es inválido');
      }

      if (!role.isPublic && (role.companyId !== user.companyId)) {
         throw new Error('No posee acceso a este rol');
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error('El id es inválido');
   }
}



module.exports = {
   validateRoleId,
   validateRoleIdToAllocate
}