const { Router } = require('express');
const { body, query, param } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT, validatePermission } = require('../middlewares/validate-jwt');
const { validateCompanyId } = require('../middlewares/company-express');
const { validateStock } = require('../middlewares/companyProduct-express');
const { validateReceiverId } = require('../middlewares/receiver-express');
const { validateDispatchAndHasStatus, validateDispatchAndDoesntHasStatus } = require('../middlewares/dispatches-express');
const { validateBatchAndHasStatus } = require('../middlewares/batches-express');

const {
   create,
   findAll,
   findById,
   findByIdAndCancel,
   findByIdAndDeliver,
   findByIdAndDeny,
   findByIdAndAllocateBatch,
   findByIdAndDellocateBatch
} = require('../controllers/dispatches');



const router = Router();

// Rutas

// Listar despachos registrados
router.get('/', [
   validateJWT,

   query('date', 'La fecha debe tener un formato válido').optional().isDate(),
   query('companyId', 'El id es inválido').optional().isInt({gt: 0}),
   query('userId', 'El id es inválido').optional().isInt({gt: 0}),
   query('statusId', 'El id es inválido').optional().isInt({gt: 0}),

   query('limit', 'El límite de documentos debe ser un entero mayor a cero').optional().isInt({gt: 0}),
   query('skip', 'La cantidad de documentos a omitir debe ser un entero mayor a cero').optional().isInt({min: 0}),
   validateFields
], findAll);

// Obtener un despacho según su id
router.get('/:id', [
   validateJWT,
   validatePermission('dispatches', 'list'),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findById);

// Crear un nuevo despacho
router.post('/', [
   validateJWT,
   validatePermission('dispatches', 'create'),

   body('companyId')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validateCompanyId),

   body('receiverId')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validateReceiverId),

   body('date')
      .not().isEmpty().withMessage('La fecha de recepción es obligatoria').bail()
      .isDate().withMessage('La fecha debe tener un formato válido'),

   body('products')
      .not().isEmpty().withMessage('El arreglo de envíos es obligatorio').bail()
      .isArray({min: 1}).withMessage('Debe suministrar al menos 1 producto'),

   body('products.*.productId')
      .not().isEmpty().withMessage('El id del producto es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail(),

   body('products.*.qty')
      .not().isEmpty().withMessage('La cantidad de paletas es obligatoria').bail()
      .isInt({min: 1}).withMessage('La cantidad de paletas deben ser un entero mayor a 0'),

   body('products.*')
      .isObject().withMessage('Cada producto debe ser un objeto').bail()
      .custom(validateStock),

   validateFields
], create);

// Asignar despacho a lote
router.put('/allocate/:id', [
   validateJWT,
   validatePermission('batches', 'edit', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(dispatchId => validateDispatchAndHasStatus(dispatchId, {
         status: 'pendiente', errorMessage: 'El despacho debe estar pendiente para poder ser asignado a un lote'
      })),

   body('batchId')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(batchId => validateBatchAndHasStatus(batchId, {
         status: 'pendiente', errorMessage: 'El lote debe estar pendiente para poder asignarle un despacho'
      })),

   validateFields
], findByIdAndAllocateBatch);

// Remover despacho de lote
router.put('/dellocate/:id', [
   validateJWT,
   validatePermission('batches', 'edit', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(dispatchId => validateDispatchAndHasStatus(dispatchId, {
         status: 'agendado', errorMessage: 'El despacho debe estar agendado para poder ser retirado de un lote'
      })),

   validateFields
], findByIdAndDellocateBatch);

// Marcar despacho como entregado
router.put('/:id', [
   validateJWT,
   validatePermission('dispatches', 'edit', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(dispatchId => validateDispatchAndHasStatus(dispatchId, {
         status: 'embarcado', errorMessage: 'El despacho debe estar embarcado para poder ser marcado como entregado'
      })),
      
   validateFields
], findByIdAndDeliver);

// Marcar un despacho como denegado
router.delete('/deny/:id', [
   validateJWT,
   validatePermission('dispatches', 'delete', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(dispatchId => validateDispatchAndDoesntHasStatus(dispatchId, {
         statuses: ['entregado', 'cancelado', 'denegado'], errorMessage: 'El despacho no puede ser denegado'
      })),

   body('comments')
      .not().isEmpty().withMessage('Los comentarios son obligatorios').bail()
      .isString().withMessage('Los comentarios deben tener un formato string'),
      
   validateFields
], findByIdAndCancel);

// Cancelar un despacho
router.delete('/:id', [
   validateJWT,
   validatePermission('dispatches', 'delete'),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(dispatchId => validateDispatchAndHasStatus(dispatchId, {
         status: 'pendiente', errorMessage: 'El despacho ya fue agendado, contacte a la empresa'
      })),
      
   validateFields
], findByIdAndDeny);



// Exports
module.exports = {
   name: 'dispatches',
   router
};