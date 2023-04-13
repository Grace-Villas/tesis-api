const { Op } = require('sequelize');
const moment = require('moment/moment');

// Models
const {
   ReceptionProductBilling, ReceptionProduct, Reception, Product,
   Dispatch, DispatchProduct, DispatchStatus, Receiver, City,
   Payment, PaymentStatus
} = require('../database/models');

// Helpers
const CompanyConfig = require('./config');



/**
 * Función para actualizar los datos de factura de los productos entregados
 * @async
 * @param {Array<Dispatch>} dispatch Despacho que se está entregando
 */
const updateDispatchBillings = async (dispatch) => {

   const dispatchProducts = dispatch.products;

   // Obtener información de billings (reception_product_billings) de los productos despachados
   const billings = await Promise.all(dispatchProducts.map(dispatchProduct => {
      return ReceptionProductBilling.findAll({
         include: [
            {
               model: ReceptionProduct,
               as: 'receptionProduct'
            }
         ], 
         where: {
            '$receptionProduct.productId$': dispatchProduct.product.productId,
            qtyLeft: { [Op.gt]: 0 }
         },
         order: [
            ['dateIn', 'ASC'],
            ['qtyLeft', 'ASC']
         ]
      })
   }));

   // Agrupar billings con dispatchProducts
   const pBillings = dispatchProducts.map(dispatchProduct => {
      return {
         dispatchProduct,
         billings: billings.flat().filter(bill => bill.receptionProduct.productId == dispatchProduct.product.productId)
      }
   });

   // Seleccionar cuales billings se van a actualizar y cuales no (filter)
   // Si se consume todo el qtyLeft setear dateOut en la fecha de despacho
   const filteredBillings = pBillings.map(pBill => {
      let qtyAcc = pBill.dispatchProduct.qty;

      let bills = [];

      pBill.billings.forEach(bill => {
         if (qtyAcc > 0) {
            let currentBill = {}

            if (qtyAcc <= bill.qtyLeft) {
               currentBill.id = bill.id,
               currentBill.qtyLeft = bill.qtyLeft - qtyAcc

               if (currentBill.qtyLeft == 0) {
                  currentBill.dateOut = dispatch.date;
               }

               qtyAcc = 0;

               bills.push(currentBill);
            } else {
               currentBill.id =  bill.id,
               currentBill.qtyLeft =  0,
               currentBill.dateOut =  dispatch.date

               qtyAcc -= bill.qtyLeft;

               bills.push(currentBill);
            }
         }
      });

      return bills;
   });

   // Transformar los arreglos multinivel en un arreglo plano para ejecutar Promise.all
   await Promise.all(filteredBillings.flat().map(bill => {
      const { id, ...rest } = bill;

      return ReceptionProductBilling.update({
         ...rest
      }, {
         where: { id } 
      });
   }));
}

/**
 * Función para obtener la información general del billing de 
 * una empresa dado su id
 * @async
 * @param {number} companyId Id de la compañía
 * @param {{month:string,year:string}} config Datos de calendario
 * @returns {Promise<{
 *    currentMonthDebt:number,
 *    totalDebt:number,
 *    positiveBalance:number,
 *    billingDetails:{
 *       dispatches:array<Dispatch>,
 *       receptionBillings:array<ReceptionProductBilling>
 *    }
 * }>}
 */
