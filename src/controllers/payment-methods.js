const { request, response } = require('express');
const { Op } = require('sequelize');

// Modelos
const { PaymentMethod, PaymentType } = require('../database/models');



// Eager loading
const eLoad = [
   {
      model: PaymentType,
      as: 'paymentType'
   }
];

// Funciones del controlador

/**
 * Crear un nuevo método de pago.
 * @param {integer} paymentTypeId integer. `body`.
 * @param {string} bankName string. `body`. Opcional
 * @param {string} holderName string. `body`. Opcional
 * @param {string} holderDni string. `body`. Opcional
 * @param {string} accountNumber string. `body`. Opcional
 * @param {string} user string. `body`. Opcional
 * @param {string} email string. `body`. Opcional
 * @param {string} phone string. `body`. Opcional
 */
const create = async (req = request, res = response) => {
   try {
      const { paymentTypeId, bankName, holderName, holderDni, accountNumber, user, email, phone } = req.body;

      const method = await PaymentMethod.create({ paymentTypeId, bankName, holderName, holderDni, accountNumber, user, email, phone });

      res.json(method);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Listar métodos de pago registrados.
 * @param {integer} paymentTypeId integer, filtro de búsqueda. `query`
 * @param {string} search string, filtro de búsqueda. `query`
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { paymentTypeId, search, skip = 0, limit } = req.query;

      let where = {}

      if (typeof paymentTypeId != 'undefined') {
         where.paymentTypeId = paymentTypeId;
      }

      if (typeof search != 'undefined') {
         where[Op.or] = [
            { bankName: { [Op.substring]: search } },
            { holderName: { [Op.substring]: search } },
            { holderDni: { [Op.substring]: search } },
            { accountNumber: { [Op.substring]: search } },
            { email: { [Op.substring]: search } },
            { phone: { [Op.substring]: search } },
            { user: { [Op.substring]: search } }
         ];
      }

      if (limit) {
         const { rows, count } = await PaymentMethod.findAndCountAll({
            include: eLoad,
            where,
            offset: Number(skip),
            limit: Number(limit),
            order: [
               ['paymentType', 'name', 'ASC']
            ]
         });

         const pages = Math.ceil(count / Number(limit));

         res.json({
            rows,
            count,
            pages
         });
      } else {
         const methods = await PaymentMethod.findAll({
            include: eLoad,
            where,
            order: [
               ['paymentType', 'name', 'ASC']
            ]
         });
   
         res.json(methods);
      }
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Obtener un método de pago por su id.
 * @param {integer} id integer. `params`
 */
const findById = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const method = await PaymentMethod.findByPk(id, {
         include: eLoad
      });

      if (!method) {
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

      res.json(method);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Eliminar un método de pago dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndDelete = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const method = await PaymentMethod.findByPk(id);

      if (!method) {
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

      await method.destroy();
   
      res.json(method);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Actualizar información de un método de pago dado su id.
 * @param {integer} id integer. `params`
 * @param {string} bankName string. `body`. Opcional
 * @param {string} holderName string. `body`. Opcional
 * @param {string} holderDni string. `body`. Opcional
 * @param {string} accountNumber string. `body`. Opcional
 * @param {string} user string. `body`. Opcional
 * @param {string} email string. `body`. Opcional
 * @param {string} phone string. `body`. Opcional
 */
const findByIdAndUpdate = async (req = request, res = response) => {
   try {
      const { bankName, holderName, holderDni, accountNumber, user, email, phone } = req.body;
   
      const { id } = req.params;

      const method = await PaymentMethod.findByPk(id, {
         include: eLoad
      });

      if (!method) {
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

      if (bankName) {
         method.bankName = bankName;
      }

      if (holderName) {
         method.holderName = holderName;
      }

      if (holderDni) {
         method.holderDni = holderDni;
      }

      if (accountNumber) {
         method.accountNumber = accountNumber;
      }

      if (user) {
         method.user = user;
      }

      if (email) {
         method.email = email;
      }

      if (phone) {
         method.phone = phone;
      }

      await method.save();

      res.json(method);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Restaurar método de pago eliminado.
 * @param {integer} id integer. `params`
 */
const findByIdAndRestore = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const method = await PaymentMethod.findByPk(id, { paranoid: false });

      if (!method) {
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

      if (!method.deletedAt) {
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

      await method.restore();
   
      res.json(method);
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
   findByIdAndUpdate,
}