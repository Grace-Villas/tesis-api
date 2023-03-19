const { Router } = require('express');
const { body, query, param } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT, validatePermission } = require('../middlewares/validate-jwt');
const { validateCompanyId } = require('../middlewares/company-express');
const { validateProductId } = require('../middlewares/product-express');

const {
   create,
   findAll,
   findById
} = require('../controllers/receptions');



const router = Router();

// Rutas

// Listar envíos registrados
router.get('/', [
   validateJWT,

   query('date', 'La fecha debe tener un formato válido').optional().isDate(),
   query('companyId', 'El id es inválido').optional().isInt({gt: 0}),
   query('userId', 'El id es inválido').optional().isInt({gt: 0}),

   query('limit', 'El límite de documentos debe ser un entero mayor a cero').optional().isInt({gt: 0}),
   query('skip', 'La cantidad de documentos a omitir debe ser un entero mayor a cero').optional().isInt({min: 0}),
   validateFields
], findAll);

// Obtener un envío según su id
router.get('/:id', [
   validateJWT,
   validatePermission('receptions', 'list', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),
   validateFields
], findById);

// Crear un nuevo envío
router.post('/', [
   validateJWT,
   validatePermission('receptions', 'create', true),

   body('companyId')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido')
      .custom(validateCompanyId),

   body('date')
      .not().isEmpty().withMessage('La fecha de recepción es obligatoria').bail()
      .isDate().withMessage('La fecha debe tener un formato válido'),

   body('products')
      .not().isEmpty().withMessage('El arreglo de envíos es obligatorio')
      .isArray({min: 1}).withMessage('Debe suministrar al menos 1 producto'),

   body('products.*.productId')
      .not().isEmpty().withMessage('El id del producto es obligatorio')
      .isInt({min: 1}).withMessage('El id es inválido')
      .custom(validateProductId),

   body('products.*.qty')
      .not().isEmpty().withMessage('La cantidad de paletas es obligatoria')
      .isInt({min: 1}).withMessage('La cantidad de paletas deben ser un entero mayor a 0'),

   validateFields
], create);



// Exports
module.exports = {
   name: 'receptions',
   router
};