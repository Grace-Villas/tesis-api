const { request, response } = require('express');

// Modelos
const {
   Dispatch, DispatchStatus, Company, User, DispatchProduct, Product, Batch, BatchStatus, Receiver, City, State, CompanyProduct
} = require('../database/models');

// Helpers
const { updateDispatchBillings } = require('../helpers/billing');
const { updateBatchIfFullyDelivered } = require('../helpers/batches');



// Eager loading
const eLoad = [
   {
      model: User,
      as: 'applicant'
   },
   {
      model: Company,
      as: 'company'
   },
   {
      model: DispatchStatus,
      as: 'status'
   },
   {
      model: Receiver,
      as: 'receiver',
      include: {
         model: City,
         as: 'city',
         include: {
            model: State,
            as: 'state'
         }
      }
   },
   {
      model: Batch,
      as: 'batch',
      include: {
         model: BatchStatus,
         as: 'status'
      }
   },
   {
      model: DispatchProduct,
      as: 'products',
      include: {
         model: CompanyProduct,
         as: 'product',
         include: {
            model: Product,
            as: 'product'
         }
      }
   }
];



// Funciones del controlador

/**
 * Crear un nuevo despacho.
 * @param {string} date string. `body`.
 * @param {integer} receiverId integer. `body`.
 * @param {Array<{productId:integer,qty:integer}>} products integer. `body`.
 * @param {integer} companyId integer. `body`.
 */
const create = async (req = request, res = response) => {
   try {
      const { date, receiverId, products, companyId } = req.body;

      const user = req.authUser;

      if (!user.companyId && typeof companyId == 'undefined') {
         return res.status(400).json({
            errors: [
               {
                  msg: `El id de la companía es obligatorio`,
                  param: 'companyId',
                  location: 'body'
               }
            ]
         });
      }

      await Promise.all(products.map(p => CompanyProduct.decrement('stock', {
         by: p.qty,
         where: { id: p.productId }
      })));

      const status = await DispatchStatus.findOne({
         where: { name: 'pendiente' }
      });

      const data = {
         companyId: user.companyId ?? companyId,
         userId: user.id,
         receiverId,
         statusId: status.id,
         date,
         products
      }

      const dispatch = await Dispatch.create(data, {
         include: {
            model: DispatchProduct,
            as: 'products'
         }
      });

      res.json(dispatch);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Listar despachos registrados.
 * @param {string} date string, filtro de búsqueda. `query`
 * @param {integer} companyId string, filtro de búsqueda. `query`
 * @param {integer} userId string, filtro de búsqueda. `query`
 * @param {integer} statusId string, filtro de búsqueda. `query`
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { companyId, userId, statusId, date, skip = 0, limit } = req.query;

      const authUser = req.authUser;

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

      if (typeof companyId != 'undefined') {
         where.companyId = companyId;
      }

      if (authUser.companyId) {
         where.companyId = authUser.companyId;
      }

      if (limit) {
         const { rows, count } = await Dispatch.findAndCountAll({
            include: eLoad,
            where,
            distinct: true,
            offset: Number(skip),
            limit: Number(limit),
            order: [
               ['date', 'DESC']
            ]
         });

         const pages = Math.ceil(count / Number(limit));

         res.json({
            rows,
            count,
            pages
         });
      } else {
         const dispatches = await Dispatch.findAll({
            include: eLoad,
            where,
            order: [
               ['date', 'DESC']
            ]
         });
   
         res.json(dispatches);
      }
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Obtener un despacho dado su id.
 * @param {integer} id integer. `params`
 */
const findById = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const authUser = req.authUser;
      
      const dispatch = await Dispatch.findByPk(id, {
         include: eLoad,
      });

      if (!dispatch || (authUser.companyId && authUser.companyId != dispatch.companyId)) {
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

      res.json(dispatch);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Cancelar un despacho dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndCancel = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const authUser = req.authUser;

      const dispatch = await Dispatch.findByPk(id, {
         include: eLoad
      });

      if (!dispatch || (authUser.companyId && authUser.companyId != dispatch.companyId)) {
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

      const status = await DispatchStatus.findOne({
         where: { name: 'cancelado' }
      });

      await Promise.all(dispatch.products.map(p => CompanyProduct.increment('stock', {
         by: p.qty,
         where: { id: p.productId }
      })));

      dispatch.statusId = status.id;

      await dispatch.save();

      await dispatch.reload();
   
      res.json(dispatch);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Entregar un despacho dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndDeliver = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const dispatch = await Dispatch.findByPk(id, {
         include: eLoad
      });

      if (!dispatch) {
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

      // Actualizar billings
      await updateDispatchBillings(dispatch.products);

      const status = await DispatchStatus.findOne({
         where: { name: 'entregado' }
      });

      dispatch.statusId = status.id;

      await dispatch.save();

      // Verificar que si no existen más despachos en el lote el mismo se marca como finalizado
      await updateBatchIfFullyDelivered(dispatch.batchId);

      await dispatch.reload();
   
      res.json(dispatch);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Cancelar un despacho dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndDeny = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const { comments } = req.body;

      const dispatch = await Dispatch.findByPk(id, {
         include: eLoad
      });

      if (!dispatch) {
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

      const status = await DispatchStatus.findOne({
         where: { name: 'denegado' }
      });

      await Promise.all(dispatch.products.map(p => CompanyProduct.increment('stock', {
         by: p.qty,
         where: { id: p.productId }
      })));

      dispatch.statusId = status.id;

      dispatch.comments = comments;

      await dispatch.save();

      await dispatch.reload();
   
      res.json(dispatch);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Asignar despacho a lote dado su id.
 * @param {integer} id integer. `params`
 * @param {integer} batchId integer. `body`
 */
const findByIdAndAllocateBatch = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const { batchId } = req.body;

      const [dispatch, status] = await Promise.all([
         Dispatch.findByPk(id, {
            include: eLoad
         }),
         DispatchStatus.findOne({
            where: { name: 'agendado' }
         })
      ]);

      dispatch.statusId = status.id
      
      dispatch.batchId = batchId;

      await dispatch.save();

      await dispatch.reload();
   
      res.json(dispatch);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Retirar despacho de lote dado su id.
 * @param {integer} id integer. `params`
 * @param {integer} batchId integer. `body`
 */
const findByIdAndDellocateBatch = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const [dispatch, status] = await Promise.all([
         Dispatch.findByPk(id, {
            include: eLoad
         }),
         DispatchStatus.findOne({
            where: { name: 'pendiente' }
         })
      ]);

      dispatch.statusId = status.id
      
      dispatch.batchId = null;

      await dispatch.save();

      await dispatch.reload();
   
      res.json(dispatch);
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
   findByIdAndCancel,
   findByIdAndDeliver,
   findByIdAndDeny,
   findByIdAndAllocateBatch,
   findByIdAndDellocateBatch
}