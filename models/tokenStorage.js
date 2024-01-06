const mongoose = require("mongoose");

const tokenStorage = new mongoose.Schema({
    spotifyClientId:{
        type: String,
        required: true
    },
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model('tokenStorage', tokenStorage);