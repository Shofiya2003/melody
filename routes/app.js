const express = require('express');
const router = express.Router();
const logger = require('../utils/logger/logger');

const Song = require("../models/song");
const spotify = require('../utils/spotify/spotify');

router.post('/:songId', async (req, res) => {
    const songId = req.params.songId
    //client id
    const clientId = req.get('clientId')

    try {
        if (!clientId) {
            logger.error("client id not in headers")
            return res.status(400).json({ msg: "client id missing" })
        }
        const song = await Song.findOne({ songId: songId })
        if (song) {
            logger.info(`song ${songId} already in playlist`)
            if (!song.isPlaying && !song.played && song.upvoters && !song.upvoters.includes(clientId)) {
                await Song.findOneAndUpdate({ songId: songId }, { upvotes: song.upvotes + 1, $push: { upvoters: clientId } })
            }
            return res.json({ msg: `song already on board` })
        }
        const newSong = new Song({
            songId: songId,
            spotifyId: spotify.clientId,
            upvoters: [clientId]
        })
        newSong.save()
        res.json({ msg: "song added to the board successfully" })
    } catch (err) {
        logger.error(`error in adding song ${songId}`)
        console.log(err)
        res.status(500).json({ msg: "something went wrong" })
    }
})

router.post('/:songId/upvote', async (req, res) => {
    const songId = req.params.songId
    const clientId = req.get('clientId')

    try {
        if (!clientId) {
            logger.error("client id not in headers")
            return res.status(400).json({ msg: "client id missing" })
        }
        const song = await Song.findOne({ songId: songId })
        if (song) {
            if (!song.isPlaying && !song.played) {
                if (song.upvoters && !song.upvoters.includes(clientId)) {
                    await Song.findOneAndUpdate({ songId: songId }, { upvotes: song.upvotes + 1, $push: { upvoters: clientId } })
                    return res.json({ error: false, msg: "upvoted the song" })
                } else {
                    await Song.findOneAndUpdate({ songId: songId }, { upvotes: song.upvotes - 1, $pull: { upvoters: clientId } })
                    return res.json({ error: false, msg: "removed upvote from the song" })
                }
            }
            logger.info("song already played")
            return res.json({ msg: `song already played` })
        }
        else {
            logger.info("song not on the leaderboard")
            return res.json({ error: true, msg: "song not found on the leaderboard" })
        }
    } catch (err) {
        logger.error(`error in upvoting song ${songId}`)
        console.log(err)
        res.status(500).json({ msg: "something went wrong" })
    }

})

module.exports = router