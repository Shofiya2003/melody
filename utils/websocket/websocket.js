const { prototype } = require("winston-transport");
const { WebSocketServer } = require("ws");
const logger = require('../logger/logger');

function WebSocket() { };

WebSocket.prototype.create = (port) => {
    try {
        logger.info(`creating websocket connection`);

        //create a websocket server
        const wss = new WebSocketServer({
            port: 3000
        })

        this.eventListeners = {};

        wss.on('connection', (wsConnection) => {

            //got a new connection
            logger.info(`new connection`);

            wsConnection.on('message', (message) => {
                message = JSON.parse(message);
                const { event, data } = message;
                data.ws = wsConnection;
                logger.info(`event ${event}`);
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

//emit an event with data
WebSocket.prototype.emit = (ws, event, data) => {

    ws.send(JSON.stringify({ event, data }));
}

module.exports = new WebSocket();

