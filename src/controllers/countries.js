const { request, response } = require('express');

// Modelos
const { Country } = require('../database/models');



// Funciones del controlador

/**
 * Crear un nuevo país.
 * @param {string} name string. `body`.
 * @param {string} locale string. `body`.
 * @param {integer} phoneExtension integer. `body`.
 */
const create = async (req = request, res = response) => {
   try {
      const { stringName, locale, phoneExtension } = req.body;

      const country = await Country.create({ name: stringName, locale, phoneExtension });

      res.json(country);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Listar países registrados.
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { skip, limit } = req.query;

      if (limit) {
         const { rows, count } = await Country.findAndCountAll({
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
         const countries = await Country.findAll({
            order: [
               ['name', 'ASC']
            ]
         });
   
         res.json(countries);
      }
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Obtener un país dado su id.
 * @param {integer} id integer. `params`
 */
const findById = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const country = await Country.findByPk(id);

      if (!country) {
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

      res.json(country);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Eliminar un país dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndDelete = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const country = await Country.findByPk(id);

      if (!country) {
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

      await country.destroy();
   
      res.json(country);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Actualizar información de un país dado su id.
 * @param {integer} id integer. `params`
 * @param {string} name string. `body`. Opcional
 * @param {string} locale string. `body`. Opcional
 * @param {integer} phoneExtension integer. `body`. Opcional
 */
const findByIdAndUpdate = async (req = request, res = response) => {
   try {
      const { stringName, locale, phoneExtension } = req.body;
   
      const { id } = req.params;

      const country = await Country.findByPk(id);

      if (!country) {
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
         country.name = stringName;
      }

      if (locale) {
         country.locale = locale;
      }

      if (phoneExtension) {
         country.phoneExtension = phoneExtension;
      }

      await country.save();

      res.json(country);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Restaurar país eliminado dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndRestore = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const country = await Country.findByPk(id, { paranoid: false });

      if (!country) {
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

      if (!country.deletedAt) {
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

      await country.restore();
   
      res.json(country);
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