const { Router } = require('express');
const { body, param } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT, validatePermission } = require('../middlewares/validate-jwt');
const { validatePermissionId } = require('../middlewares/permission-express');
const { validateRoleId } = require('../middlewares/role-express');

const {
   findByIdAndDelete,
   findByIdAndRestore,
   create,
   findByIdAndUpdate
} = require('../controllers/role-permissions');



const router = Router();

// Rutas

// Crear un nuevo permiso de rol
router.post('/', [
   validateJWT,
   validatePermission('roles', 'create'),

   body('permissionId')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido')
      .custom(validatePermissionId),

   body('roleId')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validateRoleId),

   body('list').optional()
      .isBoolean().withMessage('El valor de listar del permiso debe ser un booleano'),

   body('create').optional()
      .isBoolean().withMessage('El valor de creación del permiso debe ser un booleano'),

   body('edit').optional()
      .isBoolean().withMessage('El valor de actualización del permiso debe ser un booleano'),

   body('delete').optional()
      .isBoolean().withMessage('El valor de eliminación del permiso debe ser un booleano'),

   validateFields
], create);

// Actualizar un permiso de rol
router.put('/:id', [
   validateJWT,
   validatePermission('roles', 'edit'),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   body('list').optional()
      .isBoolean().withMessage('El valor de listar del permiso debe ser un booleano'),

   body('create').optional()
      .isBoolean().withMessage('El valor de creación del permiso debe ser un booleano'),

   body('edit').optional()
      .isBoolean().withMessage('El valor de actualización del permiso debe ser un booleano'),
      
   body('delete').optional()
      .isBoolean().withMessage('El valor de eliminación del permiso debe ser un booleano'),
   
   validateFields
], findByIdAndUpdate);

// Restaurar permiso de rol eliminado
router.put('/restore/:id', [
   validateJWT,
   validatePermission('roles', 'delete'),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findByIdAndRestore);

// Eliminar un permiso de rol
router.delete('/:id', [
   validateJWT,
   validatePermission('roles', 'delete'),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findByIdAndDelete);



// Exports
module.exports = {
   name: 'role-permissions',
   router
};