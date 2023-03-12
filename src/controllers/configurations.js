const { request, response } = require('express');

// Models
const { Config } = require('../database/models');

// Helpers
const CompanyConfig = require('../helpers/config');



// Funciones del controlador

/**
 * Listar países registrados.
 */
const findAll = async (req = request, res = response) => {
   try {
      const config = await CompanyConfig.instance();

      const data = config.all();

      res.json(data);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Actualizar información de un atributo de configuración dado su id.
 * @param {integer} id integer. `params`
 * @param {boolean} value string. `body`.
 */
const findByIdAndUpdate = async (req = request, res = response) => {
   try {
      const { value } = req.body;
   
      const { id } = req.params;

      const config = await Config.findByPk(id);

      config.value = value;

      await config.save();

      res.json(config);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}


// Exports
module.exports = {
   findAll,
   findByIdAndUpdate,
}