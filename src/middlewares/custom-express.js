const validator = require('validator');

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
 * @returns {Boolean|Error} `bool`
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
 * @returns {Boolean|Error} `bool`
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

/**
 * Función para determinar si el rut posee un formato válido
 * @param {string} rut `requerido` rut a evaluar
 * @returns {Boolean|Error}
 */
const validateRut = (rut) => {
   try {
      const splitted = rut.split('-');

      const [letter, numbers] = splitted;

      if (splitted.length != 2 || !letter || letter.length > 1 || !numbers || !Number(numbers)) {
         throw new Error('El formato es inválido. Ejemplo: J-12345678');
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error('El formato es inválido. Ejemplo: J-12345678');
   }
}

/**
 * Método para verificar un número de teléfono.
 * @param {string} phone `string` Número de teléfono
 * @param {{locale:string, phoneExtension:string}} config `object` Configuraciones de validación
 * @returns {Boolean|Error} `bool`
 */
const validatePhone = (phone, { locale = 'es-VE', phoneExtension = '+58' }) => {
   try {
      if (!validator.isMobilePhone(`${phoneExtension}${phone}`, locale, { strictMode: true })) {
         throw new Error('El teléfono es inválido');
      }

      return true;
   } catch (error) {
      console.log(error);
      throw new Error('El teléfono es inválido');
   }
}



module.exports = {
   validateUniqueEmail,
   validateUniqueName,
   validateRut,
   validatePhone
}