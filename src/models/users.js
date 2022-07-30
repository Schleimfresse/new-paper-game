const mongoose  = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        maxlength: 15
    },
    password: {
        type: String,
        required: true
    },
    stats: {
        gamesPlayed: {
            type: Number,
            default: 0
        },
        points: {
            type: Number,
            default: 0
        },
    },
    date: {
        type: Date,
        default: Date.now
    },
}, {collection: 'users'});

module.exports = mongoose.model("UserSchema", userSchema);