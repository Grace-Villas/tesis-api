const { request, response } = require('express');
const { Op } = require('sequelize');

// Modelos
const { Reception, ReceptionProduct, ReceptionProductBilling, CompanyProduct, Product, Company, User } = require('../database/models');



// Eager loading
const eLoad = [
   {
      model: Company,
      as: 'company'
   },
   {
      model: User,
      as: 'consignee'
   },
   {
      model: ReceptionProduct,
      as: 'products',
      include: [
         {
            model: Product,
            as: 'product',
         },
         {
            model: ReceptionProductBilling,
            as: 'billings'
         }
      ]
   }
];



// Funciones del controlador

/**
 * Crear un nuevo envío.
 * @param {integer} companyId integer. `body`.
 * @param {string} date string. `body`.
 * @param {Array<{productId:integer,qty:integer}>} products array. `body`
 */
const create = async (req = request, res = response) => {
   try {
      const { companyId, date, products } = req.body;

      const user = req.authUser;

      const data = { companyId, userId: user.id, date, products }

      const reception = await Reception.create(data, {
         include: {
            model: ReceptionProduct,
            as: 'products'
         }
      });

      const productsData = await Promise.all(reception.products.map(p => p.getProduct()));
      
      const toUpdateOrCreate = await Promise.all(productsData.map(p => {
         return CompanyProduct.findOne({
            where: { companyId, productId: p.id }
         });
      }));

      await Promise.all(reception.products.map(p => {
         const qtyPerPallet = productsData.find(pd => pd.id == p.productId).qtyPerPallet;

         const companyProduct = toUpdateOrCreate.find(tuoc => tuoc?.companyId == companyId && tuoc?.productId == p.productId);

         if (!companyProduct) {
            return CompanyProduct.create({
               companyId,
               productId: p.productId,
               stock: p.qty * qtyPerPallet
            });
         }

         return CompanyProduct.increment('stock', {
            by: p.qty * qtyPerPallet,
            where: { id: companyProduct.id }
         });
      }));

      // billing por paleta
      const billings = reception.products.map(p => {
         const qtyPerPallet = productsData.find(pd => pd.id == p.productId).qtyPerPallet;

         return [...Array(p.qty).keys()].map(_ => ({
            receptionProductId: p.id,
            dateIn: date,
            qtyLeft: qtyPerPallet 
         }));
      });
      
      await Promise.all(billings.flat().map(data => ReceptionProductBilling.create(data)));

      res.json(reception);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Listar envíos registrados.
 * @param {integer} date string, filtro de búsqueda. `query`
 * @param {integer} companyId string, filtro de búsqueda. `query`
 * @param {integer} userId string, filtro de búsqueda. `query`
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { date, companyId, userId, skip = 0, limit } = req.query;

      const authUser = req.authUser;

      let where = {}

      if (typeof date != 'undefined') {
         where.date = date;
      }

      if (typeof companyId != 'undefined') {
         where.companyId = companyId;
      }

      if (typeof userId != 'undefined') {
         where.userId = userId;
      }

      if (authUser.companyId) {
         where.companyId = authUser.companyId;
      }

      if (limit) {
         const { rows, count } = await Reception.findAndCountAll({
            include: eLoad,
            distinct: true,
            where,
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
         const products = await Reception.findAll({
            include: eLoad,
            where,
            order: [
               ['date', 'DESC']
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
 * Obtener un envío dado su id.
 * @param {integer} id integer. `params`
 */
const findById = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const authUser = req.authUser;

      const reception = await Reception.findByPk(id, {
         include: eLoad
      });

      if (!reception || (authUser.companyId && (reception.companyId !== authUser.companyId))) {
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

      res.json(reception);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}


// Exports
module.exports = {
   create,
   findAll,
   findById
}