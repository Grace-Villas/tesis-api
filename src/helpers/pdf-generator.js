const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');


handlebars.registerHelper('inc', (value, options) => parseInt(value) + 1);



const pdfOPtions = () => ({
   format: "A4", 
   orientation: "portrait", 
   border: "10mm",
   footer: {
      height: '10mm',
      contents: {
         default: '<p style="text-align: center;"><span style="color: #444;">{{page}}</span>/<span>{{pages}}</span></p>'
      }
   }
});

const receptionExport = async ({company, dateIn, reception, products}) => {
   const templateSource = await fs.promises.readFile(path.join(__dirname, '../pdfs/reception.hbs'), 'utf-8');

   const template = handlebars.compile(templateSource);

   const html = template({reception, dateIn, company, products});

   return {html, options: pdfOPtions()}
}

const dispatchExport = async ({company, date, dispatch, products}) => {
   const templateSource = await fs.promises.readFile(path.join(__dirname, '../pdfs/dispatch.hbs'), 'utf-8');

   const template = handlebars.compile(templateSource);

   const html = template({dispatch, date, company, products});

   return {html, options: pdfOPtions()}
}



module.exports = {
   receptionExport,
   dispatchExport
}