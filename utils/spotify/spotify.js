require('dotenv').config();
const logger = require('../logger/logger')
const rp = require('request-promise');

const { json } = require('body-parser');
function Spotify() { }

Spotify.prototype.seed = () => {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URL;
}

Spotify.prototype.generateUrl = () => {
    const scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-private';
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

        const options={
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

Spotify.prototype.setAccessToken=(accessToken)=>{
    this.accessToken = accessToken;
}

Spotify.prototype.getAccessToken=()=>{
    return this.accessToken
}

Spotify.prototype.setRefreshToken=(refreshToken)=>{
    this.refreshToken = refreshToken;
}

Spotify.prototype.getRefreshToken=()=>{
    return this.refreshToken
}




module.exports = new Spotify();