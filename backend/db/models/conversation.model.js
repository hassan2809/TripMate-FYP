const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ConverstionSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: "users",
    }],
    messages: [{
        type: Schema.Types.ObjectId,
        ref: "messages",
        default: []

    }],
}, { timestamps: true })

const ConversationModel = mongoose.model("conversations", ConverstionSchema)

module.exports = ConversationModel;