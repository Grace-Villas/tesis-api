const { request, response } = require('express');
const { Op } = require('sequelize');
const bcryptjs = require('bcryptjs');

// Modelos
const { Company, City, State, Country, User } = require('../database/models');

// Helpers
const { generatePassword } = require('../helpers/password-generator');
const { capitalizeAllWords } = require('../helpers/format');
const { companyRegistrationMailer } = require('../helpers/mailing');
const CompanyConfig = require('../helpers/config');



// Eager loading
const eLoad = [
   {
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
];



// Funciones del controlador

/**
 * Crear una nueva compañía.
 * @param {string} name string. `body`.
 * @param {string} rut string. `body`.
 * @param {integer} cityId integer. `body`.
 * @param {string} address string. `body`.
 * @param {string} phone string, sin el código de país. `body`.
 * @param {string} email string, email. `body`.
 */
const create = async (req = request, res = response) => {
   try {
      const { name, rut, cityId, address, phone, stringEmail } = req.body;

      const stringRut = rut.toLocaleLowerCase();

      const stringName = name.toLocaleLowerCase();

      const rutExists = await Company.findOne({
         where: { rut: stringRut }
      });

      if (rutExists) {
         return res.status(400).json({
            errors: [
               {
                  value: rut,
                  msg: `El rut: ${rut} ya se encuentra en uso`,
                  param: 'rut',
                  location: 'body'
               }
            ]
         });
      }

      const password = generatePassword();
      
      const salt = bcryptjs.genSaltSync();
      const hashPassword = bcryptjs.hashSync(password, salt);

      const data = {
         name: stringName,
         rut: stringRut,
         cityId,
         address,
         phone,
         email: stringEmail,
         users: [{
            firstName: stringName,
            lastName: '',
            email: stringEmail,
            password: hashPassword
         }]
      }

      const company = await Company.create(data, {
         include: {
            model: User,
            as: 'users'
         }
      });

      const config = await CompanyConfig.instance();

      await companyRegistrationMailer({
         from: `'${config.get('companyName').value}' <${config.get('companyEmail').value}>`,
         to: stringEmail,
         subject: `¡Bienvenido a ${config.get('companyName').value}!`
      }, {
         companyName: config.get('companyName').value,
         clientName: capitalizeAllWords(company.name),
         password
      });

      res.json(company);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Listar compañias registradas.
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { search, cityId, skip = 0, limit } = req.query;

      let where = {}

      if (typeof search != 'undefined') {
         where[Op.or] = [
            { name: { [Op.substring]: search } },
            { rut: { [Op.substring]: search } },
            { phone: { [Op.substring]: search } },
            { email: { [Op.substring]: search } },
         ];
      }

      if (typeof cityId != 'undefined') {
         where.cityId = cityId;
      }

      if (limit) {
         const { rows, count } = await Company.findAndCountAll({
            where,
            include: eLoad,
            offset: Number(skip),
            limit: Number(limit),
            order: [
               ['name', 'ASC']
            ]
         });

         const pages = Math.ceil(count / Number(limit));

         res.json({
            rows,
            count,
            pages
         });
      } else {
         const companies = await Company.findAll({
            where,
            include: eLoad,
            order: [
               ['name', 'ASC']
            ]
         });
   
         res.json(companies);
      }
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Obtener una compañía dado su id.
 * @param {integer} id integer. `params`
 */
const findById = async (req = request, res = response) => {
   try {
      const { id } = req.params;
      
      const company = await Company.findByPk(id, {
         include: eLoad,
      });

      if (!company) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: `El id: ${id} no se encuentra en la base de datos`,
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      res.json(company);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Eliminar una compañía dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndDelete = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const company = await Company.findByPk(id);

      if (!company) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: `El id: ${id} no se encuentra en la base de datos`,
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      await company.destroy();
   
      res.json(company);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Actualizar información de una compañía dado su id.
 * @param {integer} id integer. `params`
 * @param {string} name string. `body`. Opcional
 * @param {string} rut string. `body`. Opcional
 * @param {integer} city integer. `body`. Opcional
 * @param {string} address string. `body`. Opcional
 * @param {string} phone string, sin el código de país. `body`. Opcional
 * @param {string} email string, email. `body`. Opcional
 */
const findByIdAndUpdate = async (req = request, res = response) => {
   try {
      const { name, rut, cityId, address, phone, stringEmail } = req.body;
   
      const { id } = req.params;

      const company = await Company.findByPk(id, {
         include: eLoad
      });

      if (!company) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: `El id: ${id} no se encuentra en la base de datos`,
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      if (name) {
         company.name = name.toLocaleLowerCase();
      }

      if (address) {
         company.address = address;
      }

      if (phone) {
         company.phone = phone;
      }

      if (stringEmail) {
         company.email = stringEmail;
      }

      if (rut) {
         const stringRut = rut.toLocaleLowerCase();

         const rutExists = await Company.findOne({
            where: { rut: stringRut, id: { [Op.ne]: id } }
         });
   
         if (rutExists) {
            return res.status(400).json({
               errors: [
                  {
                     value: rut,
                     msg: `El rut: ${rut} ya se encuentra en uso`,
                     param: 'rut',
                     location: 'body'
                  }
               ]
            });
         }

         company.rut = stringRut;
      }

      if (cityId) {
         company.cityId = cityId;
      }

      await company.save();

      await company.reload();

      res.json(company);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Restaurar una compañía dado su id.
 * @param {integer} id integer. `params`
 */
const findByIdAndRestore = async (req = request, res = response) => {
   try {
      const { id } = req.params;

      const company = await Company.findByPk(id, { paranoid: false });

      if (!company) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: `El id: ${id} no se encuentra en la base de datos`,
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      if (!company.deletedAt) {
         return res.status(400).json({
            errors: [
               {
                  value: id,
                  msg: `El id: ${id} no ha sido eliminado`,
                  param: 'id',
                  location: 'params'
               }
            ]
         });
      }

      await company.restore();
   
      res.json(company);
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}


// Exports
module.exports = {
   create,
   findAll,
   findById,
   findByIdAndDelete,
   findByIdAndRestore,
   findByIdAndUpdate,
}