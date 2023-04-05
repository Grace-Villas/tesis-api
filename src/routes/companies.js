const { Router } = require('express');
const { body, query, param } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT, validatePermission } = require('../middlewares/validate-jwt');
const { validateCityId } = require('../middlewares/city-express');
const { validateCompanyId } = require('../middlewares/company-express');
const { validateUniqueEmail, validatePhone, validateRut } = require('../middlewares/custom-express');

const {
   create,
   findAll,
   findById,
   findByIdAndDelete,
   findByIdAndRestore,
   findByIdAndUpdate
} = require('../controllers/companies');



const router = Router();

// Rutas

// Listar compañías registradas
router.get('/', [
   validateJWT,

   query('limit', 'El límite de documentos debe ser un entero mayor a cero').optional().isInt({gt: 0}),
   query('skip', 'La cantidad de documentos a omitir debe ser un entero mayor a cero').optional().isInt({min: 0}),
   
   validateFields
], findAll);

// Obtener una compañía según su id
router.get('/:id', [
   validateJWT,
   validatePermission('companies', 'list', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),
      
   validateFields
], findById);

// Crear una nueva compañía
router.post('/', [
   validateJWT,
   validatePermission('companies', 'create', true),

   body('name')
      .not().isEmpty().withMessage('El nombre es obligatorio').bail()
      .isAlpha('es-ES', { ignore: ' -.,'}).withMessage('El nombre debe contener solo letras'),

   body('address')
      .not().isEmpty().withMessage('La dirección es obligatoria').bail()
      .isString().withMessage('La dirección debe ser alfanumérica'),

   body('email')
      .not().isEmpty().withMessage('El email es obligatorio').bail()
      .isEmail().withMessage('El email es inválido').bail()
      .custom((name, { req }) => validateUniqueEmail(name, { modelName: 'Company', req })).bail()
      .custom((name, { req }) => validateUniqueEmail(name, { modelName: 'User', req })),

   body('rut')
      .not().isEmpty().withMessage('El documento es obligatorio').bail()
      .isString().withMessage('El rut debe tener un formato string').bail()
      .custom(validateRut),

   body('cityId')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validateCityId),

   body('phone')
      .not().isEmpty().withMessage('El teléfono es obligatorio').bail()
      .isString().withMessage('El teléfono debe tener un formato string').bail()
      .custom((phone => validatePhone(phone, { locale: 'es-VE', phoneExtension: '+58' }))),
      
   validateFields
], create);

// Actualizar una compañía
router.put('/:id', [
   validateJWT,
   validatePermission('companies', 'edit', true),

   param('id')
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validateCompanyId),
      
   body('name').optional()
      .isAlpha('es-ES', { ignore: ' -.,'}).withMessage('El nombre debe contener solo letras'),

   body('address').optional()
      .isString().withMessage('La dirección debe ser alfanumérica'),

   body('email').optional()
      .isEmail().withMessage('El email es inválido')
      .custom((email, { req }) => validateUniqueEmail(email, { modelName: 'Company', req, isUpdate: true })),
      // .custom((email, { req }) => validateUniqueEmail(email, { modelName: 'User', req })), TODO: arreglar funcionalidad de cambio de correo

   body('rut').optional()
      .isString().withMessage('El rut debe tener un formato string').bail()
      .custom(validateRut),

   body('cityId').optional()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validateCityId),
      
   body('phone').optional()
      .isString().withMessage('El teléfono debe tener un formato string').bail()
      .custom((phone => validatePhone(phone, { locale: 'es-VE', phoneExtension: '+58' }))),

   validateFields
], findByIdAndUpdate);

// Restaurar compañía eliminada
router.put('/restore/:id', [
   validateJWT,
   validatePermission('companies', 'delete', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findByIdAndRestore);

// Eliminar una compañía
router.delete('/:id', [
   validateJWT,
   validatePermission('companies', 'delete', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),
      
   validateFields
], findByIdAndDelete);



// Exports
module.exports = {
   name: 'companies',
   router
};