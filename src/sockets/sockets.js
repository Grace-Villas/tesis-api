


class Sockets {

    constructor(io) {

        this.io = io;
        this.activeUsers = [];

        this.socketEvents();
    }

    socketEvents() {
        // On connection
        this.io.on('connection', (socket) => {
            
        });
    }
}


module.exports = Sockets;