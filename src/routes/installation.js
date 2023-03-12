const { Router } = require('express');
const { body } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateUniqueEmail } = require('../middlewares/custom-express');
const { validateInstalled } = require('../middlewares/installation');
const { validateInstallationPhone } = require('../middlewares/installation-express');

const {
   install,
   verifyInstallation
} = require('../controllers/installation');



const router = Router();

// Rutas

// Verificar si el sistema está inicializado o no
router.get('/', verifyInstallation);

// Inicializar sistema con datos básicos
router.post('/', [
   validateInstalled,

   // Configuración de instalación
   body('companyName')
      .not().isEmpty().withMessage('El nombre de la empresa es obligatorio').bail()
      .isString().withMessage('El nombre debe ser un string'),

   body('companyEmail')
      .not().isEmpty().withMessage('El email de la empresa es obligatorio').bail()
      .isEmail().withMessage('El email es inválido').bail(),

   body('companyContactEmail')
      .not().isEmpty().withMessage('El email de contacto de la empresa es obligatorio').bail()
      .isEmail().withMessage('El email es inválido').bail(),

   body('companyPhone')
      .not().isEmpty().withMessage('El teléfono de la empresa es obligatorio').bail()
      .custom(validateInstallationPhone),

   body('palletDay')
      .not().isEmpty().withMessage('El precio de almacenamiento por paleta por día es obligatorio')
      .isFloat({gt: 0}).withMessage('El precio de almacenamiento por paleta por día debe ser un decimal mayor a 0'),

   body('country')
      .not().isEmpty().withMessage('El país es obligatorio').bail()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El país debe contener solo letras'),
   
   body('locale')
      .not().isEmpty().withMessage('El código de locación es obligatorio').bail()
      .isLocale().withMessage('El código de locación es inválido'),

   body('phoneExtension')
      .not().isEmpty().withMessage('La extensión telefónica es obligatoria').bail()
      .isLength({min: 2, max: 4}).withMessage('La extensión telefónica es inválida'),

   body('state')
      .not().isEmpty().withMessage('El estado es obligatorio').bail()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El estado debe contener solo letras'),

   body('city')
      .not().isEmpty().withMessage('La ciudad es obligatoria').bail()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('La ciudad debe contener solo letras'),

   body('address')
      .not().isEmpty().withMessage('El nombre de la empresa es obligatorio').bail()
      .isString().withMessage('El nombre debe ser un string'),


   
   // Cuenta principal
   body('firstName')
      .not().isEmpty().withMessage('El nombre es obligatorio').bail()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El nombre debe contener solo letras'),
   
   body('lastName')
      .not().isEmpty().withMessage('El nombre es obligatorio').bail()
      .isAlpha('es-ES', { ignore: ' '}).withMessage('El nombre debe contener solo letras'),
      
   body('password')
      .not().isEmpty().withMessage('La contraseña es obligatoria').bail()
      .isLength({ min: 8 }).withMessage('La contraseña debe contener mínimo 8 caracteres'),

   body('email')
      .not().isEmpty().withMessage('El email es obligatorio').bail()
      .isEmail().withMessage('El email es inválido').bail()
      .custom((email, { req }) => validateUniqueEmail(email, { modelName: 'User', req })),

   validateFields
], install);



// Exports
module.exports = {
   name: 'installation',
   router
};