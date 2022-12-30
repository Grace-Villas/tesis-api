const { City, Company, Country, State } = require('../database/models');



/**
 * Método para verificar que exista una compañía.
 * Almacena la data de la ciudad y sus relaciones con
 * estado y país en `req.body.cityData`
 * @param {integer} companyId `integer` id de la compañía
 * @param {object} request `requerido` objeto con la data de la petición
 * @param {import('express').Request} request.req
 * @returns 
 */
const validateCompanyId = async (companyId, { req }) => {
   try {
      const company = await Company.findByPk(companyId, {
         include: {
            model: City,
            as: 'city',
            include: {
               model: State,
               as: 'state',
               include: {
                  model: Country,
                  as: 'country'
               }
            }
         }
      });

      if (!company) {
         throw new Error(`El id: ${companyId} no se encuentra en la base de datos`);
      }

      req.body.cityData = company.city;

      return true;
   } catch (error) {
      console.log(error);
      throw new Error(`El id: ${companyId} no se encuentra en la base de datos`);
   }
}



module.exports = {
   validateCompanyId,
}