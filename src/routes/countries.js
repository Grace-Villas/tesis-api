const { Router } = require('express');
const { body, query, param } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT, validatePermission } = require('../middlewares/validate-jwt');
const { validateUniqueName } = require('../middlewares/custom-express');

const {
   create,
   findAll,
   findById,
   findByIdAndDelete,
   findByIdAndRestore,
   findByIdAndUpdate
} = require('../controllers/countries');



const router = Router();

// Rutas

// Listar países registrados
router.get('/', [
   validateJWT,
   validatePermission('countries', 'list', true),

   query('limit', 'El límite de documentos debe ser un entero mayor a cero').optional().isInt({gt: 0}),
   query('skip', 'La cantidad de documentos a omitir debe ser un entero mayor a cero').optional().isInt({min: 0}),
   validateFields
], findAll);

// Obtener un país según su id
router.get('/:id', [
   validateJWT,
   validatePermission('countries', 'list', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),
   validateFields
], findById);

// Crear un nuevo país
router.post('/', [
   validateJWT,
   validatePermission('countries', 'create', true),

   body('name', 'El nombre es obligatorio y debe contener solo letras')
      .not().isEmpty().withMessage('El nombre es obligatorio').bail()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El nombre debe contener solo letras').bail()
      .custom((name, { req }) => validateUniqueName(name, { modelName: 'Country', req })),

   body('locale')
      .not().isEmpty().withMessage('El código de locación es obligatorio').bail()
      .isLocale().withMessage('El código de locación es inválido'),

   body('phoneExtension')
      .not().isEmpty().withMessage('La extensión telefónica es obligatoria').bail()
      .isLength({min: 2, max: 4}).withMessage('La extensión telefónica es inválida'),

   validateFields
], create);

// Actualizar un país
router.put('/:id', [
   validateJWT,
   validatePermission('countries', 'update', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   body('name').optional()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El nombre debe contener solo letras').bail()
      .custom((name, { req }) => validateUniqueName(name, { modelName: 'Country', req, isUpdate: true })),

   body('locale', 'El código de locación es inválido').isLocale().optional(),

   body('phoneExtension', 'La extensión telefónica es inválida').isLength({min: 2, max: 4}).optional(),
   
   validateFields
], findByIdAndUpdate);

// Restaurar país eliminado
router.put('/restore/:id', [
   validateJWT,
   validatePermission('countries', 'delete', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findByIdAndRestore);

// Eliminar un país
router.delete('/:id', [
   validateJWT,
   validatePermission('countries', 'delete', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findByIdAndDelete);



// Exports
module.exports = {
   name: 'countries',
   router
};