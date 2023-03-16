const { Router } = require('express');
const { body, query, param } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT, validatePermission } = require('../middlewares/validate-jwt');
const { validateCountryId } = require('../middlewares/country-express');
const { validateUniqueName } = require('../middlewares/custom-express');

const {
   create,
   findAll,
   findById,
   findByIdAndDelete,
   findByIdAndRestore,
   findByIdAndUpdate
} = require('../controllers/states');



const router = Router();

// Rutas

// Listar estados registrados
router.get('/', [
   validateJWT,

   query('limit', 'El límite de documentos debe ser un entero mayor a cero').optional().isInt({gt: 0}),
   query('skip', 'La cantidad de documentos a omitir debe ser un entero mayor a cero').optional().isInt({min: 0}),
   validateFields
], findAll);

// Obtener un estado según su id
router.get('/:id', [
   validateJWT,
   validatePermission('states', 'list', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findById);

// Crear un nuevo estado
router.post('/', [
   validateJWT,
   validatePermission('states', 'create', true),

   body('name')
      .not().isEmpty().withMessage('El nombre es obligatorio').bail()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El nombre debe contener solo letras').bail()
      .custom((name, { req }) => validateUniqueName(name, { modelName: 'State', req })),

   body('countryId')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validateCountryId),
      
   validateFields
], create);

// Actualizar un estado
router.put('/:id', [
   validateJWT,
   validatePermission('states', 'edit', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   body('name').optional()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El nombre debe contener solo letras').bail()
      .custom((name, { req }) => validateUniqueName(name, { modelName: 'State', req, isUpdate: true })),

   body('countryId').optional()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validateCountryId),
   
   validateFields
], findByIdAndUpdate);

// Restaurar estado eliminado
router.put('/restore/:id', [
   validateJWT,
   validatePermission('states', 'delete', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findByIdAndRestore);

// Eliminar un estado
router.delete('/:id', [
   validateJWT,
   validatePermission('states', 'delete', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findByIdAndDelete);



// Exports
module.exports = {
   name: 'states',
   router
};