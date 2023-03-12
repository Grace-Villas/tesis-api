const { request, response } = require('express');
const jwt = require('jsonwebtoken');

const { User, UserRole, Role, RolePermission, Permission, Company } = require('../database/models');

const { formatUser } = require('../helpers/users');


/**
 * Middleware de express para obtener la data del
 * usuario autenticado dado su jwt (JsonWebToken)
 */
const validateJWT = async (req = request, res = response, next) => {
   // Obteniendo token de los parámetros
   const token = req.header('x-token');

   // Si el token no existe
   if (!token) {
      return res.status(401).json({
         errors: [
            {
               value: token,
               msg: 'No existe token en la petición.',
               param: 'token',
               location: 'headers'
            }
         ]
      });
   }

   try {
      // Verificando el token y obteniendo el id del token
      const { uuid, id } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
      
      const authUser = await User.findByPk(id, {
         include: [
            {
               model: Company,
               as: 'company'
            },
            {
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
         ]
      });

      // Verificar status del authUser
      if (!authUser) {
         return res.status(401).json({
            errors: [
               {
                  value: token,
                  msg: 'Token no válido - usuario no existe',
                  param: 'token',
                  location: 'headers'
               }
            ]
         });
      }

      if (authUser.uuid != uuid) {
         return res.status(401).json({
            errors: [
               {
                  value: token,
                  msg: 'Token manipulado',
                  param: 'token',
                  location: 'headers'
               }
            ]
         });
      }

      req.authUser = formatUser(authUser);

      next();

   } catch (error) {
      console.log(error);
      res.status(401).json({
         errors: [
            {
               value: token,
               msg: 'Token no válido. Error de servidor',
               param: 'token',
               location: 'headers'
            }
         ]
      });
   }

}

/**
 * Middleware de express para verificar que el
 * usuario tenga los permisos necesarios para ejecutar un endpoint
 * @param {string} permission `String`. Nombre del permiso necesario
 * @param {string} method `String`. Atributo del permiso necesario
 * @param {boolean} adminNeeded `Boolean`. default: `false`. Ruta para administradores únicamente
 */
const validatePermission = (permission, method, adminNeeded = false) => {
   return (req = request, res = response, next) => {
      const user = req.authUser;

      // Validando que exista el usuario en el request - este middleware es complemento del validar-jwt
      if (!user) {
         return res.status(400).json({
            errors: [
               {
                  msg: 'Esta ruta necesita autenticación de usuario',
                  param: 'token',
                  location: 'headers'
               }
            ]
         });
      }

      const permissions = user.permissions;

      const per = permission.toLocaleLowerCase();

      const meth = method.toLocaleLowerCase();

      // Verificando el rol del usuario
      if (!permissions[per] || !permissions[per][meth] || (adminNeeded && !user.isAdmin)) {
         return res.status(405).json({
            errors: [
               {
                  msg: 'El usuario no posee los privilegios necesarios',
                  param: 'token',
                  location: 'headers'
               }
            ]
         });
      }
      
      next();
   }
}

/**
 * Middleware de express para validar el token generado
 * para restaurar la contraseña de un usuario
 */
const validateResetJWT = async (req = request, res = response, next) => {
   // Obteniendo token de los parámetros
   const token = req.header('x-reset-token');

   // Si el token no existe
   if (!token) {
      return res.status(401).json({
         errors: [
            {
               value: token,
               msg: 'No existe token en la petición.',
               param: 'reset-token',
               location: 'headers'
            }
         ]
      });
   }

   try {
      // Verificando el token y obteniendo el id del token
      const { uuid, id, password } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
      
      const authUser = await User.findByPk(id);

      // Verificar status del authUser
      if (!authUser) {
         return res.status(401).json({
            errors: [
               {
                  value: token,
                  msg: 'Token no válido - usuario no existe',
                  param: 'reset-token',
                  location: 'headers'
               }
            ]
         });
      }

      if (authUser.uuid != uuid) {
         return res.status(401).json({
            errors: [
               {
                  value: token,
                  msg: 'Token manipulado',
                  param: 'reset-token',
                  location: 'headers'
               }
            ]
         });
      }

      if (authUser.password != password) {
         return res.status(401).json({
            errors: [
               {
                  value: token,
                  msg: 'Token usado',
                  param: 'reset-token',
                  location: 'headers'
               }
            ]
         });
      }

      req.userId = authUser.id;

      next();
   } catch (error) {
      console.log(error);
      res.status(401).json({
         errors: [
            {
               value: token,
               msg: 'Token no válido. Error de servidor',
               param: 'reset-token',
               location: 'headers'
            }
         ]
      });
   }

}

const validateSocketToken = (token = '') => {
   try {
      const { id } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

      return {
         ok: true,
         uid: id
      }
   } catch (error) {
      return {
         ok: false
      }
   }
}



module.exports = {
   validateJWT,
   validatePermission,
   validateSocketToken,
   validateResetJWT,
}