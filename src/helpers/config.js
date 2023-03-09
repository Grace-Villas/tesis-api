const { Config }  = require('../database/models');



/**
 * Clase para acceder a los atributos de configuración de la empresa de instalación
 */
class CompanyConfig {

   private attributes = {}

   constructor(attributes) {
      this.attributes = attributes;
   }

   /**
    * Método para instanciar la data de configuración de la empresa principal. No debe usarse el constructor directamente.
    * @async
    * @returns {Promise<CompanyConfig>} instancia de la clase CompanyConfig
    */
   static instance = async () => {
      const config = await Config.findAll();

      const rawData = config.map(c => c.get());

      const data = rawData.map(({key, id, value}) => [key, { id, value }]);

      const objectData = Object.fromEntries(data);

      const configData = {
         ...objectData,
         palletDat: Number(objectData.palletDay)
      }

      return new CompanyConfig(configData);
   }

   /**
    * Tipado de la clase CompanyConfig
    * @typedef {Object} CompanyConfigType
    * @property {string} name Nombre de la empresa instalada
    * @property {string} email Correo de la empresa instalada
    * @property {string} emailContact Correo de contacto de la empresa instalada
    * @property {string} phone Teléfono de contacto de la empresa instalada
    * @property {number} palletDay Costo por día de almacenamiento de la paleta no refrigerada de la empresa instalada
    * @property {string} country País de ubicación de la empresa instalada
    * @property {string} state Estado de ubicación de la empresa instalada
    * @property {string} city Ciudad de ubicación de la empresa instalada
    * @property {string} address Dirección de ubicación de la empresa instalada
   */

   /**
    * Función que retorna todos los datos de configuración de la empresa instalada
    * @returns {CompanyConfigType}
    */
   all = () => this.attributes;

   /**
    * Función que retorna la información del atributo de configuración buscado
    * @param {string} attr nombre de la clave a la que se quiere acceder
    * @returns {{id:number,value:(string|number)}|null} Valor e id de la clave buscada, null si no existe
    */
   get = (attr) => this.attributes[attr] || null;
}



module.exports = CompanyConfig;