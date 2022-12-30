const { Router } = require('express');
const { body } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');

const {
   login,
   renew,
} = require('../controllers/users');



const router = Router();

// Rutas

// Login
router.post('/login', [
   body('password')
      .not().isEmpty().withMessage('La contraseña es obligatoria').bail()
      .isLength({ min: 8 }).withMessage('La contraseña debe contener mínimo 8 caracteres'),

   body('email')
      .not().isEmpty().withMessage('El email es obligatorio').bail()
      .isEmail().withMessage('El email es inválido').bail(),
   validateFields
], login);

// Renew connection
router.get('/renew', [
   validateJWT
], renew);



// Exports
module.exports = {
   name: 'auth',
   router
};