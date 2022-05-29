const express=require('express');
const bodyparser=require('body-parser');
const cors=require('cors');


require('dotenv').config();


//create an instance of express
const app=express();

app.use(bodyparser.json());
app.use(cors());

//define port to start the server on
const port= process.env.PORT || 8000
app.listen(port,()=>{
    console.log(`server started on port ${port}`);
})