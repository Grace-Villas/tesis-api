const { Router } = require('express');
const { body, query, param } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT, validatePermission } = require('../middlewares/validate-jwt');
const { validatePaymentMethodId } = require('../middlewares/payment-methods-express');
const { validatePaymentAndHasStatus, isPaymentNeededAttribute } = require('../middlewares/payments-express');
const { validateHasPaymentType } = require('../middlewares/payment-types-express');

const {
   create,
   findAll,
   findById,
   findByIdAndDelete,
   findByIdAndRestore,
   findByIdAndAprove,
   findByIdAndDeny
} = require('../controllers/payments');



const router = Router();

// Rutas

// Listar pagos registrados
router.get('/', [
   validateJWT,

   query('companyId', 'El id es inválido').optional().isInt({gt: 0}),
   query('statusId', 'El id es inválido').optional().isInt({gt: 0}),
   query('date', 'La fecha debe tener un formato válido').optional().isDate(),

   query('limit', 'El límite de documentos debe ser un entero mayor a cero').optional().isInt({gt: 0}),
   query('skip', 'La cantidad de documentos a omitir debe ser un entero mayor a cero').optional().isInt({min: 0}),

   validateFields
], findAll);

// Obtener un pago según su id
router.get('/:id', [
   validateJWT,
   validatePermission('payments', 'list'),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findById);

// Crear un nuevo pago
router.post('/', [
   validateJWT,
   validatePermission('payments', 'create'),

   body('paymentMethodId')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validatePaymentMethodId),

   body('amount')
      .not().isEmpty().withMessage('El monto del pago es obligatorio').bail()
      .isFloat({gt: 0}).withMessage('El monto del pago debe ser un número mayor a 0'),

   body('date')
      .not().isEmpty().withMessage('La fecha de pago es obligatoria').bail()
      .isDate().withMessage('La fecha debe tener un formato válido'),

   body('reference')
      .custom(validateHasPaymentType).bail()
      .if(isPaymentNeededAttribute('reference', 'transferencia', 'pago movil', 'binance'))
      .not().isEmpty().withMessage('La referencia del pago es obligatoria').bail()
      .isString().withMessage('El número de referencia debe tener un formato string').bail()
      .isNumeric({no_symbols: true}).withMessage('El número de referencia debe contener solo números').bail(),

   body('issuingName')
      .custom(validateHasPaymentType).bail()
      .if(isPaymentNeededAttribute('issuingName', 'zelle'))
      .not().isEmpty().withMessage('El nombre del remitente es obligatorio').bail()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El nombre debe contener solo letras'),

   body('issuingEmail')
      .custom(validateHasPaymentType).bail()
      .if(isPaymentNeededAttribute('issuingEmail', 'zelle'))
      .not().isEmpty().withMessage('El email del remitente es obligatorio').bail()
      .isEmail().withMessage('El email es inválido'),

   validateFields
], create);

// Restaurar un pago eliminado
router.put('/restore/:id', [
   validateJWT,
   validatePermission('payments', 'delete', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),
   
   validateFields
], findByIdAndRestore);

// Aprobar un pago
router.put('/aprove/:id', [
   validateJWT,
   validatePermission('payments', 'edit', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido')
      .custom(paymentId => validatePaymentAndHasStatus(paymentId, {
         status: 'pendiente', errorMessage: 'El pago debe estar pendiente para poder poder cambiar a status "aprovado"'
      })),
   
   validateFields
], findByIdAndAprove);

// denegar un pago
router.delete('/deny/:id', [
   validateJWT,
   validatePermission('payments', 'edit', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido')
      .custom(paymentId => validatePaymentAndHasStatus(paymentId, {
         status: 'pendiente', errorMessage: 'El pago debe estar pendiente para poder poder cambiar a status "denegado"'
      })),

   body('comments')
      .not().isEmpty().withMessage('El motivo de negación es obligatoria').bail()
      .isString().withMessage('El motivo de negación debe tener un formato string'),
   
   validateFields
], findByIdAndDeny);

// Eliminar un pago
router.delete('/:id', [
   validateJWT,
   validatePermission('payments', 'delete'),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido')
      .custom(paymentId => validatePaymentAndHasStatus(paymentId, {
         status: 'pendiente', errorMessage: 'El pago debe estar pendiente para poder poder eliminarlo'
      })),
   
   validateFields
], findByIdAndDelete);



// Exports
module.exports = {
   name: 'payments',
   router
};