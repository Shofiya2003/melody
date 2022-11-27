require('dotenv').config();
const rp=require('request-promise');


// const tokens
const jwt = require('jsonwebtoken');

// load logger
const logger = require('./../logger/logger');
const { json } = require('body-parser');

// declare the function to handle everything
function Google() {}

// initialize the object with environment varaibles
Google.prototype.seed = () => {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.callbackUrl = process.env.GOOGLE_REDIRECT_URL;
    this.jwtSecret = process.env.JWT_SECRET;
  };


  // function to generate consent screen url
Google.prototype.generateUrl = (state) => {
    logger.info(`callback url ${this.callbackUrl}`)
    logger.info(`Generating URL :: Current State: ${state}`);
    let url = 'https://accounts.google.com/o/oauth2/auth?';
    url += 'response_type=code';
    url += '&scope=https://www.googleapis.com/auth/userinfo.profile+';
    url += 'https://www.googleapis.com/auth/userinfo.email&';
    url += `&client_id=${this.clientId}`;
    url += `&state=${state}`;
    url += `&redirect_uri=${this.callbackUrl}`;
    url += '&access_type=offline&prompt=consent';
    return url;
  };


  //exchange code middleware which brings in the oAuth code and passes it to oAuth API to get the access_token and refresh token
  //accesstoken is passed to GOOGLE API to get the user info
  Google.prototype.exchangeCode=async (req,res,next)=>{
    
    try{
      const info=await rp.post({
        uri: 'https://oauth2.googleapis.com/token',
        json:true,
        form: {
            // Like <input type="text" name="name">
            code: req.query.code,
            client_id:this.clientId,
            client_secret:this.clientSecret,
            redirect_uri:this.callbackUrl,
            grant_type:'authorization_code'
        }
      });  
      
      const data=await rp.get({
        uri:'https://www.googleapis.com/oauth2/v2/userinfo',
        headers:{
          'Authorization':`Bearer ${info["access_token"]}`
        }      
      });
      logger.info('got user details');
      console.log(data);
      req.user=data;
      req.refreshToken=info.refresh_token;
      next();
    }catch(err){
      logger.error(`something is wrong in google.js : ${err.msg}`);
      res.json({msg:"something went wrong"});
    }
}



module.exports = new Google();
