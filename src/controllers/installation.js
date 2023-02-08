const { request, response } = require('express');
const bcryptjs = require('bcryptjs');

// Modelos
const { User, UserRole, Role, RolePermission, Permission } = require('../database/models');



// Funciones del controlador

/**
 * Crear un nuevo usuario con privilegios de administrador. 
 * @param {string} firstName string. `body`.
 * @param {string} lastName string. `body`.
 * @param {string} email string, email. `body`.
 * @param {string} password string. `body`
 */
const install = async (req = request, res = response) => {
   try {
      const { firstName, lastName, stringEmail, password } = req.body;

      //Encriptado de contraseña
      const salt = bcryptjs.genSaltSync();
      const hashPassword = bcryptjs.hashSync(password, salt);

      // Obteniendo los diferentes permisos existentes
      const permissions = await Permission.findAll();

      // Data para crear el usuario admin
      const data = {
         firstName,
         lastName,
         email: stringEmail,
         password: hashPassword,
         userRoles: [{
            role: {
               name: 'admin',
               hexColor: '#7367F0',
               isPublic: true,
               rolePermissions: permissions.map(per => ({
                  list: true,
                  create: true,
                  update: true,
                  delete: true,
                  permissionId: per.id
               }))
            }
         }]
      }

      const user = await User.create(data, {
         include: {
            model: UserRole,
            as: 'userRoles',
            include: {
               model: Role,
               as: 'role',
               include: {
                  model: RolePermission,
                  as: 'rolePermissions',
                  include: {
                     model: Permission,
                     as: 'permission'
                  }
               }
            }
         }
      });

      res.json(user);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}


// Exports
module.exports = {
   install
}