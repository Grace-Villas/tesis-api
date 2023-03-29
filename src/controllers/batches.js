const { request, response } = require('express');

// Modelos
const { Batch, BatchStatus, User, Dispatch, DispatchStatus, DispatchProduct, CompanyProduct, Product, Company, Receiver } = require('../database/models');



// Eager loading
const eLoad = [
   {
      model: Dispatch,
      as: 'dispatches',
      include: [
         {
            model: User,
            as: 'applicant'
         },
         {
            model: DispatchStatus,
            as: 'status'
         },
         {
            model: Company,
            as: 'company'
         },
         {
            model: Receiver,
            as: 'receiver'
         },
         {
            model: DispatchProduct,
            as: 'products',
            includes: {
               model: CompanyProduct,
               as: 'product',
               include: {
                  model: Product,
                  as: 'product'
               }
            }
         }
      ]
   },
   {
      model: BatchStatus,
      as: 'status'
   },
   {
      model: User,
      as: 'carrier'
   }
];

// Funciones del controlador

/**
 * Crear un nuevo lote.
 * @param {integer} userId integer. `body`.
 * @param {string} date string. `body`.
 * @param {Array<integer>} dispatches array. `body`.
 */
const create = async (req = request, res = response) => {
   try {
      const { userId, date, dispatches } = req.body;

      const batchStatus = await BatchStatus.findOne({
         where: { name: 'pendiente' }
      });

      const batch = await Batch.create({ userId, date, status: batchStatus.id });

      const dispatchStatus = await DispatchStatus.findOne({
         where: { name: 'agendado' }
      });

      await Promise.all(dispatches.map(dispatchId => {
         return Dispatch.update({
            batchId: batch.id,
            statusId: dispatchStatus.id
         }, {
            where: { id: dispatchId } 
         });
      }));

      res.json(batch);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Listar lotes registrados.
 * @param {string} date string, filtro de búsqueda. `query`
 * @param {integer} userId integer, filtro de búsqueda. `query`
 * @param {integer} statusId integer, filtro de búsqueda. `query`
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { date, userId, skip = 0, limit } = req.query;

      let where = {}

      if (typeof date != 'undefined') {
         where.date = date;
      }

      if (typeof userId != 'undefined') {
         where.userId = userId;
      }

      if (typeof statusId != 'undefined') {
         where.statusId = statusId;
      }

      if (limit) {
         const { rows, count } = await Batch.findAndCountAll({
            include: eLoad,
            where,
            offset: Number(skip),
            limit: Number(limit),
            order: [
               ['date', 'ASC']
            ]
         });

         const pages = Math.ceil(count / Number(limit));

         res.json({
            rows,
            count,
            pages
         });
      } else {
         const batches = await Batch.findAll({
            include: eLoad,
            where,
            order: [
               ['date', 'ASC']
            ]
         });
   
         res.json(batches);
      }
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Obtener un lote por su id.
 * @param {integer} id integer. `params`
 */
const findById = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const batch = await Batch.findByPk(id, {
         include: eLoad
      });

      if (!batch) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: `El id: ${id} no se encuentra en la base de datos`,
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      res.json(batch);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Actualizar información de un lote dado su id.
 * @param {integer} id integer. `params`
 * @param {integer} userId integer. `body`. Opcional
 */
const findByIdAndUpdate = async (req = request, res = response) => {
   try {
      const { userId } = req.body;
   
      const { id } = req.params;

      const batch = await Batch.findByPk(id, {
         include: eLoad
      });

      if (userId) {
         batch.userId = userId;
      }

      await batch.save();

      await batch.reload();

      res.json(batch);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Eliminar un lote dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndDelete = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const batch = await Batch.findByPk(id);

      if (!batch) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: `El id: ${id} no se encuentra en la base de datos`,
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      const dispatchStatus = await DispatchStatus.findOne({
         where: { name: 'pendiente' }
      });

      await Dispatch.update({
         batchId: null,
         statusId: dispatchStatus.id
      }, {
         where: { batchId: batch.id } 
      });

      await batch.destroy();
   
      res.json(batch);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Eliminar un lote dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndTransit = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const batch = await Batch.findByPk(id);

      if (!batch) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: `El id: ${id} no se encuentra en la base de datos`,
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      const dispatchStatus = await DispatchStatus.findOne({
         where: { name: 'embarcado' }
      });

      await Dispatch.update({
         statusId: dispatchStatus.id
      }, {
         where: { batchId: batch.id } 
      });

      const batchStatus = await BatchStatus.findOne({
         where: { name: 'en tránsito' }
      });

      batch.statusId = batchStatus.id;

      await batch.save();
   
      res.json(batch);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}



// Exports
module.exports = {
   create,
   findAll,
   findById,
   findByIdAndUpdate,
   findByIdAndDelete,
   findByIdAndTransit,
}