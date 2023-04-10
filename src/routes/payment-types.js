const { Router } = require('express');

const { validateJWT } = require('../middlewares/validate-jwt');

const {
   findAll,
} = require('../controllers/payment-types');



const router = Router();

// Rutas

// Listar tipos de pagos registrados
router.get('/', [
   validateJWT
], findAll);



// Exports
module.exports = {
   name: 'payment-types',
   router
};