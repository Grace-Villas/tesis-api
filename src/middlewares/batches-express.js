const { Batch, BatchStatus } = require('../database/models');



/**
 * Método para validar que exista un lote y verificar
 * que posea cierto status
 * @param {integer} batchId Id del lote a validar
 * @param {{status:string,errorMessage:string|undefined}} param1 Objeto de configuración
 * @returns 
 */
const validateBatchAndHasStatus = async (batchId, { status, errorMessage }) => {
   let message = '';
   try {
      const batch = await Batch.findByPk(batchId, {
         include: {
            model: BatchStatus,
            as: 'status'
         }
      });

      if (!batch) {
         message = `El id: ${batchId} no se encuentra en la base de datos`;
         throw new Error(message);
      }

      if (batch.status.name != status) {
         if (errorMessage) {
            message = errorMessage;
         } else {
            message = `El status del lote es inválido. Status actual: '${batch.status.name}', status necesario: '${status}'`;
         }

         throw new Error(message);
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error(message);
   }
}

/**
 * Método para validar que exista un lote y verificar
 * que no posea una lista de status dado
 * @param {integer} batchId Id del lote a validar
 * @param {{status:Array<string>,errorMessage:string|undefined}} param1 Objeto de configuración
 * @returns 
 */
const validateBatchAndDoesntHasStatus = async (batchId, { statuses = [], errorMessage }) => {
   let message = '';
   try {
      const batch = await Batch.findByPk(batchId, {
         include: {
            model: BatchStatus,
            as: 'status'
         }
      });

      if (!batch) {
         message = `El id: ${batchId} no se encuentra en la base de datos`;
         throw new Error('');
      }

      if (statuses.includes(batch.status.name)) {
         if (errorMessage) {
            message = errorMessage;
         } else {
            message = `El status del lote es inválido. Status actual: '${batch.status.name}', status inválidos: '${statuses.join(', ')}'`;
         }

         throw new Error('');
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error(message);
   }
}



module.exports = {
   validateBatchAndHasStatus,
   validateBatchAndDoesntHasStatus
}