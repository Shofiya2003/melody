const express = require('express');
const router = express.Router();
const logger = require('../utils/logger/logger');

const spotify = require('../utils/spotify/spotify');

//token storage db
const TokenStorage = require('../models/tokenStorage');

spotify.seed();

router.get('/auth', async (req, res) => {
    try {
        const data = await TokenStorage.findOne({});
        if (!data) {
            logger.info("tokens not found in storage");
            logger.info("generating consent screen url");
            const consentScreenUrl = spotify.generateUrl();
            logger.info(consentScreenUrl);
            return res.redirect(consentScreenUrl);
        }
        else {
            logger.info("got the tokens");

            //store the tokens in the object
            spotify.setAccessToken(data.accessToken);
            spotify.setRefreshToken(data.refreshToken);

            return res.json({ msg: "successfully logged in with spotify" })

        }

    } catch (err) {
        logger.error("error in athuenticating spotify");
        return res.json({ msg: "something went wrong in spotify authentication" });
    }

})

//callback url
router.get('/callback', spotify.exchangeCode, async (req, res) => {

    try {
        logger.info("go the tokens");
        console.log(req.access_token);

        //store the tokens in the object
        spotify.setAccessToken(req.access_token);
        spotify.setRefreshToken(req.refresh_token);

        //store the tokens in the database
        await TokenStorage.deleteOne({});

        const newTokens = new TokenStorage({
            accessToken: req.access_token,
            refreshToken: req.refresh_token
        });

        await newTokens.save();

        logger.info("synced model with database");

        res.json({ msg: "successfully logged in with spotify" })
    } catch (err) {
        console.log(err);
        logger.error(`error in spotify.js callback function: ${err.msg}`);
        res.json({ msg: "something went wrong" });
    }

})

router.get('/playlists',async (req,res)=>{
    try{
        playlists = await spotify.getPlaylists()
        if(!playlists){
            return res.json({msg:"something went wrong"})
        }
        return res.json({data:playlists})
    }catch(err){
        console.log(err);
        logger.error(`error in fetching playlist: ${err.msg}`);
        return res.json({ msg: "something went wrong" });
    }
})

router.get('/search',async (req,res)=>{
    try{
        const textquery = req.query.q
        if(!textquery){
            return res.status(400).json({msg:"empty search text"})
        }
        const songs = await spotify.search(textquery)
        return res.json({data:songs})
    }catch(err){
        logger.error("error in spotify search api")
        console.log(err)
        return res.status(500).json({msg:"something went wrong"})
    }
})

module.exports = router;