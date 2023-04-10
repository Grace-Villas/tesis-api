const { request, response } = require('express');

// Modelos
const { BatchStatus } = require('../database/models');



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
         const { rows, count } = await BatchStatus.findAndCountAll({
            offset: Number(skip),
            limit: Number(limit),
            order: [
               ['number', 'ASC']
            ]
         });

         const pages = Math.ceil(count / Number(limit));

         res.json({
            rows,
            count,
            pages
         });
      } else {
         const statuses = await BatchStatus.findAll({
            order: [
               ['number', 'ASC']
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