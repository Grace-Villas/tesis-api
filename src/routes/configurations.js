const { Router } = require('express');
const { body } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');

const {
   findAll,
   findByIdAndUpdate
} = require('../controllers/configurations');



const router = Router();

// Rutas

// Obtener configuraciones del sistema
router.get('/', findAll);

// Actualizar configuración del sistema dado su id
router.put('/:id', [
   validateJWT,
   
   body('value')
      .not().isEmpty().withMessage('El valor es obligatorio').bail()
      .isString().withMessage('El valor debe ser un string'),

   validateFields
], findByIdAndUpdate);



// Exports
module.exports = {
   name: 'config',
   router
};