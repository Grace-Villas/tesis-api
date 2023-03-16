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
} = require('../controllers/products');



const router = Router();

// Rutas

// Listar productos registrados
router.get('/', [
   validateJWT,

   query('name', 'El nombre debe tener un formato string').optional().isString(),

   query('limit', 'El límite de documentos debe ser un entero mayor a cero').optional().isInt({gt: 0}),
   query('skip', 'La cantidad de documentos a omitir debe ser un entero mayor a cero').optional().isInt({min: 0}),
   validateFields
], findAll);

// Obtener un producto según su id
router.get('/:id', [
   validateJWT,
   validatePermission('products', 'list', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),
   validateFields
], findById);

// Crear un nuevo producto
router.post('/', [
   validateJWT,
   validatePermission('products', 'create', true),

   body('name')
      .not().isEmpty().withMessage('El nombre es obligatorio').bail()
      .isString().withMessage('El nombre debe tener un formato string').bail()
      .custom((name, { req }) => validateUniqueName(name, { modelName: 'Product', req })),

   body('qtyPerPallet')
      .not().isEmpty().withMessage('La cantidad de unidades por paleta es obligatoria').bail()
      .isInt({gt: 0}).withMessage('La cantidad de unidades por paleta debe ser un entero mayor a 0'),

   validateFields
], create);

// Actualizar un producto
router.put('/:id', [
   validateJWT,
   validatePermission('products', 'edit', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   body('name').optional()
      .isString().withMessage('El nombre debe tener un formato string').bail()
      .custom((name, { req }) => validateUniqueName(name, { modelName: 'Product', req, isUpdate: true })),

   body('qtyPerPallet').optional()
      .isInt({gt: 0}).withMessage('La cantidad de unidades por paleta debe ser un entero mayor a 0'),
   
   validateFields
], findByIdAndUpdate);

// Restaurar producto eliminado
router.put('/restore/:id', [
   validateJWT,
   validatePermission('products', 'delete', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findByIdAndRestore);

// Eliminar un producto
router.delete('/:id', [
   validateJWT,
   validatePermission('products', 'delete', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findByIdAndDelete);



// Exports
module.exports = {
   name: 'products',
   router
};