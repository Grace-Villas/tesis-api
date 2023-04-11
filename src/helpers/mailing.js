const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const SMTPTransport = require('nodemailer/lib/smtp-transport');


const transporter = nodemailer.createTransport({
   host: process.env.SMTP_HOST,
   port: process.env.SMTP_PORT,
   secure: false,
   auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
   },
   tls: {
      rejectUnauthorized: false
   }
});

/**
 * Función para enviar correos por el canal SMTP
 * @async
 * @param {{from:string,to:string,subject:string,html:string}} config Objeto de configuración del transporter
 * @returns {Promise<SMTPTransport.SentMessageInfo>} información del correo enviado
 */
const mailer = async ({
   from = "'LogisticsChain' <noreply@logisticschain.click>",
   to,
   subject,
   html
}) => await transporter.sendMail({ from, to, subject, html });

/**
 * Función para enviar correo de instalación
 * @async
 * @param {{to:string,subject:string}} config datos de configuración del mailer
 * @param {{fullName:string,password:string}} templateData datos del template
 * @returns {Promise<SMTPTransport.SentMessageInfo>} información del correo enviado
 */
const installationMailer = async ({to, subject}, {fullName, password}) => {
   const templateSource = await fs.promises.readFile(path.join(__dirname, '../emails/installation.hbs'), 'utf-8');

   const template = handlebars.compile(templateSource);

   const html = template({fullName, password, clientUri: process.env.CLIENT_URI, apiUri: process.env.API_URI});

   return await mailer({
      to,
      subject,
      html
   });
}

/**
 * Función para enviar correo de registro de empresa
 * @async
 * @param {{from:string,to:string,subject:string}} config datos de configuración del mailer
 * @param {{companyName:string,clientName:string,password:string}} templateData datos del template
 * @returns {Promise<SMTPTransport.SentMessageInfo>} información del correo enviado
 */
const companyRegistrationMailer = async ({from, to, subject}, {companyName, clientName, password}) => {
   const templateSource = await fs.promises.readFile(path.join(__dirname, '../emails/company-registration.hbs'), 'utf-8');

   const template = handlebars.compile(templateSource);

   const html = template({companyName, clientName, password, clientUri: process.env.CLIENT_URI, apiUri: process.env.API_URI});

   return await mailer({
      from,
      to,
      subject,
      html
   });
}

/**
 * Función para enviar correo de registro de empresa
 * @async
 * @param {{from:string,to:string,subject:string}} config datos de configuración del mailer
 * @param {{companyName:string,userName:string,clientName:string,password:string}} templateData datos del template
 * @returns {Promise<SMTPTransport.SentMessageInfo>} información del correo enviado
 */
const userRegistrationMailer = async ({from, to, subject}, {companyName, userName, clientName, password}) => {
   const templateSource = await fs.promises.readFile(path.join(__dirname, '../emails/user-registration.hbs'), 'utf-8');

   const template = handlebars.compile(templateSource);

   const html = template({companyName, userName, clientName, password, clientUri: process.env.CLIENT_URI, apiUri: process.env.API_URI});

   return await mailer({
      from,
      to,
      subject,
      html
   });
}

/**
 * Función para enviar correo de reseteo de contraseña
 * @async
 * @param {{from:string,to:string,subject:string}} config datos de configuración del mailer
 * @param {{companyName:string,userName:string,userEmail:string,userUUID:string,userIp:string,userJWT:string,clientName:string,password:string}} templateData datos del template
 * @returns {Promise<SMTPTransport.SentMessageInfo>} información del correo enviado
 */
const passwordRecoveryMailer = async ({from, to, subject}, {companyName, userName, userEmail, userUUID, userIp, userJWT, clientName}) => {
   const templateSource = await fs.promises.readFile(path.join(__dirname, '../emails/password-reset.hbs'), 'utf-8');

   const template = handlebars.compile(templateSource);

   const html = template({
      companyName,
      userName,
      userEmail,
      userUUID,
      userIp,
      userJWT,
      clientName,
      clientUri: process.env.CLIENT_URI,
      apiUri: process.env.API_URI
   });

   return await mailer({
      from,
      to,
      subject,
      html
   });
}



module.exports = {
   mailer,

   installationMailer,
   companyRegistrationMailer,
   userRegistrationMailer,

   passwordRecoveryMailer,
}