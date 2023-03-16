const { request, response } = require('express');
const { Op } = require('sequelize');

// Modelos
const { Product } = require('../database/models');



// Funciones del controlador

/**
 * Crear un nuevo producto.
 * @param {string} name string. `body`.
 * @param {integer} qtyPerPallet integer. `body`.
 */
const create = async (req = request, res = response) => {
   try {
      const { name, qtyPerPallet } = req.body;

      const [product, created] = await Product.findOrCreate({
         where: { name },
         defaults: {
            qtyPerPallet
         },
         paranoid: false
      });

      if (!created && product.deletedAt) {
         await product.restore();
      }

      res.json(product);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Listar productos registrados.
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { name, skip = 0, limit } = req.query;

      let where = {}

      if (typeof name != 'undefined') {
         where.name = {
            [Op.substring]: name
         }
      }

      if (limit) {
         const { rows, count } = await Product.findAndCountAll({
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
         const products = await Product.findAll({
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
 * Obtener un producto dado su id.
 * @param {integer} id integer. `params`
 */
const findById = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const product = await Product.findByPk(id);

      if (!product) {
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

      res.json(product);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Eliminar un producto dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndDelete = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const product = await Product.findByPk(id);

      if (!product) {
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

      await product.destroy();
   
      res.json(product);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Actualizar información de un producto dado su id.
 * @param {integer} id integer. `params`
 * @param {string} name string. `body`. Opcional
 * @param {integer} qtyPerPallet integer. `body`. Opcional
 */
const findByIdAndUpdate = async (req = request, res = response) => {
   try {
      const { name, qtyPerPallet } = req.body;
   
      const { id } = req.params;

      const product = await Product.findByPk(id);

      if (!product) {
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

      if (name) {
         product.name = name;
      }

      if (qtyPerPallet) {
         product.qtyPerPallet = qtyPerPallet;
      }

      await product.save();

      res.json(product);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Restaurar producto eliminado dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndRestore = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const product = await Product.findByPk(id, { paranoid: false });

      if (!product) {
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

      if (!product.deletedAt) {
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

      await product.restore();
   
      res.json(product);
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