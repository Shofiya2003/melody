require('dotenv').config();
const logger = require('../logger/logger')
const rp = require('request-promise');

const { json } = require('body-parser');
const Song = require('../../models/song')
function Spotify() { }

Spotify.prototype.seed = () => {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URL;
}

Spotify.prototype.generateUrl = () => {
    const scopes = 'user-read-playback-state user-read-email user-modify-playback-state user-read-currently-playing user-read-recently-played user-read-private';
    const url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${this.clientId}&scope=${scopes}&redirect_uri=${this.redirectUri}`;
    return url;
}

//exchange code middleware which brings in the oAuth code and passes it to get token spotify API to get the access_token and refresh token
//accesstoken is passed to SPOTIFY get token API to get the user info
Spotify.prototype.exchangeCode = async (req, res, next) => {

    try {
        logger.info('in the echange code middleware');
        const { code, state } = req.query;
        console.log(code);
        if (!code) {
            const { error } = req.query;
            console.log(req.query.error);
            logger.error("error in spotify authentication");
            res.json("something went wrong");
            return;
        }

        const options = {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + (new Buffer(this.clientId + ':' + this.clientSecret).toString('base64'))
            },
            uri: 'https://accounts.spotify.com/api/token',
            json: true,
            form: {
                // Like <input type="text" name="name">
                code: code,
                redirect_uri: this.redirectUri,
                grant_type: 'authorization_code'
            }
        }

        const info = await rp(options);


        logger.info('got user details');
        console.log(info);
        req.access_token = info.access_token;
        req.refresh_token = info.refresh_token;
        next();
    } catch (err) {
        console.log(err);
        logger.error(`something is wrong in spotify.js : ${err.msg}`);
        res.json({ msg: "something went wrong" });
    }
}

Spotify.prototype.setAccessToken = (accessToken) => {
    this.accessToken = accessToken;
}

Spotify.prototype.getAccessToken = () => {
    return this.accessToken
}

Spotify.prototype.setRefreshToken = (refreshToken) => {
    this.refreshToken = refreshToken;
}

Spotify.prototype.getRefreshToken = () => {
    return this.refreshToken
}

Spotify.prototype.getPlaylists = async () => {
    try {
        console.log("getting playlists")
        if (!this.accessToken) {
            throw new Error("missing access token")
        }
        const options = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + this.accessToken
            },
            uri: `https://api.spotify.com/v1/me/playlists?limit=${10}&offset=${0}`,
        }

        let playlists = await rp(options)
        return JSON.parse(playlists).items
    } catch (err) {
        logger.error("error in fetching spotify playlist function")
        throw err
    }
}

Spotify.prototype.search = async (textquery) => {
    try {
        if (!this.accessToken) {
            throw new Error("missing access token")
        }
        const options = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + 'BQBbKWfYMB_5YnW1Twu3wDNnrfeQDF1mJrIxDUS1E0VRfAfYF1GXKxn6fSwtHhmdEZ0dAYHu9xBFzZ-ed7BgbtxYb0zVZq8j2iO8eJL3ys1wNme1GoVreZOWbjeSAlYgffSKBxJpNwd3609A47JjetjiK4N8ORzoRYn081hcPQKwcvCB-kAIu3WA_oTF_IZ8KHpV68BLr8M4-WYkXjCexm4e_mXoiSk'
            },
            uri: `https://api.spotify.com/v1/search?limit=50&offset=0&q=${textquery}&type=track`,
        }
        let songs = await rp(options)
        console.log(songs)
        songs = JSON.parse(songs)
        return songs.tracks.items
    } catch (err) {
        logger.error("error in spotify search function")
        throw err
    }
}

const addSongToPlayback = async (spotifyUri) => {
    try {
        const options = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + 'BQBbKWfYMB_5YnW1Twu3wDNnrfeQDF1mJrIxDUS1E0VRfAfYF1GXKxn6fSwtHhmdEZ0dAYHu9xBFzZ-ed7BgbtxYb0zVZq8j2iO8eJL3ys1wNme1GoVreZOWbjeSAlYgffSKBxJpNwd3609A47JjetjiK4N8ORzoRYn081hcPQKwcvCB-kAIu3WA_oTF_IZ8KHpV68BLr8M4-WYkXjCexm4e_mXoiSk'
            },
            uri: `https://api.spotify.com/v1/me/player/queue?uri=${spotifyUri}`,
        }
        await rp(options)
        logger.info(`added song ${spotifyUri} to the playback queue`)
    } catch (err) {
        logger.error("error in adding song to the playback queue function")
        console.log(err)
    }
}

Spotify.prototype.stateUpdate = async () => {
    try {
        const options = {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + 'BQBbKWfYMB_5YnW1Twu3wDNnrfeQDF1mJrIxDUS1E0VRfAfYF1GXKxn6fSwtHhmdEZ0dAYHu9xBFzZ-ed7BgbtxYb0zVZq8j2iO8eJL3ys1wNme1GoVreZOWbjeSAlYgffSKBxJpNwd3609A47JjetjiK4N8ORzoRYn081hcPQKwcvCB-kAIu3WA_oTF_IZ8KHpV68BLr8M4-WYkXjCexm4e_mXoiSk'
            },
            uri: `https://api.spotify.com/v1/me/player`,
        }

        let config = await rp(options)
        // console.log(config)
        config = JSON.parse(config)
        if (config.device.is_restricted) {
            logger.error("the device is restricted")
            return
        }
        if (config.is_playing && config.currently_playing_type === "track") {
            console.log("in here")
            const songId = config.item.id
            const currentSong = await Song.findOne({ songId: songId })

            if (currentSong) {
                if (!currentSong.isPlaying || !currentSong.played) {
                    Song.findOneAndUpdate({ songId: songId }, { isPlaying: true, played: true })
                }
            }

            const songDuration = config.item.duration_ms
            const progress = config.progress_ms

            const time_left = songDuration - progress

            if (time_left <= 10000) {
                // add the top song to the queue
                let topSong = await Song.find({ isPlaying: false, played: false }).sort({ 'upvotes': -1, 'created_at': 1 }).limit(1)
                if(topSong.length===0){
                    logger.error("no songs on leaderboard")
                    return
                }
                else{
                    const spotifyUri = `spotify:track:${topSong.songId}`
                    topSong = topSong[0]
                    // await addSongToPlayback(spotifyUri)
                    logger.info("added song to the queue")
                    console.log(topSong.songId)
                    await Song.findOneAndUpdate({ songId: topSong.songId }, { isPlaying: true, played: true })
                }
                if(currentSong)
                    await Song.findOneAndUpdate({ songId: currentSong.songId }, { isPlaying: false })
            }
        }

    } catch (err) {
        logger.error("error function to check spotify status")
        console.log(err)
    }
}



module.exports = new Spotify();