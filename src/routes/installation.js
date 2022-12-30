const { Router } = require('express');
const { body, query, param } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateUniqueEmail } = require('../middlewares/custom-express');
const { validateInstalled } = require('../middlewares/installation');

const {
   install
} = require('../controllers/installation');



const router = Router();

// Rutas

// Crear un nuevo usuario
router.post('/', [
   validateInstalled,
   
   body('name')
      .not().isEmpty().withMessage('El nombre es obligatorio').bail()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El nombre debe contener solo letras'),
      
   body('password')
      .not().isEmpty().withMessage('La contraseña es obligatoria').bail()
      .isLength({ min: 8 }).withMessage('La contraseña debe contener mínimo 8 caracteres'),

   body('email')
      .not().isEmpty().withMessage('El email es obligatorio').bail()
      .isEmail().withMessage('El email es inválido').bail()
      .custom((name, { req }) => validateUniqueEmail(name, { modelName: 'User', req })),

   validateFields
], install);



// Exports
module.exports = {
   name: 'installation',
   router
};