const getBillingData = async (companyId, { month = moment().format('MM'), year = moment().format('YYYY') } = {}) => {
   const [config, receptionBillings, dispatches, payments] = await Promise.all([
      CompanyConfig.instance(),
      ReceptionProductBilling.findAll({
         include: {
            model: ReceptionProduct,
            as: 'receptionProduct',
            include: [
               {
                  model: Reception,
                  as: 'reception'
               },
               {
                  model: Product,
                  as: 'product'
               }
            ]
         },
         where: { '$receptionProduct.reception.companyId$': companyId }
      }),
      Dispatch.findAll({
         include: [
            {
               model: DispatchStatus,
               as: 'status'
            },
            {
               model: Receiver,
               as: 'receiver',
               include: {
                  model: City,
                  as: 'city'
               }
            }
         ],
         where: {
            companyId: companyId,
            '$status.name$': 'entregado'
         }
      }),
      Payment.findAll({
         include: {
            model: PaymentStatus,
            as: 'status'
         },
         where: {
            companyId: companyId,
            '$status.name$': 'aprobado'
         }
      })
   ]);

   const { value: palletDay } = config.get('palletDay');

   // Acumulación total de receptionBillings
   const today = moment();

   const billingsTotal = receptionBillings.reduce((acc, current) => {
      let outDate = today;

      if (current.dateOut) {
         outDate = moment(current.dateOut);
      }

      return acc + (outDate.diff(current.dateIn, 'days') * palletDay);
   }, 0);

   // Suma de los precios de despacho
   const dispatchesTotal = dispatches.reduce((acc, current) => {
      return acc + current.receiver.city.deliveryPrice;
   }, 0);

   // Suma de los montos de pago
   const paymentsTotal = payments.reduce((acc, current) => {
      return acc + current.amount;
   }, 0);

   // ReceptionBillings + despachos - pagos = montoDeudaAcumulada
   const totalDebt = billingsTotal + dispatchesTotal - paymentsTotal;

   // Saldo a favor
   const positiveBalance = totalDebt < 0 ? (totalDebt * -1) : 0

   // Deuda del mes solicitado
   const specifiedDate = moment(`${year}-${month}-01`);

   const billingsMonth = receptionBillings.filter(bill => {
      if (moment(bill.dateIn).isSameOrBefore(specifiedDate.clone().endOf('month')) && (!bill.dateOut || moment(bill.dateOut).isSameOrAfter(specifiedDate))) {
         return bill;
      }
   });
      
   const totalBillingMonth = billingsMonth.reduce((acc, current) => {
      let inDate = specifiedDate;

      if (moment(current.dateIn).isAfter(specifiedDate)) {
         inDate = moment(current.dateIn);
      }

      let outDate = specifiedDate.clone().endOf('month');

      if (specifiedDate.isSame(moment().format('YYYY-MM-01'))) {
         outDate = moment();
      }

      if (current.dateOut) {
         outDate = moment(current.dateOut);
      }

      return acc + ((outDate.diff(inDate, 'days') + 1) * palletDay);
   }, 0);

   const dispatchesMonth = dispatches.filter((dispatch) => {
      if (moment(dispatch.date).isSameOrAfter(specifiedDate) && moment(dispatch.date).isSameOrBefore(specifiedDate.clone().endOf('month'))) {
         return dispatch
      }
   });
      
   const totalDispatchMonth = dispatchesMonth.reduce((acc, current) => acc + current.receiver.city.deliveryPrice, 0);

   const currentMonthDebt = totalBillingMonth + totalDispatchMonth;

   // Detalles del billing de paletas para el año-mes solicitado
   const billsData = billingsMonth.map(bill => {
      let inDate = specifiedDate;

      if (moment(bill.dateIn).isAfter(specifiedDate)) {
         inDate = moment(bill.dateIn);
      }

      let outDate = specifiedDate.clone().endOf('month');

      if (specifiedDate.isSame(moment().format('YYYY-MM-01'))) {
         outDate = moment();
      }

      if (bill.dateOut) {
         outDate = moment(bill.dateOut);
      }

      const cost = (outDate.diff(inDate, 'days') + 1) * palletDay;

      return {
         ...bill.get(),
         cost
      };
   });


   return {
      currentMonthDebt,
      totalDebt,
      positiveBalance,
      billingDetails: {
         dispatches: dispatchesMonth,
         receptionBillings: billsData
      }
   }
}



module.exports = {
   updateDispatchBillings,
   getBillingData
}