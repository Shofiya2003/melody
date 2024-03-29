const mongoose = require("mongoose");

const song = new mongoose.Schema({
    songId: {
        type: String,
        required: true
    },
    spotifyId: {
        type: String,
        required: false
    },
    isPlaying: {
        type: Boolean,
        default: false
    },
    played: {
        type: Boolean,
        default: false
    },
    upvotes: {
        type: Number,
        default: 1
    },
    upvoters: {
        type: Array,
        required: true
    }
}, {
    timestamps: true
})

const Song = mongoose.model('song', song);
module.exports = Song;