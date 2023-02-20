const { Router } = require('express');
const { body, query, param } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT, validatePermission } = require('../middlewares/validate-jwt');
const { validateCompanyId } = require('../middlewares/company-express');
const { validateUniqueEmail } = require('../middlewares/custom-express');

const {
   findAll,
   findById,
   findByIdAndDelete,
   findByIdAndRestore,
   create,
   findByIdAndUpdate
} = require('../controllers/users');



const router = Router();

// Rutas

// Listar usuarios registrados
router.get('/', [
   validateJWT,
   validatePermission('users', 'list'),

   query('limit', 'El límite de documentos debe ser un entero mayor a cero').optional().isInt({gt: 0}),
   query('skip', 'La cantidad de documentos a omitir debe ser un entero mayor a cero').optional().isInt({min: 0}),
   validateFields
], findAll);

// Obtener un usuario según su id
router.get('/:id', [
   validateJWT,
   validatePermission('users', 'list'),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),
   validateFields
], findById);

// Crear un nuevo usuario
router.post('/', [
   validateJWT,
   validatePermission('users', 'create'),

   body('firstName')
      .not().isEmpty().withMessage('El nombre es obligatorio').bail()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El nombre debe contener solo letras'),

   body('lastName')
      .not().isEmpty().withMessage('El apellido es obligatorio').bail()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El apellido debe contener solo letras'),
      
   body('password')
      .not().isEmpty().withMessage('La contraseña es obligatoria').bail()
      .isLength({ min: 8 }).withMessage('La contraseña debe contener mínimo 8 caracteres'),

   body('email')
      .not().isEmpty().withMessage('El email es obligatorio').bail()
      .isEmail().withMessage('El email es inválido').bail()
      .custom((name, { req }) => validateUniqueEmail(name, { modelName: 'User', req })),

   validateFields
], create);

// Actualizar un usuario
router.put('/:id', [
   validateJWT,
   validatePermission('users', 'edit'),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   body('firstName').optional()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El nombre debe contener solo letras'),

   body('lastName').optional()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El apellido debe contener solo letras'),

   body('password').optional()
      .isLength({ min: 8 }).withMessage('La contraseña debe contener mínimo 8 caracteres'),

   body('email').optional()
      .isEmail().withMessage('El email es inválido').bail()
      .custom((name, { req }) => validateUniqueEmail(name, { modelName: 'User', req, isUpdate: true })),
   
   validateFields
], findByIdAndUpdate);

// Restaurar usuario eliminado
router.put('/restore/:id', [
   validateJWT,
   validatePermission('users', 'delete'),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),
   validateFields
], findByIdAndRestore);

// Eliminar un usuario
router.delete('/:id', [
   validateJWT,
   validatePermission('users', 'delete'),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),
   validateFields
], findByIdAndDelete);



// Exports
module.exports = {
   name: 'users',
   router
};