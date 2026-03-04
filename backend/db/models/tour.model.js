const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TourSchema = new Schema({
  destination: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  transportMode: {
    type: String,
    required: true,
  },
  accommodationType: {
    type: String,
    required: true,
  },
  startingPoint: {
    type: String,
    required: true,
  },
  travelCost: {
    type: Number,
    required: true,
  },
  foodCost: {
    type: Number,
    required: true,
  },
  miscellaneousCost: {
    type: Number,
    required: true,
  },
  accommodationCost: {
    type: Number,
    required: true,
  },
  numberOfDays: {
    type: Number,
    required: true,
  },
  transportMode: {
    type: String,
    required: true,
  },
  companions: [
    {
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      _id: false,
    },
  ],
  itinerary: [
    {
      activity: {
        type: String,
        default: "",
      },
      date: {
        type: Date,
        default: "",
      },
      details: {
        type: String,
        default: "",
      },
    },
  ],
  totalBudget: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

const TourModel = mongoose.model("tours", TourSchema);

module.exports = TourModel;
