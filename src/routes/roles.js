const { Router } = require('express');
const { body, query, param } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT, validatePermission } = require('../middlewares/validate-jwt');
const { validatePermissionId } = require('../middlewares/permission-express');
const { validateRoleIdToAllocate } = require('../middlewares/role-express');
const { validateUserId } = require('../middlewares/user-express');

const {
   findAll,
   findById,
   findByIdAndDelete,
   findByIdAndRestore,
   create,
   findByIdAndUpdate,
   findByIdAndAllocateToUser,
   findByIdAndDellocateFromUser
} = require('../controllers/roles');



const router = Router();

// Rutas

// Listar roles registrados
router.get('/', [
   validateJWT,

   query('limit', 'El límite de documentos debe ser un entero mayor a cero').optional().isInt({gt: 0}),
   query('skip', 'La cantidad de documentos a omitir debe ser un entero mayor a cero').optional().isInt({min: 0}),
   validateFields
], findAll);

// Obtener un rol según su id
router.get('/:id', [
   validateJWT,
   validatePermission('roles', 'list'),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),
   validateFields
], findById);

// Crear un nuevo rol
router.post('/', [
   validateJWT,
   validatePermission('roles', 'create'),

   body('name')
      .not().isEmpty().withMessage('El nombre es obligatorio').bail()
      .isAlpha('es-ES', { ignore: ' ' }).withMessage('El nombre debe contener solo letras'),

   body('hexColor').optional()
      .isHexColor().withMessage('El color debe ser un valor hexadecimal'),

   body('isPublic').optional()
      .isBoolean().withMessage('El valor debe ser un booleano'),

   body('permissions')
      .not().isEmpty().withMessage('Los permisos son obligatorios').bail()
      .isArray({ min: 1 }).withMessage('Debe ingresar al menos 1 permiso'),

   body('permissions.*')
      .not().isEmpty().withMessage('El permiso no puede estar vacío').bail()
      .isObject().withMessage('Cada permiso debe ser un objeto'),

   body('permissions.*.id')
      .not().isEmpty().withMessage('El id del permiso es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validatePermissionId),

   body('permissions.*.list')
      .not().isEmpty().withMessage('El valor de listar del permiso es obligatorio').bail()
      .isBoolean().withMessage('El valor debe ser un booleano'),

   body('permissions.*.create')
      .not().isEmpty().withMessage('El valor de crear del permiso es obligatorio').bail()
      .isBoolean().withMessage('El valor debe ser un booleano'),

   body('permissions.*.edit')
      .not().isEmpty().withMessage('El valor de actualización del permiso es obligatorio').bail()
      .isBoolean().withMessage('El valor debe ser un booleano'),

   body('permissions.*.delete')
      .not().isEmpty().withMessage('El valor de eliminación del permiso es obligatorio').bail()
      .isBoolean().withMessage('El valor debe ser un booleano'),

   validateFields
], create);

// Asignar un rol a un usuario
router.post('/user-role', [
   validateJWT,
   validatePermission('roles', 'create'),

   body('roleId')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validateRoleIdToAllocate),

   body('userId')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validateUserId),

   validateFields
], findByIdAndAllocateToUser);

// Actualizar un rol
router.put('/:id', [
   validateJWT,
   validatePermission('roles', 'edit'),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   body('name').optional()
      .isAlpha('es-ES', { ignore: ' ' }).withMessage('El nombre debe contener solo letras'),

   body('hexColor').optional()
      .isHexColor().withMessage('El color debe ser un valor hexadecimal'),
   
   validateFields
], findByIdAndUpdate);

// Restaurar rol eliminado
router.put('/restore/:id', [
   validateJWT,
   validatePermission('roles', 'delete'),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findByIdAndRestore);

// Eliminar un rol asignado a un usuario
router.delete('/user-role/:userRoleId', [
   validateJWT,
   validatePermission('roles', 'delete'),

   param('userRoleId')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findByIdAndDellocateFromUser);

// Eliminar un rol
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
   name: 'roles',
   router
};