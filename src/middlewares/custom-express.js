const Models = require('../database/models');



/**
 * Función para determinar si el nombre es único dentro de una colección.
 * Debe ser usado en conjunto con el id dentro de `req.params` para saltar
 * la verificación si el nombre está en uso por el elemento del id suministrado
 * @param {string} name `requerido` nombre a evaluar
 * @param {object} request `requerido` objeto con la data de la petición
 * @param {string} request.modelName
 * @param {import('express').Request} request.req
 * @param {boolean} request.isUpdate
 * @returns {Boolean} `bool`
 */
const validateUniqueName = async (name, { modelName, req, isUpdate = false }) => {
   try {
      const nameExists = await Models[modelName].findOne({
         where: { name: name.toLocaleLowerCase() }
      });

      if ((nameExists && !isUpdate) || (nameExists && isUpdate && req.params.id != nameExists.id)) {
         throw new Error(`El nombre: ${name.toLocaleLowerCase()} ya se encuentra en uso`);
      }

      req.body.stringName = name.toLocaleLowerCase();

      return true;
   } catch (error) {
      console.log(error);
      throw new Error(`El nombre: ${name.toLocaleLowerCase()} ya se encuentra en uso`);
   }
}

/**
 * Función para determinar si el email es único dentro de una colección.
 * Debe ser usado en conjunto con el id dentro de `req.params` para saltar
 * la verificación si el email está en uso por el elemento del id suministrado
 * @param {string} name `requerido` email a evaluar
 * @param {object} request `requerido` objeto con la data de la petición
 * @param {string} request.modelName
 * @param {import('express').Request} request.req
 * @param {boolean} request.isUpdate
 * @returns {Boolean} `bool`
 */
const validateUniqueEmail = async (email, { modelName, req, isUpdate = false }) => {
   try {
      const nameExists = await Models[modelName].findOne({
         where: { email: email.toLocaleLowerCase() }
      });

      if ((nameExists && !isUpdate) || (nameExists && isUpdate && req.params.id != nameExists.id)) {
         throw new Error(`El email: ${email.toLocaleLowerCase()} ya se encuentra en uso`);
      }

      req.body.stringEmail = email.toLocaleLowerCase();

      return true;
   } catch (error) {
      console.log(error);
      throw new Error(`El email: ${email.toLocaleLowerCase()} ya se encuentra en uso`);
   }
}



module.exports = {
   validateUniqueEmail,
   validateUniqueName
}