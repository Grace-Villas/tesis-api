const { request, response } = require('express');
const { Op, fn, where: seqWhere, col } = require('sequelize');
const bcryptjs = require('bcryptjs');

// Modelos
const { User, UserRole, Role, RolePermission, Permission, Company } = require('../database/models');

// Helpers
const { generateJWT, generateResetJWT } = require('../helpers/jwt');
const { formatUser } = require('../helpers/users');
const { userRegistrationMailer, passwordRecoveryMailer } = require('../helpers/mailing');
const { getIpAdress } = require('../helpers/ip-adress');
const { capitalizeAllWords } = require('../helpers/format');
const CompanyConfig = require('../helpers/config');



// Eager loading
const eLoad = [
   {
      model: UserRole,
      as: 'userRoles',
      include: {
         model: Role,
         as: 'role'
      }
   }
];



// Funciones del controlador

/**
 * Crear un nuevo usuario. Perteneciente a una compañía cliente
 * @param {string} firstName string. `body`.
 * @param {string} lastName string. `body`.
 * @param {string} email string, email. `body`.
 * @param {string} password string. `body`.
 */
const create = async (req = request, res = response) => {
   try {
      const { firstName, lastName, stringEmail, password } = req.body;

      const authUser = req.authUser;

      //Encriptado de contraseña
      const salt = bcryptjs.genSaltSync();
      const hashPassword = bcryptjs.hashSync(password, salt);

      const data = {
         firstName: firstName.toLocaleLowerCase(),
         lastName: lastName.toLocaleLowerCase(),
         email: stringEmail,
         password: hashPassword,
         companyId: authUser.companyId
      }

      const [user, company] = await Promise.all([
         User.create(data),
         Company.findByPk(authUser.companyId)
      ]);

      const config = CompanyConfig.instance();

      await userRegistrationMailer({
         from: `'${config.get('companyName').value}' <${config.get('companyEmail').value}>`,
         to: stringEmail,
         subject: `¡Bienvenido a ${config.get('companyName').value}!`
      }, {
         companyName: config.get('companyName').value,
         userName: capitalizeAllWords(user.fullName),
         clientName: capitalizeAllWords(company.name),
         password
      });

      res.json(user);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Listar usuarios registrados.
 * @param {string} name string, filtro de búsqueda. `query`
 * @param {string} email string, filtro de búsqueda. `query`
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { name, email, skip = 0, limit } = req.query;

      let where = {}

      const user = req.authUser;

      if (typeof name != 'undefined') {
         where.name = seqWhere(fn('concat', col('firstName'), ' ', col('lastName')), { [Op.substring]: name })
      }

      if (typeof email != 'undefined') {
         where.email = { [Op.substring]: email };
      }

      where.companyId = user.isAdmin ? { [Op.is]: null } : user.companyId

      if (limit) {
         const { rows, count } = await User.findAndCountAll({
            where,
            include: eLoad,
            distinct: true,
            offset: Number(skip),
            limit: Number(limit),
            order: [
               ['firstName', 'ASC'],
               ['lastName', 'ASC']
            ]
         });

         const pages = Math.ceil(count / Number(limit));

         res.json({
            rows,
            count,
            pages
         });
      } else {
         const users = await User.findAll({
            where,
            include: eLoad,
            order: [
               ['firstName', 'ASC'],
               ['lastName', 'ASC']
            ]
         });
   
         res.json(users);
      }
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Obtener un usuario dado su id.
 * @param {integer} id integer. `params`
 */
const findById = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const authUser = req.authUser;
      
      const user = await User.findByPk(id, {
         include: eLoad
      });

      if (!user || (user.companyId !== authUser.companyId)) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: `El id: ${id} no se encuentra en la base de datos`,
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      res.json(user);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Eliminar un usuario dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndDelete = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const authUser = req.authUser;

      const user = await User.findByPk(id);

      if (!user || (user.companyId !== authUser.companyId)) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: `El id: ${id} no se encuentra en la base de datos`,
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      await user.destroy();
   
      res.json(user);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Actualizar información de un usuario dado su id.
 * @param {integer} id integer. `params`.
 * @param {string} firstName string. `body`. Opcional.
 * @param {string} lastName string. `body`. Opcional.
 * @param {string} email string, email. `body`. Opcional.
 * @param {string} password string. `body`. Opcional.
 * @param {integer} companyId integer. `body`. Opcional.
 */
const findByIdAndUpdate = async (req = request, res = response) => {
   try {
      const { firstName, lastName, stringEmail, password } = req.body;
   
      const { id } = req.params;

      const authUser = req.authUser;

      const user = await User.findByPk(id, {
         include: eLoad
      });

      if (!user || (user.companyId !== authUser.companyId)) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: `El id: ${id} no se encuentra en la base de datos`,
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      if (firstName) {
         user.firstName = firstName.toLocaleLowerCase();
      }

      if (lastName) {
         user.lastName = lastName.toLocaleLowerCase();
      }

      if (stringEmail) {
         user.email = stringEmail;
      }

      if (password) {
         //Encriptado de contraseña
         const salt = bcryptjs.genSaltSync();
         const hashPassword = bcryptjs.hashSync(password, salt);

         user.password = hashPassword;
      }

      await user.save();

      res.json(user);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Restaurar un usuario dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndRestore = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const authUser = req.authUser;

      const user = await User.findByPk(id, { paranoid: false });

      if (!user || (user.companyId !== authUser.companyId)) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: `El id: ${id} no se encuentra en la base de datos`,
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      if (!user.deletedAt) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: `El id: ${id} no ha sido eliminado`,
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      await user.restore();
   
      res.json(user);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Autenticación de usuario usando email y clave
 * @param {string} email string. `body` 
 * @param {string} password string. `body` 
 * @returns 
 */
const login = async (req = request, res = response) => {
   // Obteniendo los datos de inicio de sesión
   const { email, password } = req.body;

   try {

      const user = await User.findOne({
         where: { email: email.toLocaleLowerCase() },
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

      if (!user) {
         return res.status(400).json({
            errors: [
               {
                  value: email,
                  msg: 'Email no existe o fue eliminado',
                  param: 'email',
                  location: 'body'
               }
            ]
         });
      }

      // Verificar password
      const validPassword = bcryptjs.compareSync(password, user.password);

      if (!validPassword) {
         return res.status(400).json({
            errors: [
               {
                  value: password,
                  msg: 'Contraseña incorrecta',
                  param: 'password',
                  location: 'body'
               }
            ]
         });
      }

      // Generar JWT
      const token = await generateJWT(user.id, user.uuid);

      res.json({
         user: formatUser(user),
         token
      });
   } catch (error) {
      console.log(error);
      return res.status(500).json(error);
   }
}

/**
 * Obtener la data del usuario a través de jwt (JsonWebToken)
 * @param {string} x-token string. `headers`
 */
const renew = async (req = request, res = response) => {
   const user = req.authUser;

   // Generar JWT
   const token = await generateJWT(user.id, user.uuid);

   res.json({
      user,
      token
   });
}

/**
 * Actualizar información de un usuario dado su jwt (JsonWebToken).
 * @param {string} x-token string. `headers`.
 * @param {string} id integer. `param`.
 * @param {string} firstName string. `body`. Opcional.
 * @param {string} lastName string. `body`. Opcional.
 * @param {string} email string, email. `body`. Opcional.
 */
const findByJWTAndUpdate = async (req = request, res = response) => {
   try {
      const { firstName, lastName, stringEmail } = req.body;
   
      const { id } = req.params;

      const authUser = req.authUser;

      if (authUser.id !== Number(id)) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: 'No puedes editar un usuario diferente al tuyo',
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      const user = await User.findByPk(id);

      if (firstName) {
         user.firstName = firstName.toLocaleLowerCase();
      }

      if (lastName) {
         user.lastName = lastName.toLocaleLowerCase();
      }

      if (stringEmail) {
         user.email = stringEmail;
      }

      await user.save();

      res.json(user);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Actualizar contraseña de un usuario dado su jwt (JsonWebToken).
 * @param {string} x-token string. `headers`.
 * @param {string} oldPassword string. `body`.
 * @param {string} newPassword string. `body`.
 */
const findByJWTAndUpdatePassword = async (req = request, res = response) => {
   try {
      const { oldPassword, newPassword } = req.body;

      const authUser = req.authUser;

      const user = await User.findByPk(authUser.id);

      // Verificar password
      const validPassword = bcryptjs.compareSync(oldPassword, user.password);

      if (!validPassword) {
         return res.status(400).json({
            errors: [
               {
                  value: oldPassword,
                  msg: 'Contraseña incorrecta',
                  param: 'oldPassword',
                  location: 'body'
               }
            ]
         });
      }

      //Encriptado de contraseña
      const salt = bcryptjs.genSaltSync();
      const hashPassword = bcryptjs.hashSync(newPassword, salt);

      user.password = hashPassword;

      await user.save();

      res.json(user);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Solicitar el cambio de contraseña de un usuario dado su email.
 * @param {string} email string, email. `body`.
 */
const findByEmailAndPasswordRecovery = async (req = request, res = response) => {
   try {
      const { email } = req.body;

      const user = await User.findOne({
         where: { email: email.toLocaleLowerCase() },
         include: {
            model: Company,
            as: 'company'
         }
      });

      if (!user) {
         return res.status(400).json({
            errors: [
               {
                  value: email,
                  msg: 'Email no existe o fue eliminado',
                  param: 'email',
                  location: 'body'
               }
            ]
         });
      }

      // Generar JWT
      const userJWT = await generateResetJWT(user.id, user.uuid, user.password, '1h');

      const config = CompanyConfig.instance();

      await passwordRecoveryMailer({
         from: `'${config.get('companyName').value}' <${config.get('companyEmail').value}>`,
         to: user.email,
         subject: '¡Solicitud de cambio de contraseña!'
      }, {
         companyName: config.get('companyName'),
         userName: capitalizeAllWords(user.fullName),
         userEmail: user.email,
         userUUID: user.uuid,
         userIp: getIpAdress(req),
         userJWT,
         clientName: capitalizeAllWords(user.company?.name || config.get('companyName').value)
      });

      res.json({sent: true});
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Obtener id de usuario dado su token de cambio de contraseña.
 * @param {string} x-reset-token string. `headers`.
 */
const updatePasswordByToken = async (req = request, res = response) => {
   try {
      const { password } = req.body;

      const userId = req.userId;

      const user = await User.findByPk(userId);

      //Encriptado de contraseña
      const salt = bcryptjs.genSaltSync();
      const hashPassword = bcryptjs.hashSync(password, salt);

      user.password = hashPassword;

      await user.save();

      res.json({userId});
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}



// Exports
module.exports = {
   create,
   findAll,
   findById,
   findByIdAndDelete,
   findByIdAndRestore,
   findByIdAndUpdate,
   // Auth y area personal
   login,
   renew,
   findByJWTAndUpdate,
   findByJWTAndUpdatePassword,
   findByEmailAndPasswordRecovery,
   updatePasswordByToken,
}