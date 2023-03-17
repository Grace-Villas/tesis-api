const { Router } = require('express');
const { body, query, param } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT, validatePermission } = require('../middlewares/validate-jwt');

const {
   findAll,
   findById,
   findByIdAndDelete,
   findByIdAndRestore
} = require('../controllers/company-products');



const router = Router();

// Rutas

// Listar productos registrados
router.get('/', [
   validateJWT,

   query('companyId', 'El id debe ser un entero').optional().isInt({gt: 0}),

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
   name: 'company-products',
   router
};