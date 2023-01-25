const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const logger = require('./utils/logger/logger');
const mongoose = require("mongoose");
const webSocketServer = require("./utils/websocket/websocket");
const random = require("random-string-alphanumeric-generator");

const http = require("http");

require('dotenv').config();

//importing routes
const google = require('./routes/google');
const spotify = require('./routes/spotify');

//mongoose models
const Room = require('./models/room');
const Socket = require('./models/socket');

//connecting to database
mongoose.connect('mongodb://localhost:27017/melodyDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  logger.info("connected to database")
}).catch(err => {
  logger.error(`error connecting to database ${err}`);
})



//create an instance of express
const app = express();

//create an instance of http server
const httpServer = new http.createServer()

app.use(bodyparser.json());
app.use(cors());

//define port to start the server on
const port = process.env.PORT || 8000

//bind routes to app
app.use('/auth', google);
app.use('/spotify', spotify);


webSocketServer.create(port);
const rooms = {};
webSocketServer.listen('create room', async (data) => {

  if (!data.name) {
    webSocketServer.emit(data.ws, "error", { msg: "enter name" });
    return;
  }

  const room_id = random.randomAlphanumeric(5);
  logger.info(`creating room ${room_id} by ${data.name}`);

  //create a socket in database
  const socket = await Socket.create({
    ws: data.ws,
  })

  //create a room
  const room = await Room.create({
    created_by: data.created_by,
    parent_socket: socket._id,
    participants: [data.ws],
    room_id: room_id
  });

  rooms[room_id] = [data.ws];

  webSocketServer.emit(data.ws, "room created", { room_id: room_id, socket_id: socket._id, msg: "success" });
})

webSocketServer.listen("join room", async (data) => {
  const { room_id } = data;
  const room = await Room.findOne({ room_id: room_id });
  if (!data.name) {
    webSocketServer.emit(data.ws, "error", { msg: "enter name" });
    return;
  }

  if (!room) {
    webSocketServer.emit(data.ws, "error", { msg: "room not found" });
    return;
  }
  //create a socket in database
  const socket = await Socket.create({
    ws: data.ws,
  })
  await Room.updateOne({ room_id: room_id }, {
    participants: [...room.participants, socket._id]
  })
  rooms[room_id].forEach(async ws => {
    webSocketServer.emit(ws, "new participant", { msg: `${data.name} joined the room` });
  });
  //push new connection into the participants array
  rooms[room_id] = [...rooms[room_id], data.ws];
  webSocketServer.emit(data.ws, "joined room", { socket_id: socket._id, msg: "success" });
})

//bind the port to the app instance
app.listen(port, () => {
  logger.info(`Express server started at port: ${port}`);
})
