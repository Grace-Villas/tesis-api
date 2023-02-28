const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');


const transporter = nodemailer.createTransport({
   host: process.env.SMTP_HOST,
   port: process.env.SMTP_PORT,
   secure: false,
   auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
   }
});

/**
 * Función para enviar correos por el canal SMTP
 * @param {{from:string,to:string,subject:string,html:string}} config Objeto de configuración del transporter
 * @returns 
 */
const mailer = async ({
   from = "'Logistics chain' <noreply@logisticschain.click>",
   to,
   subject,
   html
}) => await transporter.sendMail({ from, to, subject, html });

/**
 * Función para enviar correo de instalación
 * @param {{to:string,subject:string}} config 
 * @param {*} templateData 
 */
const installationMailer = async ({to, subject}, {fullName, password}) => {
   const templateSource = await fs.promises.readFile(path.join(__dirname, '../emails/installation.hbs'), 'utf-8');

   const template = handlebars.compile(templateSource);

   const html = template({fullName, password, clientUri: process.env.CLIENT_URI, apiUri: process.env.API_URI});

   await mailer({
      to,
      subject,
      html
   });
}



module.exports = {
   mailer,
   installationMailer
}