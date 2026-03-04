const ReviewModel = require("../db/models/review.model");
const RoomListingModel = require("../db/models/roomListing.model");
const TourModel = require("../db/models/tour.model");
const UserModel = require("../db/models/user.model");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find({ role: { $ne: "admin" } }).select(
      "-password"
    );
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching users",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      success: true,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const getAllTours = async (req, res) => {
  try {
    const tours = await TourModel.find();
    res.status(200).json({
      success: true,
      tours,
    });
  } catch (error) {
    console.error("Error fetching tours:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching tours",
    });
  }
};

const createTour = async (req, res) => {
  try {
    const {
      destination,
      startDate,
      endDate,
      transportMode,
      travelCost,
      foodCost,
      accommodationCost,
      miscellaneousCost,
      numberOfDays,
      totalBudget,
      companions,
      itinerary,
    } = req.body;

    const creatorId = req.user._id;
    const createdBy = req.user.email;

    const newTour = new TourModel({
      destination,
      startDate,
      endDate,
      transportMode,
      travelCost,
      foodCost,
      accommodationCost,
      miscellaneousCost,
      numberOfDays,
      totalBudget,
      companions: companions || [],
      itinerary: itinerary || [],
      creatorId,
      createdBy,
    });

    await newTour.save();

    return res.status(201).json({
      success: true,
      message: "Tour created successfully",
      tour: newTour,
    });
  } catch (error) {
    console.error("Error creating tour:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create tour",
      error: error.message,
    });
  }
};

const updateTour = async (req, res) => {
  try {
    const { id } = req.params;

    const tour = await TourModel.findById(id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    const updatedTour = await TourModel.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Tour updated successfully",
      tour: updatedTour,
    });
  } catch (error) {
    console.error("Error updating tour:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update tour",
      error: error.message,
    });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await ReviewModel.find();

    const updatedReviews = await Promise.all(
      reviews.map(async (review) => {
        let itemDetails = null;

        if (review.itemType === "tour") {
          itemDetails = await TourModel.findById(review.itemId);
        } else if (review.itemType === "room") {
          itemDetails = await RoomListingModel.findById(review.itemId);
        }

        return {
          ...review.toObject(),
          itemDetails: itemDetails || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      reviews: updatedReviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching reviews",
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, content } = req.body;

    const updatedReview = await ReviewModel.findByIdAndUpdate(
      id,
      {
        rating,
        title,
        content,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReview = await ReviewModel.findByIdAndDelete(id);

    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

const updateAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountStatus } = req.body;

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(accountStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, approved, rejected.",
      });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { accountStatus },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: `User status updated to '${accountStatus}'`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
  createUser,
  getAllTours,
  createTour,
  updateTour,
  getAllReviews,
  updateReview,
  deleteReview,
  updateAccountStatus
};
