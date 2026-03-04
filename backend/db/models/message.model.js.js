const mongoose = require("mongoose")
const Schema = mongoose.Schema

const MessageSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    recieverId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    message: {
        type: String,
        required: true
    },
}, { timestamps: true })

const MessageModel = mongoose.model("messages", MessageSchema)

module.exports = MessageModel;