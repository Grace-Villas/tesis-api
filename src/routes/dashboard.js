const { Router } = require('express');
const { query } = require('express-validator');

const { validateJWT } = require('../middlewares/validate-jwt');
const { validateFields } = require('../middlewares/validate-fields');

const {
   getDollarPrice, getReceptionsCount, getCompaniesCount, getDispatchesCount, getBatchesCount, getDeliveredProductsCount, getPalletsCount,
} = require('../controllers/dashboard');



const router = Router();

// Rutas

// Listar tipos de pagos registrados
router.get('/dollar-price', [
   validateJWT
], getDollarPrice);

router.get('/batches-count', [
   validateJWT
], getBatchesCount);

router.get('/dispatches-count', [
   validateJWT
], getDispatchesCount);

router.get('/companies-count', [
   validateJWT
], getCompaniesCount);

router.get('/receptions-count', [
   validateJWT
], getReceptionsCount);

router.get('/pallet-count', [
   validateJWT
], getPalletsCount);

router.get('/delivered-products-count', [
   validateJWT
], getDeliveredProductsCount);



// Exports
module.exports = {
   name: 'dashboard',
   router
};