


/**
 * Obtener la dirección ip del equipo que emite el request
 * @param {Request} req request de la petición al endpoint
 * @returns {string} dirección ipv4 o ipv6 del remitente de la petición
 */
const getIpAdress = (req) => {
   const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

   return rawIp.substr(0, 7) == '::ffff:' ? rawIp.substr(7) : rawIp;
}



module.exports = {
   getIpAdress
}