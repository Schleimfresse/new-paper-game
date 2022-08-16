const mongoose  = require("mongoose");

const contentSchema = new mongoose.Schema({
    text: {type: String, required: true},
    to: {type: Number, required: true},
    from: {type: Number, required: true},
    fromStr: {type: String, required: true},
    round: {type: String, required: true},
    game: {type: String, required: true},
    index: {type: Number, required: true},
}, {collection: 'textcontent'});

module.exports = mongoose.model("Text", contentSchema);