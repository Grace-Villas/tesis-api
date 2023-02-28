const { request, response } = require('express');
const bcryptjs = require('bcryptjs');

// Modelos
const { User, UserRole, Role, RolePermission, Permission } = require('../database/models');

const { generateJWT } = require('../helpers/jwt');
const { installationMailer } = require('../helpers/mailing');
const { capitalizeAllWords } = require('../helpers/format');



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
         firstName: firstName.toLocaleLowerCase(),
         lastName: lastName.toLocaleLowerCase(),
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
                  edit: true,
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

      await installationMailer({
         to: stringEmail,
         subject: '¡Bienvenido a LogisticsChain!'
      }, {
         fullName: capitalizeAllWords(user.fullName),
         password
      });

      // Generar JWT
      const token = await generateJWT(user.id, user.uuid);

      res.json({
         user,
         token
      });
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Verificar si fue o no instalado el sistema
 */
const verifyInstallation = async (req = request, res = response) => {
   try {
      const usersCount = await User.count({ paranoid: false });

      if (usersCount > 0) {
         return res.json({ isInstalled: true });
      }

      res.json({ isInstalled: false })
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}


// Exports
module.exports = {
   install,
   verifyInstallation
}