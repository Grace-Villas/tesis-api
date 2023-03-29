const { Router } = require('express');
const { body, query, param } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT, validatePermission } = require('../middlewares/validate-jwt');
const { validateAdminId } = require('../middlewares/user-express');
const { validateBatchAndHasStatus } = require('../middlewares/batches-express');

const {
   create,
   findAll,
   findById,
   findByIdAndUpdate,
   findByIdAndDelete,
   findByIdAndTransit,
} = require('../controllers/batches');



const router = Router();

// Rutas

// Listar lotes registrados
router.get('/', [
   validateJWT,
   
   query('date', 'La fecha debe tener un formato válido').optional().isDate(),
   query('userId', 'El id es inválido').optional().isInt({gt: 0}),
   query('statusId', 'El id es inválido').optional().isInt({gt: 0}),

   query('limit', 'El límite de documentos debe ser un entero mayor a cero').optional().isInt({gt: 0}),
   query('skip', 'La cantidad de documentos a omitir debe ser un entero mayor a cero').optional().isInt({min: 0}),
   validateFields
], findAll);

// Obtener un lote según su id
router.get('/:id', [
   validateJWT,
   validatePermission('batches', 'list', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findById);

// Crear un nuevo lote
router.post('/', [
   validateJWT,
   validatePermission('batches', 'create', true),

   body('userId')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validateAdminId),

   body('date')
      .not().isEmpty().withMessage('La fecha de recepción es obligatoria').bail()
      .isDate().withMessage('La fecha debe tener un formato válido'),

   body('dispatches')
      .not().isEmpty().withMessage('La lista de despachos es obligatoria').bail()
      .isArray({min: 1}).withMessage('La lista de despachos debe ser un array con al menos 1 dato'),
      
   body('dispatches.*')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({gt: 0}).withMessage('El id es inválido')
      .custom(dispatchId => validateDispatchAndHasStatus(dispatchId, {
         status: 'pendiente', errorMessage: 'El despacho debe estar pendiente para poder ser agregado a un lote'
      })),

   validateFields
], create);

// Actualizar status de un lote a en tránsito
router.put('/transit/:id', [
   validateJWT,
   validatePermission('batches', 'edit', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido')
      .custom(batchId => validateBatchAndHasStatus(batchId, {
         status: 'pendiente', errorMessage: 'El lote debe estar pendiente para poder poder cambiar a status "en tránsito"'
      })),

   validateFields
], findByIdAndTransit);

// Actualizar un lote
router.put('/:id', [
   validateJWT,
   validatePermission('batches', 'edit', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido')
      .custom(batchId => validateBatchAndHasStatus(batchId, {
         status: 'pendiente', errorMessage: 'El lote debe estar pendiente para poder poder actualizarlo'
      })),

   body('userId').optional()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validateAdminId),

   validateFields
], findByIdAndUpdate);

// Eliminar un lote
router.delete('/:id', [
   validateJWT,
   validatePermission('batches', 'delete', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido')
      .custom(batchId => validateBatchAndHasStatus(batchId, {
         status: 'pendiente', errorMessage: 'El lote debe estar pendiente para poder poder actualizarlo'
      })),
   
   validateFields
], findByIdAndDelete);



// Exports
module.exports = {
   name: 'batches',
   router
};