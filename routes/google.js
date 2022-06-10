const express=require('express');
const router=express.Router();
const logger=require('../utils/logger/logger')

//get google object
const google=require('../utils/google/google');

google.seed();

//function to take user to consent screen
router.get('/signin/google',(req,res)=>{
    const consentScreenUrl=google.generateUrl();
    res.redirect(consentScreenUrl);
})

//callback url
router.get('/google/melody',google.exchangeCode,(req,res)=>{
    logger.info('inside the call back url');
    res.send('done');
})

module.exports=router;