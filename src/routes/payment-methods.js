const { Router } = require('express');
const { body, query, param } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT, validatePermission } = require('../middlewares/validate-jwt');
const { validateStateId } = require('../middlewares/state-express');
const { validateUniqueName, validatePhone, validateRut } = require('../middlewares/custom-express');
const { validateDeliveryPriceNeeded } = require('../middlewares/city-express');
const { validateHasPaymentType, isPaymentAttributeRequired, validatePaymentTypeId } = require('../middlewares/payment-types');
const { validatePaymentMethodId } = require('../middlewares/payment-methods');

const {
   create,
   findAll,
   findById,
   findByIdAndDelete,
   findByIdAndRestore,
   findByIdAndUpdate
} = require('../controllers/payment-methods');



const router = Router();

// Rutas

// Listar métodos de pago registrados
router.get('/', [
   validateJWT,

   query('limit', 'El límite de documentos debe ser un entero mayor a cero').optional().isInt({gt: 0}),
   query('skip', 'La cantidad de documentos a omitir debe ser un entero mayor a cero').optional().isInt({min: 0}),
   validateFields
], findAll);

// Obtener un método de pago según su id
router.get('/:id', [
   validateJWT,
   validatePermission('payment-methods', 'list', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findById);

// Crear un nuevo método de pago
router.post('/', [
   validateJWT,
   validatePermission('payment-methods', 'create', true),

   body('paymentTypeId')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validatePaymentTypeId),

   body('bankName')
      .custom(validateHasPaymentType).bail()
      .if(isPaymentAttributeRequired('bankName'))
      .not().isEmpty().withMessage('El nombre del banco es obligatorio').bail()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El nombre del banco debe contener solo letras'),

   body('holderName')
      .custom(validateHasPaymentType).bail()
      .if(isPaymentAttributeRequired('holderName'))
      .not().isEmpty().withMessage('El nombre del cuentahabiente es obligatorio').bail()
      .isString().withMessage('El nombre del cuentahabiente debe tener un formato string'),

   body('holderDni')
      .custom(validateHasPaymentType).bail()
      .if(isPaymentAttributeRequired('holderDni'))
      .not().isEmpty().withMessage('El rut del cuentahabiente es obligatorio').bail()
      .isString().withMessage('El rut debe tener un formato string').bail()
      .custom(validateRut),

   body('accountNumber')
      .custom(validateHasPaymentType).bail()
      .if(isPaymentAttributeRequired('accountNumber'))
      .not().isEmpty().withMessage('El número de cuenta es obligatorio').bail()
      .isString().withMessage('El número de cuenta debe tener un formato string').bail()
      .isNumeric({no_symbols: true}).withMessage('El número de cuenta debe contener solo números'),

   body('user')
      .custom(validateHasPaymentType).bail()
      .if(isPaymentAttributeRequired('user'))
      .not().isEmpty().withMessage('El nombre de usuario es obligatorio').bail()
      .isString().withMessage('El nombre de usuario debe tener un formato string'),

   body('email')
      .custom(validateHasPaymentType).bail()
      .if(isPaymentAttributeRequired('email'))
      .not().isEmpty().withMessage('El email es obligatorio').bail()
      .isEmail().withMessage('El email es inválido'),

   body('phone')
      .custom(validateHasPaymentType).bail()
      .if(isPaymentAttributeRequired('phone'))
      .not().isEmpty().withMessage('El teléfono es obligatorio').bail()
      .custom((phone => validatePhone(phone, { locale: 'es-VE', phoneExtension: '+58' }))),

   validateFields
], create);

// Actualizar un método de pago
router.put('/:id', [
   validateJWT,
   validatePermission('payment-methods', 'edit', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido').bail()
      .custom(validatePaymentMethodId),
   
   body('bankName').optional()
      .custom(validateHasPaymentType).bail()
      .if(isPaymentAttributeRequired('bankName'))
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El nombre del banco debe contener solo letras'),

   body('holderName').optional()
      .custom(validateHasPaymentType).bail()
      .if(isPaymentAttributeRequired('holderName'))
      .isString().withMessage('El nombre del cuentahabiente debe tener un formato string'),

   body('holderDni').optional()
      .custom(validateHasPaymentType).bail()
      .if(isPaymentAttributeRequired('holderDni'))
      .isString().withMessage('El rut debe tener un formato string').bail()
      .custom(validateRut),

   body('accountNumber').optional()
      .custom(validateHasPaymentType).bail()
      .if(isPaymentAttributeRequired('accountNumber'))
      .isString().withMessage('El número de cuenta debe tener un formato string').bail()
      .isNumeric({no_symbols: true}).withMessage('El número de cuenta debe contener solo números'),

   body('user').optional()
      .custom(validateHasPaymentType).bail()
      .if(isPaymentAttributeRequired('user'))
      .isString().withMessage('El nombre de usuario debe tener un formato string'),

   body('email').optional()
      .custom(validateHasPaymentType).bail()
      .if(isPaymentAttributeRequired('email'))
      .isEmail().withMessage('El email es inválido'),

   body('phone').optional()
      .custom(validateHasPaymentType).bail()
      .if(isPaymentAttributeRequired('phone'))
      .custom((phone => validatePhone(phone, { locale: 'es-VE', phoneExtension: '+58' }))),

   validateFields
], findByIdAndUpdate);

// Restaurar método de pago eliminado
router.put('/restore/:id', [
   validateJWT,
   validatePermission('payment-methods', 'delete', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),
   
   validateFields
], findByIdAndRestore);

// Eliminar un método de pago
router.delete('/:id', [
   validateJWT,
   validatePermission('payment-methods', 'delete', true),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),
   
   validateFields
], findByIdAndDelete);



// Exports
module.exports = {
   name: 'payment-methods',
   router
};