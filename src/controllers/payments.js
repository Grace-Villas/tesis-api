const { request, response } = require('express');

// Modelos
const { Payment, Company, PaymentMethod, PaymentType, PaymentStatus } = require('../database/models');



// Eager loading
const eLoad = [
   {
      model: Company,
      as: 'company'
   },
   {
      model: PaymentStatus,
      as: 'status'
   },
   {
      model: PaymentMethod,
      as: 'paymentMethod',
      include: {
         model: PaymentType,
         as: 'paymentType'
      }
   }
];

// Funciones del controlador

/**
 * Crear un nuevo pago.
 * @param {integer} paymentMethodId integer. `body`.
 * @param {number} amount number. `body`.
 * @param {string} date string. `body`.
 * @param {string} reference string. `body`. Opcional
 * @param {string} issuingName string. `body`. Opcional
 * @param {string} issuingEmail string. `body`. Opcional
 */
const create = async (req = request, res = response) => {
   try {
      const { paymentMethodId, amount, date, reference, issuingName, issuingEmail } = req.body;

      const authUser = req.authUser;

      const status = await PaymentStatus.findOne({
         where: { name: 'pendiente' }
      });

      const data = {
         companyId: authUser.companyId,
         statusId: status.id,
         paymentMethodId,
         amount,
         date,
         reference,
         issuingName,
         issuingEmail
      }

      const payment = await Payment.create(data);

      res.json(payment);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Listar pagos registrados.
 * @param {integer} companyId string, filtro de búsqueda. `query`. Opcional
 * @param {integer} statusId string, filtro de búsqueda. `query`. Opcional
 * @param {integer} date string, filtro de búsqueda. `query`. Opcional
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { companyId, statusId, date, skip = 0, limit } = req.query;

      const authUser = req.authUser;

      let where = {}

      if (typeof companyId != 'undefined') {
         where.companyId = companyId;
      }

      if (typeof statusId != 'undefined') {
         where.statusId = statusId;
      }

      if (typeof date != 'undefined') {
         where.date = date;
      }

      if (authUser.companyId) {
         where.companyId = authUser.companyId;
      }

      if (limit) {
         const { rows, count } = await Payment.findAndCountAll({
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
         const payments = await Payment.findAll({
            include: eLoad,
            where,
            order: [
               ['date', 'ASC']
            ]
         });
   
         res.json(payments);
      }
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Obtener un pago por su id.
 * @param {integer} id integer. `params`
 */
const findById = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const authUser = req.authUser;

      const payment = await Payment.findByPk(id, {
         include: eLoad
      });

      if (!payment || (authUser.companyId && authUser.companyId != payment.companyId)) {
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

      res.json(payment);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Eliminar un pago dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndDelete = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const authUser = req.authUser;

      const payment = await Payment.findByPk(id);

      if (!payment || (authUser.companyId && authUser.companyId != payment.companyId)) {
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

      await payment.destroy();
   
      res.json(payment);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Restaurar pago eliminado.
 * @param {integer} id integer. `params`
 */
const findByIdAndRestore = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const payment = await Payment.findByPk(id, { paranoid: false });

      if (!payment || (authUser.companyId && authUser.companyId != payment.companyId)) {
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

      if (!payment.deletedAt) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: `El id: ${id} no ha sido eliminado`,
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      await payment.restore();
   
      res.json(payment);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Marcar pago como aprobado.
 * @param {integer} id integer. `params`
 */
const findByIdAndAprove = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const [payment, status] = await Promise.all([
         Payment.findByPk(id, {
            include: eLoad
         }),
         PaymentStatus.findOne({
            where: { name: 'aprobado' }
         })
      ]);

      if (!payment) {
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

      payment.statusId = status.id;

      await payment.save();
   
      res.json(payment);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Marcar pago como denegado.
 * @param {integer} id integer. `params`
 * @param {string} comments string. `body`
 */
const findByIdAndDeny = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const { comments } = req.body;

      const [payment, status] = await Promise.all([
         Payment.findByPk(id, {
            include: eLoad
         }),
         PaymentStatus.findOne({
            where: { name: 'denegado' }
         })
      ]);

      if (!payment) {
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

      payment.statusId = status.id;

      payment.comments = comments;

      await payment.save();

      await payment.reload();
   
      res.json(payment);
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
   findByIdAndDelete,
   findByIdAndRestore,
   findByIdAndAprove,
   findByIdAndDeny
}