const mongoose = require("mongoose");
const WebSocket = require("ws");

const room = new mongoose.Schema({
    participants: {
        type: Array,
        default: []
    },
    created_by: {
        type: String,
        required: true
    },
    parent_socket: {
        type: String,
        required: true
    },
    room_id: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
})

const Room = mongoose.model('room', room);
module.exports = Room;