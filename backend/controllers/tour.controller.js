const nodemailer = require("nodemailer");
const TourModel = require("../db/models/tour.model");

const postTourPlan = async (req, res) => {
  try {
    const {
      destination,
      startDate,
      endDate,
      accommodationType,
      startingPoint,
      transportMode,
      travelCost,
      foodCost,
      miscellaneousCost,
      accommodationCost,
      numberOfDays,
      companions,
      itinerary,
      totalBudget,
      createdBy,
    } = req.body;
    const emails = companions.map((key) => key.email);

    const tourPlanModel = new TourModel({
      destination,
      accommodationType,
      startingPoint,
      startDate,
      endDate,
      transportMode,
      travelCost,
      foodCost,
      miscellaneousCost,
      accommodationCost,
      numberOfDays,
      companions,
      itinerary,
      totalBudget,
      createdBy,
      creatorId: req.user._id,
    });
    await tourPlanModel.save();

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const emailPromises = emails.map((email) => {
      const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: `You're Invited to Join a Tour to ${destination}!`,
        html: `
                  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                  <p>Hi there,</p>
                  <p>We are excited to invite you to an unforgettable tour to <strong>${destination}</strong>. Here are the details:</p>
                  <ul style="list-style: none; padding: 0;">
                      <li><strong>Destination:</strong> ${destination}</li>
                      <li><strong>Duration:</strong> ${numberOfDays} days Trip</li>
                      <li><strong>Start Date:</strong> ${new Date(
                        startDate
                      ).toLocaleDateString()}</li>
                      <li><strong>End Date:</strong> ${new Date(
                        endDate
                      ).toLocaleDateString()}</li>
                  </ul>
                  <p>We hope you can join us for this exciting adventure. Check your account for more details and to confirm your participation.</p>
                  <p style="text-align: center;">
                      <a href="#" style="display: inline-block; background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px;">View Details & Confirm</a>
                  </p>
                  <p>We look forward to traveling with you!</p>
                  <p>Thanks, <br>The Team</p>
                  </div>
                  `,
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);

    res.status(200).json({
      message: "Tour Plan saved successfully",
      success: "true",
      tourId: tourPlanModel._id,
    });
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Internal Server Erorr...", success: false });
  }
};

const getTourPackages = async (req, res) => {
  try {
    const packages = await TourModel.find();
    res.status(200).json({ success: true, data: packages });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Erorr...", success: false });
    // console.log(error)
  }
};

const getTourPackageDetails = async (req, res) => {
  // console.log("getTourPackageDetails")
  const { id } = req.params;
  try {
    const tour = await TourModel.findById(id);
    if (!tour) {
      return res
        .status(404)
        .json({ success: false, message: "Tour package not found" });
    }
    res.status(200).json({ success: true, data: tour });
  } catch (error) {
    console.error("Error fetching tour package:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const addCompanionInTour = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const tour = await TourModel.findById(id);
    if (!tour) {
      return res
        .status(404)
        .json({ success: false, message: "Tour not found" });
    }

    if (tour.createdBy === email) {
      return res.status(400).json({
        success: false,
        message: "You cannot join a tour you created",
      });
    }

    const emailExists = tour.companions.some(
      (companion) => companion.email === email
    );
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "This email is already added to the tour",
      });
    }

    const updatedTour = await TourModel.findByIdAndUpdate(
      id,
      { $push: { companions: { name, email } } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "You have successfully added to the tour.",
      data: updatedTour,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getMyTours = async (req, res) => {
  const { email } = req.query;

  try {
    const createdTours = await TourModel.find({ createdBy: email });
    const joinedTours = await TourModel.find({
      companions: { $elemMatch: { email } },
    });

    res.status(200).json({ createdTours, joinedTours });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const removeJoinedTour = async (req, res) => {
  const { tourId, email } = req.body;

  if (!tourId || !email) {
    return res
      .status(400)
      .json({ error: "tourId and companionEmail are required" });
  }

  try {
    const result = await TourModel.updateOne(
      { _id: tourId },
      { $pull: { companions: { email: email } } }
    );

    if (result.modifiedCount > 0) {
      res
        .status(200)
        .json({ success: true, message: "Companion removed successfully" });
    } else {
      res
        .status(404)
        .json({ success: false, error: "Tour or companion not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteTour = async (req, res) => {
  try {
    const tourId = req.params.id;
    const userId = req.user._id;

    const tour = await TourModel.findById(tourId);

    if (!tour) {
      return res
        .status(404)
        .json({ success: false, message: "Tour not found" });
    }

    if (
      tour.creatorId.toString() !== userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this tour",
      });
    }

    const deletedTour = await TourModel.findByIdAndDelete(tourId);

    res.status(200).json({
      success: true,
      message: "Tour deleted successfully",
      deletedTour,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateTourPlan = async (req, res) => {
  try {
    const {
      destination,
      startDate,
      endDate,
      transportMode,
      travelCost,
      foodCost,
      miscellaneousCost,
      accommodationCost,
      numberOfDays,
      companions,
      itinerary,
      totalBudget,
      createdBy,
    } = req.body;
    const { id } = req.params;

    const existingTour = await TourModel.findById(id);
    if (!existingTour) {
      return res
        .status(404)
        .json({ success: false, message: "Tour not found" });
    }

    if (
      existingTour.creatorId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to update this tour",
        });
    }

    const updatedTour = await TourModel.findByIdAndUpdate(
      id,
      {
        destination,
        startDate,
        endDate,
        transportMode,
        travelCost,
        foodCost,
        miscellaneousCost,
        accommodationCost,
        numberOfDays,
        companions,
        itinerary,
        totalBudget,
        createdBy,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Tour Plan updated successfully",
      success: "true",
      data: updatedTour,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Erorr...", success: false });
  }
};

module.exports = {
  postTourPlan,
  getTourPackages,
  getTourPackageDetails,
  addCompanionInTour,
  getMyTours,
  removeJoinedTour,
  deleteTour,
  updateTourPlan,
};
