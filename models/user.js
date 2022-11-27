const mongoose = require("mongoose");

const user = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    googleId: {
        type: String,
        required: true
    },
    picture: String,
})

const User = mongoose.model('user', user);
module.exports = User;