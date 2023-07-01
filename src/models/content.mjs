import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
    text: String,
    to: Number,
    from: Number,
    fromStr: String,
    round: Number,
    game: String,
    index: Number,
}, {collection: 'textcontent'});

export default mongoose.model("Text", contentSchema);