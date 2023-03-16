const { request, response } = require('express');

// Modelos
const { PaymentType } = require('../database/models');



// Funciones del controlador

/**
 * Listar tipos de pagos registrados.
 */
const findAll = async (req = request, res = response) => {
   try {
      const paymentTypes = await PaymentType.findAll({
         order: [
            ['name', 'ASC']
         ]
      });

      res.json(paymentTypes);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}


// Exports
module.exports = {
   findAll,
}