const { Permission } = require('../database/models');



/**
 * Método para verificar que exista un permiso.
 * Debe ser usado luego de validar el JWT (JsonWebToken)
 * @param {integer} permissionId id del permiso
 * @param {object} request `requerido` objeto con la data de la petición
 * @param {import('express').Request} request.req
 * @returns {boolean} `bool`
 */
const validatePermissionId = async (permissionId, { req }) => {
   try {
      const permission = await Permission.findByPk(permissionId);

      if (!permission) {
         throw new Error('El id es inválido');
      }

      if (!permission.isPublic && !req.authUser.isAdmin) {
         throw new Error('No puede seleccionar este permiso');
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error('El id es inválido');
   }
}



module.exports = {
   validatePermissionId,
}