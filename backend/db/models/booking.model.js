const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BookingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "roomListings",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    numGuests: {
      type: Number,
      required: true,
    },
    specialRequests: {
      type: String,
      default: "",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const BookingModel = mongoose.model("bookings", BookingSchema);
module.exports = BookingModel;
