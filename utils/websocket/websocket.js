const WebSocketServer = require("websocket").server
const logger = require('../logger/logger');

function WebSocket() { };

WebSocket.prototype.create = (httpServer) => {
    try {
        logger.info(`creating websocket connection`);

        //create a websocket server
        const ws = new WebSocketServer({
            httpServer: httpServer,
            autoAcceptConnections: true
        })
        this.ws = ws;
        this.eventListeners = {};

        ws.on('connect', (wsConnection) => {
            //got a new connection
            logger.info(`new connection ${wsConnection.socket.remotePort}`);

            wsConnection.on('message', (message) => {
                message = JSON.parse(message.utf8Data);
                const { event, data } = message;
                logger.info(`event ${event} by ${wsConnection.socket.remotePort}`);
                this.eventListeners[event](data);
            })
        })

    } catch (err) {
        console.log(err);
    }
}

//attach a listener to an event
WebSocket.prototype.listen = (event, callback) => {
    this.eventListeners[event] = callback;
}

module.exports = new WebSocket();

