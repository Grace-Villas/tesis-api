

/**
 * Función para darle formato a los roles y permisos de un usuario
 * @param user usuario con sus relaciones de roles y permisos
 * @returns `user` con roles y permisos formateados
 */
const formatUser = (user) => {

   const data = user.get();

   let permissions = {}

   data.userRoles.forEach(({role}) => {
      const privileges = role.rolePermissions.map(per => {
         const { permission, list, create, update, delete: del } = per.get();

         return {
            name: permission.name,
            options: { list, create, update, delete: del }
         }
      });

      privileges.forEach(priv => {
         if (permissions[priv.name]) {
            Object.entries(priv.options).forEach(([key, value]) => {
               if (!permissions[priv.name][key]) {
                  permissions[priv.name][key] = value;
               }
            });
         } else {
            permissions[priv.name] = priv.options;
         }
      });
   });

   return {
      ...data,
      isAdmin: data.companyId ? false : true,
      permissions
   }
}



module.exports = {
   formatUser
}