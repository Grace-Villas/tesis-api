const { request, response } = require('express');
const { User } = require('../database/models');


const validateInstalled = async (req = request, res = response, next) => {
   const usersCount = await User.count({ paranoid: false });
   
   if(usersCount > 0) {
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