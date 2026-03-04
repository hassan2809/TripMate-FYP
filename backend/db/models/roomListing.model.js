const mongoose = require("mongoose")
const Schema = mongoose.Schema

const RoomListingSchema = new Schema({
    amenities: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    furnished: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    furnished: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    roomType: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    images: [
        { type: String }
    ],
})

const RoomListingModel = mongoose.model("roomListings", RoomListingSchema)

module.exports = RoomListingModel;