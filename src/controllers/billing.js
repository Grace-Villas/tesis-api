const { request, response } = require('express');
const moment = require('moment/moment');

// Modelos
const {
   ReceptionProductBilling, ReceptionProduct, Reception,
   Dispatch, DispatchStatus, Receiver, City,
   Payment, PaymentStatus
} = require('../database/models');

// Helpers
const { getBillingData } = require('../helpers/billing');



// Funciones del controlador

/**
 * Obtener el estado de cuenta de una compañía.
 * @param {integer} id integer. `params`.
 */
const findBillingByCompanyId = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const { month, year } = req.query;

      const { totalDebt, positiveBalance, currentMonthDebt, billingDetails } = await getBillingData(id, { month, year });
      
      res.json({currentMonthDebt, totalDebt, positiveBalance, billingDetails});
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}



// Exports
module.exports = {
   findBillingByCompanyId,
}