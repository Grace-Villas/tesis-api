const { request, response } = require('express');

// Modelos
const { State, Country } = require('../database/models');



// Eager loading
const eLoad = [
   {
      model: Country,
      as: 'country'
   }
];

// Funciones del controlador

/**
 * Crear un nuevo estado.
 * @param {string} name string. `body`.
 * @param {string} countryId integer. `body`.
 */
const create = async (req = request, res = response) => {
   try {
      const { stringName, countryId } = req.body;

      const state = await State.create({ name: stringName, countryId });

      res.json(state);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Listar estados registrados.
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { skip = 0, limit } = req.query;

      if (limit) {
         const { rows, count } = await State.findAndCountAll({
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
         const states = await State.findAll({
            include: eLoad,
            order: [
               ['name', 'ASC']
            ]
         });
   
         res.json(states);
      }
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Obtener un estado por su id.
 * @param {integer} id integer. `params`
 */
const findById = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const state = await State.findByPk(id, {
         include: eLoad
      });

      if (!state) {
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

      res.json(state);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Eliminar un estado dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndDelete = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const state = await State.findByPk(id);

      if (!state) {
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

      await state.destroy();
   
      res.json(state);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Actualizar información de un estado dado su id.
 * @param {integer} id integer. `params`
 * @param {string} name string. `body`. Opcional
 * @param {string} countryId integer. `body`. Opcional
 */
const findByIdAndUpdate = async (req = request, res = response) => {
   try {
      const { stringName, countryId } = req.body;
   
      const { id } = req.params;

      const state = await State.findByPk(id);

      if (!state) {
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
         state.name = stringName;
      }

      if (countryId) {
         state.countryId = countryId;
      }

      await state.save();

      res.json(state);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Restaurar estado eliminado.
 * @param {integer} id integer. `params`
 */
const findByIdAndRestore = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const state = await State.findByPk(id, { paranoid: false });

      if (!state) {
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

      if (!state.deletedAt) {
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

      await state.restore();
   
      res.json(state);
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