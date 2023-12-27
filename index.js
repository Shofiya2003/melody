const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const logger = require('./utils/logger/logger');
const mongoose = require("mongoose");
const webSocketServer = require("./utils/websocket/websocket");
const random = require("random-string-alphanumeric-generator");
const spotify_class = require('./utils/spotify/spotify');

const http = require("http");

require('dotenv').config();
spotify_class.seed()

//importing routes
const google = require('./routes/google');
const spotify = require('./routes/spotify');
const song = require('./routes/app')

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
app.use('/api/song',song)

//bind the port to the app instance
app.listen(port, () => {
  logger.info(`Express server started at port: ${port}`);
})

setInterval(() => {
  console.log("updating")
  spotify_class.stateUpdate()
}, 3000);
