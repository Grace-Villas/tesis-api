const { Router } = require('express');
const { query } = require('express-validator');

const { validateJWT } = require('../middlewares/validate-jwt');
const { validateFields } = require('../middlewares/validate-fields');

const {
   findAll,
} = require('../controllers/payment-statuses');



const router = Router();

// Rutas

// Listar tipos de pagos registrados
router.get('/', [
   validateJWT,

   query('limit', 'El límite de documentos debe ser un entero mayor a cero').optional().isInt({gt: 0}),
   query('skip', 'La cantidad de documentos a omitir debe ser un entero mayor a cero').optional().isInt({min: 0}),
   validateFields
], findAll);



// Exports
module.exports = {
   name: 'payment-statuses',
   router
};