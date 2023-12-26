const express = require('express');
const router = express.Router();
const logger = require('../utils/logger/logger');

const Song = require("../models/song");
const spotify = require('../utils/spotify/spotify');

router.post('/:songId',async (req,res)=>{
    const songId = req.params.songId
    try{
        const song = await Song.findOne({songId:songId})
        if(song){
            logger.info(`song ${songId} already in playlist`)
            return res.json({msg:`song already on board`})
        }
        const newSong = new Song({
            songId: songId,
            spotifyId: spotify.clientId
        })
        newSong.save()
        res.json({msg:"song added to the board successfully"})
    }catch(err){
        logger.error(`error in adding song ${songId}`)
        console.log(err)
        res.status(500).json({msg:"something went wrong"})
    }
})

 module.exports = router