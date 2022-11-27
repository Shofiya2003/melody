const express=require('express');
const bodyparser=require('body-parser');
const cors=require('cors');
const logger=require('./utils/logger/logger');
const mongoose=require ("mongoose");

require('dotenv').config();

//importing routes
const google=require('./routes/google');

//connecting to database
mongoose.connect('mongodb://localhost:27017/melodyDb',{
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
}).then(()=>{
  logger.info("connected to database")
}).catch(err=>{
  logger.error(`error connecting to database ${err}`);
})



//create an instance of express
const app=express();

app.use(bodyparser.json());
app.use(cors());

//define port to start the server on
const port= process.env.PORT || 8000

//bind routes to app
app.use('/auth',google);


app.listen(port,()=>{
    logger.info(`Express server started at port: ${port}`);
})