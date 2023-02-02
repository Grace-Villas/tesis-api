const { Router } = require('express');
const { body } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const { validateUniqueEmail } = require('../middlewares/custom-express');

const {
   login,
   renew,
   findByJWTAndUpdate,
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

router.put('/', [
   validateJWT,

   body('name').optional()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El nombre debe contener solo letras'),

   body('email').optional()
      .isEmail().withMessage('El email es inválido').bail()
      .custom((name, { req }) => validateUniqueEmail(name, { modelName: 'User', req, isUpdate: true })),
   
   validateFields
], findByJWTAndUpdate);



// Exports
module.exports = {
   name: 'auth',
   router
};