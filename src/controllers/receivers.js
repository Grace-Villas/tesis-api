const { request, response } = require('express');
const { Op } = require('sequelize');

// Modelos
const { Receiver, Company, City, State } = require('../database/models');



// Eager loading
const eLoad = [
   {
      model: Company,
      as: 'company'
   },
   {
      model: City,
      as: 'city',
      include: {
         model: State,
         as: 'state'
      }
   }
];



// Funciones del controlador

/**
 * Crear un nuevo destinatario.
 * @param {integer} x-token string. `headers`.
 * @param {integer} companyId integer. `body`.
 * @param {integer} cityId integer. `body`.
 * @param {string} name string. `body`.
 * @param {string} rut string. `body`.
 * @param {string} address string. `body`.
 * @param {string} phone string. `body`.
 */
const create = async (req = request, res = response) => {
   try {
      const { companyId, cityId, name, rut, address, phone } = req.body;

      const user = req.authUser;

      if (!user.companyId && typeof companyId == 'undefined') {
         return res.status(400).json({
            errors: [
               {
                  msg: `El id de la compañía es obligatorio`,
                  param: 'companyId',
                  location: 'body'
               }
            ]
         });
      }
      
      const data = {
         cityId,
         name,
         rut,
         address,
         phone,
         companyId: user.companyId ?? companyId
      }

      const receiver = await Receiver.create(data);

      res.json(receiver);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Listar destinatarios registrados.
 * @param {integer} x-token string. `headers`.
 * @param {integer} companyId integer, filtro de búsqueda. `query`
 * @param {integer} cityId integer, filtro de búsqueda. `query`
 * @param {integer} search string, filtro de búsqueda. `query`
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { companyId, cityId, search, skip = 0, limit } = req.query;

      const user = req.authUser;

      let where = {}

      if (typeof companyId != 'undefined') {
         where.companyId = companyId;
      }

      if (typeof cityId != 'undefined') {
         where.cityId = cityId;
      }

      if (typeof search != 'undefined') {
         where[Op.or] = [
            { name: { [Op.substring]: search } },
            { rut: { [Op.substring]: search } },
            { phone: { [Op.substring]: search } },
         ];
      }

      if (typeof user.companyId == 'number') {
         where.companyId = user.companyId;
      }

      if (limit) {
         const { rows, count } = await Receiver.findAndCountAll({
            include: eLoad,
            where,
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
         const products = await Receiver.findAll({
            include: eLoad,
            where,
            order: [
               ['name', 'ASC']
            ]
         });
   
         res.json(products);
      }
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Obtener un destinatario dado su id.
 * @param {integer} x-token string. `headers`.
 * @param {integer} id integer. `params`
 */
const findById = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const user = req.authUser;

      const receiver = await Receiver.findByPk(id, {
         include: eLoad
      });

      if (!receiver || (user.companyId && (receiver.companyId != user.companyId))) {
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

      res.json(receiver);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Eliminar un destinatario dado su id.
 * @param {integer} x-token string. `headers`.
 * @param {integer} id integer. `params`
 */
const findByIdAndDelete = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const user = req.authUser;

      const receiver = await Receiver.findByPk(id);

      if (!receiver || (user.companyId != receiver.companyId)) {
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

      await receiver.destroy();
   
      res.json(receiver);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Actualizar información de un destinatario dado su id.
 * @param {integer} x-token string. `headers`.
 * @param {integer} id integer. `params`
 * @param {integer} cityId integer. `body`. Opcional
 * @param {string} name string. `body`. Opcional
 * @param {string} rut string. `body`. Opcional
 * @param {string} address string. `body`. Opcional
 * @param {string} phone string. `body`. Opcional
 */
const findByIdAndUpdate = async (req = request, res = response) => {
   try {
      const { cityId, name, rut, address, phone } = req.body;
   
      const { id } = req.params;

      const user = req.authUser;

      const receiver = await Receiver.findByPk(id);

      if (!receiver || (user.companyId != receiver.companyId)) {
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

      if (typeof cityId != 'undefined') {
         receiver.cityId = cityId;
      }

      if (typeof name != 'undefined') {
         receiver.name = name;
      }

      if (typeof rut != 'undefined') {
         receiver.rut = rut;
      }

      if (typeof address != 'undefined') {
         receiver.address = address;
      }

      if (typeof phone != 'undefined') {
         receiver.phone = phone;
      }

      await receiver.save();

      res.json(receiver);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Restaurar destinatario eliminado dado su id.
 * @param {integer} x-token string. `headers`.
 * @param {integer} id integer. `params`
 */
const findByIdAndRestore = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const user = req.authUser;

      const receiver = await Receiver.findByPk(id, { paranoid: false });

      if (!receiver || (user.companyId != receiver.companyId)) {
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

      if (!receiver.deletedAt) {
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

      await receiver.restore();
   
      res.json(receiver);
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