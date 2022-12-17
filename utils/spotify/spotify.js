require('dotenv').config();

function Spotify() { }

Spotify.prototype.seed = () => {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URL;
}

Spotify.prototype.generateUrl = () => {
    const scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-private';
    const url = `https://accounts.spotify.com/authorize?response_type=token&client_id=${this.clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;
    return url;
}

module.exports = new Spotify();