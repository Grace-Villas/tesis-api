const { request, response } = require('express');

// Modelos
const { Company, Dispatch, Reception, Batch, ReceptionProduct, DispatchProduct, DispatchStatus } = require('../database/models');

// Helpers
const { dollarExchange } = require('../helpers/exchange');



// Funciones del controlador

const getDollarPrice = async (req = request, res = response) => {
   try {
      const dollar = await dollarExchange();

      res.json({dollar});
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

const getCompaniesCount = async (req = request, res = response) => {
   try {
      const count = await Company.count();

      res.json({count});
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

const getDispatchesCount = async (req = request, res = response) => {
   try {
      const authUser = req.authUser;

      let where = {}

      if (authUser.companyId) {
         where.companyId = authUser.companyId;
      }

      const count = await Dispatch.count({
         where
      });

      res.json({count});
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

const getReceptionsCount = async (req = request, res = response) => {
   try {
      const authUser = req.authUser;

      let where = {}

      if (authUser.companyId) {
         where.companyId = authUser.companyId;
      }

      const count = await Reception.count({
         where
      });

      res.json({count});
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

const getBatchesCount = async (req = request, res = response) => {
   try {
      const count = await Batch.count();

      res.json({count});
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

const getPalletsCount = async (req = request, res = response) => {
   try {
      const authUser = req.authUser;

      let where = {}

      if (authUser.companyId) {
         where['$reception.companyId$'] = authUser.companyId;
      }

      const count = await ReceptionProduct.sum('qty', {
         include: {
            model: Reception,
            as: 'reception'
         },
         where
      });

      res.json({count});
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

const getDeliveredProductsCount = async (req = request, res = response) => {
   try {
      const authUser = req.authUser;

      let where = {}

      if (authUser.companyId) {
         where['$dispatch.companyId$'] = authUser.companyId;
      }

      where['$dispatch.status.name$'] = 'entregado';

      const count = await DispatchProduct.sum('qty', {
         include: {
            model: Dispatch,
            as: 'dispatch',
            include: {
               model: DispatchStatus,
               as: 'status'
            }
         },
         where
      });

      res.json({count});
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}



// Exports
module.exports = {
   getDollarPrice,
   getCompaniesCount,
   getDispatchesCount,
   getReceptionsCount,
   getBatchesCount,
   getPalletsCount,
   getDeliveredProductsCount,
}