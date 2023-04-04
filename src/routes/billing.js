const { Router } = require('express');
const { query, param } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT, validatePermission } = require('../middlewares/validate-jwt');

const {
   findBillingByCompanyId
} = require('../controllers/billing');



const router = Router();

// Rutas

// Obtener un despacho según su id
router.get('/:id', [
   validateJWT,
   validatePermission('payments', 'list'),

   query().optional()
      .isString('month').withMessage('El mes debe tener un formato string'),

   query().optional()
      .isString('year').withMessage('El año debe tener un formato string'),

   param('id')
      .not().isEmpty().withMessage('El id es obligatorio').bail()
      .isInt({min: 1}).withMessage('El id es inválido'),

   validateFields
], findBillingByCompanyId);



// Exports
module.exports = {
   name: 'billing',
   router
};