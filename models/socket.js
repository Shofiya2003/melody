const mongoose = require('mongoose');

const socket = new mongoose.Schema({
    ws: {
        type: {},
        required: true
    }
})

module.exports = new mongoose.model('socket', socket);