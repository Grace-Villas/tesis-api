const { Router } = require('express');
const { body, query, param } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT, validatePermission } = require('../middlewares/validate-jwt');
const { validateRut, validatePhone } = require('../middlewares/custom-express');
const { validateCompanyId } = require('../middlewares/company-express');
const { validateCityId } = require('../middlewares/city-express');

const {
   create,
   findAll,
   findById,
   findByIdAndDelete,
   findByIdAndRestore,
   findByIdAndUpdate
} = require('../controllers/receivers');



const router = Router();

// Rutas

// Listar destinatarios registrados
router.get('/', [
   validateJWT,

   query('companyId', 'El nombre debe tener un formato string').optional().isInt({gt: 0}),
   query('cityId', 'El nombre debe tener un formato string').optional().isInt({gt: 0}),
   query('search', 'El nombre debe tener un formato string').optional().isString(),

   query('limit', 'El límite de documentos debe ser un entero mayor a cero').optional().isInt({gt: 0}),
   query('skip', 'La cantidad de documentos a omitir debe ser un entero mayor a cero').optional().isInt({min: 0}),
   validateFields
], findAll);

// Obtener un destinatario según su id
router.get('/:id', [
   validateJWT,
   validatePermission('receivers', 'list', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),
   validateFields
], findById);

// Crear un nuevo destinatario
router.post('/', [
   validateJWT,
   validatePermission('receivers', 'create', true),

   body('companyId').optional()
      .isInt({gt: 0}).withMessage('El id es inválido').bail()
      .custom(validateCompanyId),

   body('cityId')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validateCityId),

   body('name')
      .not().isEmpty().withMessage('El nombre es obligatorio').bail()
      .isString().withMessage('El nombre debe tener un formato string').bail(),

   body('rut')
      .not().isEmpty().withMessage('El rut es obligatorio').bail()
      .isString().withMessage('El rut debe tener un formato string').bail()
      .custom(validateRut),

   body('address')
      .not().isEmpty().withMessage('La dirección es obligatoria')
      .isString().withMessage('La dirección debe tener un formato string'),

   body('phone')
      .not().isEmpty().withMessage('El teléfono es obligatorio').bail()
      .custom((phone) => validatePhone(phone, { locale: 'es-VE', phoneExtension: '+58'})),

   validateFields
], create);

// Actualizar un destinatario
router.put('/:id', [
   validateJWT,
   validatePermission('receivers', 'edit', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   body('cityId').optional()
      .custom(validateCityId),

   body('name').optional()
      .isString().withMessage('El nombre debe tener un formato string').bail(),

   body('rut').optional()
      .isString().withMessage('El rut debe tener un formato string').bail()
      .custom(validateRut),

   body('address').optional()
      .isString().withMessage('La dirección debe tener un formato string'),

   body('phone').optional()
      .custom((phone) => validatePhone(phone)),
   
   validateFields
], findByIdAndUpdate);

// Restaurar destinatario eliminado
router.put('/restore/:id', [
   validateJWT,
   validatePermission('receivers', 'delete', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findByIdAndRestore);

// Eliminar un destinatario
router.delete('/:id', [
   validateJWT,
   validatePermission('receivers', 'delete', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findByIdAndDelete);



// Exports
module.exports = {
   name: 'receivers',
   router
};