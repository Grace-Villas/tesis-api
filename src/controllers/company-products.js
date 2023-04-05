const { request, response } = require('express');

// Modelos
const { Product, CompanyProduct } = require('../database/models');



// Eager loading
const eLoad = [
   {
      model: Product,
      as: 'product'
   }
];



// Funciones del controlador

/**
 * Listar productos de una compañía registrados.
 * @param {integer} companyId integer, filtro de búsqueda (Paginación). `query`
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { companyId, skip = 0, limit } = req.query;

      let where = {}

      if (typeof companyId != 'undefined') {
         where.companyId = companyId;
      }

      if (limit) {
         const { rows, count } = await CompanyProduct.findAndCountAll({
            include: eLoad,
            where,
            offset: Number(skip),
            limit: Number(limit),
            order: [
               ['product', 'name', 'ASC']
            ]
         });

         const pages = Math.ceil(count / Number(limit));

         res.json({
            rows,
            count,
            pages
         });
      } else {
         const products = await CompanyProduct.findAll({
            include: eLoad,
            where,
            order: [
               ['product', 'name', 'ASC']
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
 * Obtener un producto de compañía dado su id.
 * @param {integer} id integer. `params`
 */
const findById = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const authUser = req.authUser;

      const product = await CompanyProduct.findByPk(id, {
         include: eLoad
      });

      if (!product || (authUser.companyId && (authUser.companyId != product.companyId))) {
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


// Exports
module.exports = {
   findAll,
   findById
}