const { request, response } = require('express');

// Modelos
const { PaymentStatus } = require('../database/models');



// Funciones del controlador

/**
 * Listar status de lote registrados.
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { skip = 0, limit } = req.query;

      if (limit) {
         const { rows, count } = await PaymentStatus.findAndCountAll({
            offset: Number(skip),
            limit: Number(limit),
            order: [
               ['name', 'ASC']
            ]
         });

         const pages = Math.ceil(count / Number(limit));

         res.json({
            rows,
            count,
            pages
         });
      } else {
         const statuses = await PaymentStatus.findAll({
            order: [
               ['name', 'ASC']
            ]
         });
   
         res.json(statuses);
      }
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}



// Exports
module.exports = {
   findAll,
}