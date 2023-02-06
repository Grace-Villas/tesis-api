const { request, response } = require('express');
const { Op } = require('sequelize');

// Modelos
const { Permission } = require('../database/models');



// Funciones del controlador

/**
 * Listar permisos registrados.
 * @param {integer} skip integer, cantidad de resultados a omitir (Paginación). `query`
 * @param {integer} limit integer, cantidad de resultados límite (Paginación). `query`
 */
const findAll = async (req = request, res = response) => {
   try {
      const { skip = 0, limit } = req.query;

      const user = req.authUser;

      // Funcionalidad específica según el tipo de usuario
      const where = user.isAdmin
         ?
         { [Op.or]: [{ isPublic: true }, { isPublic: false }] }
         :
         { isPublic: true }

      if (limit) {
         const { rows, count } = await Permission.findAndCountAll({
            where,
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
         const permissions = await Permission.findAll({
            where,
            order: [
               ['name', 'ASC']
            ]
         });
   
         res.json(permissions);
      }
   } catch (error) {
      console.log(error);
      res.status(500).json(error);
   }
}


// Exports
module.exports = {
   findAll,
}