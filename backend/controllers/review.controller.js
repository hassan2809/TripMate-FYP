const ReviewModel = require("../db/models/review.model");

const getReviews = async (req, res) => {
  try {
    const { itemId } = req.params;
    const reviews = await ReviewModel.find({ itemId });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const addReview = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { userName, title, content, itemType, rating } = req.body;
    const userId = req.user._id;

    const existingReview = await ReviewModel.findOne({ itemId, userId });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: `You have already reviewed this ${itemType}.`,
      });
    }

    const newReview = new ReviewModel({
      itemId,
      userName,
      title,
      userId,
      itemType,
      content,
      rating,
      date: new Date(),
    });

    await newReview.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { getReviews, addReview };
