const { request, response } = require('express');
const { Op } = require('sequelize');

// Modelos
const { Role, RolePermission, Permission, UserRole, User } = require('../database/models');



// Eager loading
const eLoad = [
   {
      model: RolePermission,
      as: 'rolePermissions',
      include: {
         model: Permission,
         as: 'permission'
      }
   }
];

// Funciones del controlador

/**
 * Crear un nuevo rol.
 * @param {string} name string. `body`.
 * @param {string} hexColor string. `body`. Por defecto `#FFFFFF`
 * @param {boolean} isPublic boolean. `body`. Por defecto `false`
 * @param {Array<{id: integer, list: boolean, create: boolean, edit: boolean, delete: boolean}>} permissions array. `body`.
 */
const create = async (req = request, res = response) => {
   try {
      const { name, hexColor = '#FFFFFF', isPublic = false, permissions } = req.body;

      const user = req.authUser;

      const data = {
         name: name.toLocaleLowerCase(),
         hexColor: hexColor.toLocaleUpperCase(),
         companyId: user.companyId,
         isPublic: !user.isAdmin ? false : isPublic,
         rolePermissions: permissions.map(per => ({
            permissionId: per.id,
            list: per.list,
            create: per.create,
            edit: per.edit,
            delete: per.delete
         }))
      }

      const role = await Role.create(data, {
         include: {
            model: RolePermission,
            as: 'rolePermissions'
         }
      });

      res.json(role);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Listar roles registrados.
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { name, isPublic, skip = 0, limit } = req.query;

      const user = req.authUser;

      let where = {}

      if (typeof name != 'undefined') {
         where.name = { [Op.substring]: name };
      }

      if (typeof isPublic != 'undefined') {
         where.isPublic = isPublic;
      }

      // Funcionalidad específica según el tipo de usuario
      where[Op.or] = [
         { isPublic: true },
         { companyId: user.isAdmin ? { [Op.is]:  null } : user.companyId }
      ]

      if (limit) {
         const { rows, count } = await Role.findAndCountAll({
            where,
            include: eLoad,
            distinct: true,
            offset: Number(skip),
            limit: Number(limit),
            order: [
               ['name', 'ASC']
            ]
         });

         const pages = Math.ceil(count / Number(limit));

         res.json({
            rows,
            count,
            pages
         });
      } else {
         const roles = await Role.findAll({
            where,
            include: eLoad,
            order: [
               ['name', 'ASC']
            ]
         });
   
         res.json(roles);
      }
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Obtener un rol por su id.
 * @param {integer} id integer. `params`
 */
const findById = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const user = req.authUser;

      const role = await Role.findByPk(id, {
         include: eLoad,
         order: [
            [{ model: RolePermission, as: 'rolePermissions' }, { model: Permission, as: 'permission' }, 'showName', 'ASC']
         ]
      });

      if (!role || (!role.isPublic && role.companyId !== user.companyId)) {
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

      res.json(role);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Eliminar un rol dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndDelete = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const user = req.authUser;

      const role = await Role.findByPk(id);

      if (!role || role.isPublic || (role.companyId !== user.companyId)) {
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

      await role.destroy();
   
      res.json(role);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

// 
/**
 * Actualizar información de un rol dado su id.
 * @param {integer} id integer. `params`
 * @param {string} name string. `body`. Opcional
 * @param {string} hexColor string. `body`. Opcional
 */
const findByIdAndUpdate = async (req = request, res = response) => {
   try {
      const { name, hexColor } = req.body;
   
      const { id } = req.params;

      const user = req.authUser;

      const role = await Role.findByPk(id);

      if (!role || (role.companyId !== user.companyId) || role.isPublic) {
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

      if (name) {
         role.name = name;
      }

      if (hexColor) {
         role.hexColor = hexColor.toLocaleUpperCase();
      }

      await role.save();

      res.json(role);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Restaurar rol eliminado.
 * @param {integer} id integer. `params`
 */
const findByIdAndRestore = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const user = req.authUser;

      const role = await Role.findByPk(id, { paranoid: false });

      if (!role || role.isPublic || (role.companyId !== user.companyId)) {
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

      if (!role.deletedAt) {
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

      await role.restore();
   
      res.json(role);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Asignar un rol a un usuario.
 * @param {integer} roleId integer. `body`
 * @param {integer} userId integer. `body`
 */
const findByIdAndAllocateToUser = async (req = request, res = response) => {
   try {
      const { roleId, userId } = req.body;

      const user = req.authUser;

      if (userId == user.id) {
         return res.status(400).json({
            errors: [
               {
                  value: userId,
                  msg: 'No puedes asignarte roles tu mismo',
                  param: 'userId',
                  location: 'body'
               }
            ]
         });
      }

      const [userRole, created] = await UserRole.findOrCreate({
         where: { roleId, userId },
         paranoid: false
      });

      if (!created && !userRole.deletedAt) {
         return res.status(400).json({
            errors: [
               {
                  value: userId,
                  msg: 'El usuario ya posee el rol seleccionado',
                  param: 'userId',
                  location: 'body'
               }
            ]
         });
      }

      if (!created && userRole.deletedAt) {
         await userRole.restore();
      }
   
      res.json(userRole);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Asignar un rol a un usuario.
 * @param {integer} userRoleId integer. `params`
 */
const findByIdAndDellocateFromUser = async (req = request, res = response) => {
   try {
      const { userRoleId } = req.params;

      const user = req.authUser;

      const userRole = await UserRole.findByPk(userRoleId, {
         include: {
            model: User,
            as: 'user'
         }
      });

      if (!userRole || (userRole.user.companyId !== user.companyId)) {
         return res.status(400).json({
            errors: [
               {
                  value: userRoleId,
                  msg: `El id: ${userRoleId} no se encuentra en la base de datos`,
                  param: 'userRoleId',
                  location: 'params'
               }
            ]
         });
      }

      await userRole.destroy();
   
      res.json(userRole);
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
   findByIdAndAllocateToUser,
   findByIdAndDellocateFromUser,
}