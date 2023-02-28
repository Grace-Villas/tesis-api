// paquete http para servidor
const http = require('http');

const express = require('express');
const { Server: SocketIo } = require('socket.io');
const cors = require('cors');

// Configuración de la base de datos
const { DBconnect } =  require('../database/config.js');

// Archivo de sockets
const Sockets = require('../sockets/sockets.js');

// Enrutadores
const routes = require('../routes');



// Clase de servidor
class Server {
    constructor() {
        // Usando express para iniciar servidor
        this.app = express();

        // Declarando el puerto a usar (tomado de las variables de entorno)
        this.port = process.env.PORT;

        // Declarando servidor http para uso de sockets
        this.server = http.createServer(this.app);

        // Declarando el servidor de sockets
        this.io = new SocketIo(this.server);

        // Iniciando conexión a mongoDB
        this.DBConn();

        // Middlewares
        this.middlewares();

        // Inicializar sockets
        this.sockets = new Sockets(this.io);

        // Endpoints del servidor
        this.routes();
    }

    // método de conexión a la base de datos
    async DBConn() {
        await DBconnect();
    }

    // Middlewares generales del servidor
    middlewares() {
        // CORS
        this.app.use(cors());

        // Lectura y parseo de body (body de las peticiones)
        this.app.use(express.json());
    }

    // Rutas del servidor
    routes() {
        Object.entries(routes).forEach(([path, {router}]) => {
            this.app.use(`/api/${path}`, router);
        });

        this.app.use('/public', express.static('public'));
    }

    // Método para lanzar el servidor
    listen() {
        this.server.listen(this.port, () => {
            console.log(`Server on port: ${this.port}`);
        });
    }
}



// Exportar modulo ECMAScript
module.exports = Server;