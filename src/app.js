// Paquete de uso de variables de entorno
require('dotenv').config();

// Importando el modelo de servidor
const Server = require('./server/server.js');

// Instanciando el servidor
const server = new Server();



// Ejecutando el servidor
server.listen();