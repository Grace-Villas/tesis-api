const { request, response } = require('express');

// Modelos
const { RolePermission, Role } = require('../database/models');



// Funciones del controlador

/**
 * Crear un nuevo permiso de rol y asignarlo a un rol.
 * @param {integer} permissionId integer. `body`.
 * @param {integer} roleId integer. `body`.
 * @param {boolean} list boolean. `body`. Opcional. Por defecto: `false`
 * @param {boolean} create boolean. `body`. Opcional. Por defecto: `false`
 * @param {boolean} edit boolean. `body`. Opcional. Por defecto: `false`
 * @param {boolean} delete boolean. `body`. Opcional. Por defecto: `false`
 */
const create = async (req = request, res = response) => {
   try {
      const { permissionId, roleId, list = false, create = false, edit = false, delete: del = false } = req.body;

      const exists = await RolePermission.findOne({
         where: { permissionId, roleId }
      });

      if (exists) {
         return res.status(400).json({
            errors: [
               {
                  msg: `Ya existe un permiso de rol asociado al roleId: ${roleId} y al permissionId: ${permissionId}`,
                  param: 'exists',
                  location: 'body'
               }
            ]
         });
      }

      const data = { permissionId, roleId, list, create, edit, delete: del }

      const rolePermission = await RolePermission.create(data);

      res.json(rolePermission);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Eliminar un permiso de rol dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndDelete = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const user = req.authUser;

      const rolePermission = await RolePermission.findByPk(id, {
         include: {
            model: Role,
            as: 'role'
         }
      });

      if (!rolePermission || (rolePermission.role.companyId !== user.companyId)) {
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

      if (rolePermission.role.isPublic) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: `El id: ${id} no se puede eliminar debido a que pertenece a un rol público`,
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      await rolePermission.destroy();
   
      res.json(rolePermission);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

// 
/**
 * Actualizar información de un permiso de rol dado su id.
 * @param {integer} id integer. `params`
 * @param {boolean} list boolean. `body`. Opcional
 * @param {boolean} create boolean. `body`. Opcional
 * @param {boolean} edit boolean. `body`. Opcional
 * @param {boolean} delete boolean. `body`. Opcional
 */
const findByIdAndUpdate = async (req = request, res = response) => {
   try {
      const { list, create, edit, delete: del } = req.body;
   
      const { id } = req.params;

      const user = req.authUser;

      const rolePermission = await RolePermission.findByPk(id, {
         include: {
            model: Role,
            as: 'role'
         }
      });

      if (!rolePermission || (rolePermission.role.companyId !== user.companyId)) {
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

      if (rolePermission.role.isPublic) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: `El id: ${id} no se puede editar debido a que pertenece a un rol público`,
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      if (typeof list != 'undefined') {
         rolePermission.list = list;
      }

      if (typeof create != 'undefined') {
         rolePermission.create = create;
      }

      if (typeof edit != 'undefined') {
         rolePermission.edit = edit;
      }

      if (typeof del != 'undefined') {
         rolePermission.delete = del;
      }

      await rolePermission.save();

      res.json(rolePermission);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Restaurar permiso de rol eliminado.
 * @param {integer} id integer. `params`
 */
const findByIdAndRestore = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const user = req.authUser;

      const rolePermission = await RolePermission.findByPk(id, {
         paranoid: false,
         include: {
            model: Role,
            as: 'role'
         }
      });

      if (!rolePermission || (rolePermission.role.companyId !== user.companyId)) {
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

      if (!rolePermission.deletedAt) {
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

      await rolePermission.restore();
   
      res.json(rolePermission);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}


// Exports
module.exports = {
   create,
   findByIdAndDelete,
   findByIdAndRestore,
   findByIdAndUpdate,
}