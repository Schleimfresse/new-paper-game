const mongoose  = require("mongoose");

const contentSchema = new mongoose.Schema({
    text: String,
    to: Number,
    from: Number,
    fromStr: String,
    round: Number,
    game: String,
    index: Number,
}, {collection: 'textcontent'});

module.exports = mongoose.model("Text", contentSchema);