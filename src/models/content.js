const mongoose  = require("mongoose");

const contentSchema = new mongoose.Schema({
    text: String,
    to: Number,
    from: Number,
    round: Number,
    game: String,
    index: String,
}, {collection: 'textcontent'});

module.exports = mongoose.model("Text", contentSchema);