const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const cheerio = require('cheerio');



/**
 * Función para obtener el precio del dólar tasa BCV
 * @async
 * @returns {Promise<number|null>} El precio del dólar o null en caso de error
 */
const dollarExchange = async () => {
   try {
      const response = await axios.get('https://www.bcv.org.ve', {httpsAgent});
   
      const parse = cheerio.load(response.data);

      const dolarRaw = parse('#dolar').text();

      const dolar = Number(dolarRaw.replace('USD', '').trim().replace(',', '.'));

      return dolar;
   } catch (error) {
      console.log(error);
      return null;
   }
}



module.exports = {
   dollarExchange
}