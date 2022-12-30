const { State } = require('../database/models');


/**
 * Función para validar la existencia de un estado dentro de la colección estados, dado su id
 * @param {integer} stateId id del estado
 * @returns {boolean}
 */
const validateStateId = async (stateId) => {
   try {
      const state = await State.findByPk(stateId);

      if (!state) {
         throw new Error(`El id: ${stateId} no se encuentra en la base de datos`);
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error(`El id: ${stateId} no se encuentra en la base de datos`);
   }
}



module.exports = {
   validateStateId
}