const { Dispatch, DispatchStatus } = require('../database/models');
// TODO: crear middleware que valide que el despacho no tenga los status pasados por parámetros



/**
 * Método para validar que exista un despacho y verificar
 * que posea cierto status
 * @param {integer} dispatchId Id del despacho a validar
 * @param {{status:string,errorMessage:string|undefined}} param1 Objeto de configuración
 * @returns 
 */
const validateAndHasStatus = async (dispatchId, { status, errorMessage }) => {
   let message = '';
   try {
      const dispatch = await Dispatch.findByPk(dispatchId, {
         include: {
            model: DispatchStatus,
            as: 'status'
         }
      });

      if (!dispatch) {
         message = `El id: ${dispatchId} no se encuentra en la base de datos`;
         throw new Error(message);
      }

      if (dispatch.status.name != status) {
         if (errorMessage) {
            message = errorMessage;
         } else {
            message = `El status del despacho es inválido. Status actual: '${dispatch.status.name}', status necesario: '${status}'`;
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
 * Método para validar que exista un despacho y verificar
 * que no posea una lista de status dado
 * @param {integer} dispatchId Id del despacho a validar
 * @param {{status:Array<string>,errorMessage:string|undefined}} param1 Objeto de configuración
 * @returns 
 */
const validateAndDoesntHasStatus = async (dispatchId, { statuses = [], errorMessage }) => {
   let message = '';
   try {
      const dispatch = await Dispatch.findByPk(dispatchId, {
         include: {
            model: DispatchStatus,
            as: 'status'
         }
      });

      if (!dispatch) {
         message = `El id: ${dispatchId} no se encuentra en la base de datos`;
         throw new Error('');
      }

      if (statuses.includes(dispatch.status.name)) {
         if (errorMessage) {
            message = errorMessage;
         } else {
            message = `El status del despacho es inválido. Status actual: '${dispatch.status.name}', status inválidos: '${statuses.join(', ')}'`;
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
   validateAndHasStatus,
   validateAndDoesntHasStatus
}