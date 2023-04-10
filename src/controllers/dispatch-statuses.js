const { request, response } = require('express');
const { Op } = require('sequelize');

// Modelos
const { DispatchStatus } = require('../database/models');



// Funciones del controlador

/**
 * Listar status de despacho registrados.
 * @param {integer} steps boolean, filtro de búsqueda. `query`
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { steps, skip = 0, limit } = req.query;

      let where = {}

      if (typeof steps != 'undefined' && steps) {
         where.number = {
            [Op.ne]: 0
         }
      }

      if (limit) {
         const { rows, count } = await DispatchStatus.findAndCountAll({
            where,
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
         const statuses = await DispatchStatus.findAll({
            where,
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