const { request, response } = require('express');

// Modelos
const { City, State, Country } = require('../database/models');



// Eager loading
const eLoad = [
   {
      model: State,
      as: 'state',
      include: {
         model: Country,
         as: 'country'
      }
   }
];

// Funciones del controlador

/**
 * Crear una nueva ciudad.
 * @param {string} name string. `body`.
 * @param {string} stateId integer. `body`.
 */
const create = async (req = request, res = response) => {
   try {
      const { stringName, stateId, hasDeliveries } = req.body;

      const city = await City.create({ name: stringName, stateId, hasDeliveries });

      res.json(city);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Listar ciudades registradas.
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { skip = 0, limit } = req.query;

      if (limit) {
         const { rows, count } = await City.findAndCountAll({
            include: eLoad,
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
         const cities = await City.findAll({
            include: eLoad,
            order: [
               ['name', 'ASC']
            ]
         });
   
         res.json(cities);
      }
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Obtener una ciudad por su id.
 * @param {integer} id integer. `params`
 */
const findById = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const city = await City.findByPk(id, {
         include: eLoad
      });

      if (!city) {
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

      res.json(city);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Eliminar una ciudad dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndDelete = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const city = await City.findByPk(id);

      if (!city) {
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

      await city.destroy();
   
      res.json(city);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

// 
/**
 * Actualizar información de una ciudad dado su id.
 * @param {integer} id integer. `params`
 * @param {string} name string. `body`. Opcional
 * @param {string} stateId integer. `body`. Opcional
 */
const findByIdAndUpdate = async (req = request, res = response) => {
   try {
      const { stringName, stateId, hasDeliveries } = req.body;
   
      const { id } = req.params;

      const city = await City.findByPk(id, {
         include: eLoad
      });

      if (!city) {
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

      if (stringName) {
         city.name = stringName;
      }

      if (stateId) {
         city.stateId = stateId;
      }

      if (typeof hasDeliveries != 'undefined') {
         city.hasDeliveries = hasDeliveries;
      }

      await city.save();

      await city.reload();

      res.json(city);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Restaurar ciudad eliminada.
 * @param {integer} id integer. `params`
 */
const findByIdAndRestore = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const city = await City.findByPk(id, { paranoid: false });

      if (!city) {
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

      if (!city.deletedAt) {
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

      await city.restore();
   
      res.json(city);
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