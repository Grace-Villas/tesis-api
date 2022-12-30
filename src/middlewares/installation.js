const { request, response } = require('express');
const { User } = require('../database/models');


const validateInstalled = async (req = request, res = response, next) => {
   const users = await User.findAll({ paranoid: false });
   
   if(users.length > 0) {
      return res.status(400).json({
         errors: [
            {
               msg: 'Ya fue realizada una instalación',
               param: 'install',
               location: 'body'
            }
         ]
      });
   }

   next();
}


module.exports = {
   validateInstalled
};