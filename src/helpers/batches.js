const { Batch, BatchStatus, Dispatch, DispatchStatus } = require('../database/models');



/**
 * Verifica el estado del lote, si no posee mas despachos en tránsito lo marca como finalizado
 * @param {number} batchId id del lote a verificar
 */
const updateBatchIfFullyDelivered = async (batchId) => {
   const status = await DispatchStatus.findOne({
      where: { name: 'embarcado' }
   })

   const batch = await Batch.findByPk(batchId, {
      include: {
         model: Dispatch,
         as: 'dispatches',
         where: {
            statusId: status.id
         }
      }
   });

   // Si el lote es null entonces actualizar lote a status finalizado
   if (!batch) {
      const deliveredStatus = await BatchStatus.findOne({
         where: { name: 'finalizado' }
      });
   
      await Batch.update({
         statusId: deliveredStatus.id
      }, {
         where: { batchId } 
      });
   }
}



module.exports = {
   updateBatchIfFullyDelivered
}