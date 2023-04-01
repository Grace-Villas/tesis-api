const { Op } = require('sequelize');

const { DispatchProduct, ReceptionProduct, ReceptionProductBilling } = require('../database/models');



/**
 * Función para actualizar los datos de factura de los productos entregados
 * @async
 * @param {Array<DispatchProduct>} dispatchProducts Arreglo de productos relacionados al despacho que se está entregando
 */
const updateDispatchBillings = async (dispatchProducts) => {
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



module.exports = {
   updateDispatchBillings
}