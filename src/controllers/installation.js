const { request, response } = require('express');
const bcryptjs = require('bcryptjs');

// Modelos
const { User, UserRole, Role, RolePermission, Permission, Config, Country, State, City } = require('../database/models');

const { generateJWT } = require('../helpers/jwt');
const { installationMailer } = require('../helpers/mailing');
const { capitalizeAllWords } = require('../helpers/format');



// Funciones del controlador

/**
 * Crear un nuevo usuario con privilegios de administrador. 
 * @param {string} companyName string. `body`.
 * @param {string} companyEmail string, email. `body`.
 * @param {string} companyContactEmail string, email. `body`.
 * @param {string} companyPhone string. `body`.
 * @param {number} palletDay number. `body`.
 * @param {string} country string. `body`.
 * @param {string} locale string. `body`.
 * @param {string} phoneExtension string. `body`.
 * @param {string} state string. `body`.
 * @param {string} city string. `body`.
 * @param {string} address string. `body`.
 * @param {string} email string, email. `body`.
 * @param {string} password string. `body`
 */
const install = async (req = request, res = response) => {
   try {
      const {
         // Datos de configuración
         companyName, companyEmail, companyContactEmail, companyPhone,
         palletDay,
         country, locale, phoneExtension, state, city, address,
         // Cuenta principal
         firstName, lastName, stringEmail, password
      } = req.body;

      const stringCountry = country.toLocaleLowerCase();
      const stringState = state.toLocaleLowerCase();
      const stringCity = city.toLocaleLowerCase();

      // Config data
      const config = [
         { key: 'companyName', value: companyName },
         { key: 'companyEmail', value: companyEmail.toLocaleLowerCase() },
         { key: 'companyContactEmail', value: companyContactEmail.toLocaleLowerCase() },
         { key: 'companyPhone', value: `${phoneExtension}${companyPhone}` },
         { key: 'palletDay', value: palletDay },
         { key: 'country', value: stringCountry },
         { key: 'state', value: stringState },
         { key: 'city', value: stringCity },
         { key: 'address', value: address },
      ];

      // País, estado y ciudad data
      const countryData = {
         name: stringCountry,
         locale,
         phoneExtension,
         states: [
            {
               name: stringState,
               cities: [
                  {
                     name: stringCity
                  }
               ]
            }
         ]
      }

      await Promise.all([
         ...config.map(c => Config.create(c)),
         Country.create(countryData, {
            include: {
               model: State,
               as: 'states',
               include: {
                  model: City,
                  as: 'cities'
               }
            }
         })
      ]);

      // Encriptado de contraseña
      const salt = bcryptjs.genSaltSync();
      const hashPassword = bcryptjs.hashSync(password, salt);

      // Obteniendo los diferentes permisos existentes
      const permissions = await Permission.findAll();

      // Data para crear el usuario admin
      const data = {
         firstName: firstName.toLocaleLowerCase(),
         lastName: lastName.toLocaleLowerCase(),
         email: stringEmail,
         password: hashPassword,
         userRoles: [{
            role: {
               name: 'admin',
               hexColor: '#7367F0',
               isPublic: true,
               rolePermissions: permissions.map(per => ({
                  list: true,
                  create: true,
                  edit: true,
                  delete: true,
                  permissionId: per.id
               }))
            }
         }]
      }

      const user = await User.create(data, {
         include: {
            model: UserRole,
            as: 'userRoles',
            include: {
               model: Role,
               as: 'role',
               include: {
                  model: RolePermission,
                  as: 'rolePermissions',
                  include: {
                     model: Permission,
                     as: 'permission'
                  }
               }
            }
         }
      });

      await installationMailer({
         to: stringEmail,
         subject: '¡Bienvenido a LogisticsChain!'
      }, {
         fullName: capitalizeAllWords(user.fullName),
         password
      });

      // Generar JWT
      const token = await generateJWT(user.id, user.uuid);

      res.json({
         user,
         token
      });
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}

/**
 * Verificar si fue o no instalado el sistema
 */
const verifyInstallation = async (req = request, res = response) => {
   try {
      const usersCount = await User.count({ paranoid: false });

      if (usersCount > 0) {
         return res.json({ isInstalled: true });
      }

      res.json({ isInstalled: false })
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}


// Exports
module.exports = {
   install,
   verifyInstallation
}