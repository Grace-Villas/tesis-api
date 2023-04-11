const { Role, RolePermission, Permission } = require('../database/models');



/**
 * Función para crear el rol administrador de una compañía
 * @async
 * @param {number} companyId id de la compañía a la que se le creará el rol
 */
const findCompanyAdminRole = async (companyId) => {

   const permissions = await Permission.findAll({
      where: { isPublic: true }
   });

   const data = {
      name: 'admin',
      hexColor: '#7367F0',
      companyId,
      rolePermissions: permissions.map(per => ({
         list: true,
         create: true,
         edit: true,
         delete: true,
         permissionId: per.id
      }))
   }

   const role = await Role.create(data, {
      include: {
         model: RolePermission,
         as: 'rolePermissions',
         include: {
            model: Permission,
            as: 'permission'
         }
      }
   });

   return role;
}



module.exports = {
   findCompanyAdminRole
}