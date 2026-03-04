const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../db/models/user.model");
const BookingModel = require("../db/models/booking.model");
const appConfig = require("../config/app.config");
const Stripe = require("stripe");
const stripe = new Stripe(appConfig.stripe.stripe_secret);

const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists.", success: false });
    }

    const kycDocuments = req.files?.map((file) => file.path) || [];

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      name: fullName,
      email,
      password: hashedPassword,
      kycDocuments,
      accountStatus: "pending",
    });

    await newUser.save();

    return res.status(201).json({
      message: "Signup successful. Awaiting admin approval.",
      success: true,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(403).json({
        message: "User does not exist. Authentication failed.",
        success: false,
      });
    }

    if (user.accountStatus !== "approved") {
      return res.status(403).json({
        message: `Account ${user.accountStatus}. Please wait for admin approval.`,
        success: false,
      });
    }

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res.status(403).json({
        message: "Incorrect password. Authentication failed.",
        success: false,
      });
    }

    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_ENCRYPT,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Login successful",
      success: true,
      jwtToken,
      email,
      role: user.role,
      name: user.name,
      userId: user._id,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const fetchUserDetails = async (req, res) => {
  try {
    // console.log(req)
    res.status(200).json({
      message: "Fetch User details...",
      name: req.user.name,
      email: req.user.email,
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Erorr...", success: false });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    // console.log(req.user)
    // console.log("updateUserDetails")
    const { name, email, currentPassword, newPassword } = req.body;
    // console.log(newPassword)
    const userId = req.user._id;
    // console.log(userId)
    const user = await UserModel.findById(userId);
    // console.log(user)
    if (currentPassword && newPassword) {
      const passwordCheck = await bcrypt.compare(
        currentPassword,
        user.password
      );
      // console.log(passwordCheck)
      if (!passwordCheck) {
        return res
          .status(403)
          .json({ message: "Current Password is wrong.", success: false });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res
      .status(200)
      .json({ message: "User details updated successfully", success: "true" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Erorr...", success: false });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    // console.log(user)
    if (!user) {
      return res.status(403).json({
        message: "User not exists.Authentication Failed!!!",
        success: false,
      });
    }

    const jwtToken = jwt.sign({ _id: user._id }, process.env.JWT_ENCRYPT, {
      expiresIn: "24h",
    });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    var mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: email || "fa21-bse-069@cuilahore.edu.pk",
      subject: "Reset Your Password - Action Required",
      // text: `http://localhost:5173/resetPassword/${user._id}/${jwtToken}`
      html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #4CAF50;">Reset Your Password</h2>
              <p>Hi ${user.name || "User"},</p>
              <p>We received a request to reset your password. You can reset it by clicking the button below:</p>
              <a href="${appConfig.url.frontend_url}/resetPassword/${
        user._id
      }/${jwtToken}" 
                  style="display: inline-block; padding: 10px 15px; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">
                  Reset Password
              </a>
              <p>If you didn’t request this, please ignore this email. Your password will remain unchanged.</p>
              <p>Thanks, <br>The Team</p>
              </div>
              `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    res.status(200).json({
      message: "Reset Password link is send on the email.",
      success: "true",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Erorr...", success: false });
  }
};

const resetPassword = async (req, res) => {
  try {
    // console.log(req)
    // console.log(req.body)
    const { id, token } = req.params;
    const { confirmPassword } = req.body;

    if (!id || !token) {
      return res
        .status(400)
        .json({ message: "Invalid request data", success: false });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ENCRYPT);
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid or expired token", success: false });
    }

    const user = await UserModel.findById(id);
    user.password = await bcrypt.hash(confirmPassword, 10);
    await user.save();
    res
      .status(200)
      .json({ message: "Password reset successfully.", success: "true" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Erorr...", success: false });
  }
};

const createBooking = async (req, res) => {
  try {
    const {
      roomId,
      name,
      email,
      phone,
      checkInDate,
      checkOutDate,
      numGuests,
      specialRequests,
      totalPrice,
      status,
      paymentMethod,
    } = req.body;

    if (paymentMethod !== "stripe") {
      const existingBooking = await BookingModel.findOne({
        userId: req.user._id,
        roomId: roomId,
      });

      if (existingBooking) {
        return res.status(400).json({
          success: false,
          message: "You have already booked this room.",
        });
      }
    }

    const pkrPrice = totalPrice;
    const usdAmount = Math.round(pkrPrice / 280);

    if (paymentMethod === "stripe") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Room Booking - ${roomId} (Rs ${pkrPrice})`,
              },
              unit_amount: usdAmount * 100,
            },
            quantity: 1,
          },
        ],
        customer_email: email,
        metadata: {
          userId: req.user._id.toString(),
          roomId,
          name,
          email,
          phone,
          checkInDate,
          checkOutDate,
          numGuests,
          specialRequests,
          totalPrice,
          status,
          paymentMethod,
        },
        success_url: `${appConfig.url.frontend_url}/payment-success`,
        cancel_url: `${appConfig.url.frontend_url}/payment-cancel`,
      });

      return res.status(200).json({
        success: true,
        url: session.url,
      });
    }

    const newBooking = new BookingModel({
      userId: req.user._id,
      roomId,
      name,
      email,
      phone,
      checkInDate,
      checkOutDate,
      numGuests,
      specialRequests,
      totalPrice,
      status,
      paymentMethod,
    });

    await newBooking.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: newBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await BookingModel.find({ userId })
      .populate("roomId", "title location images price")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

const cancelBooking = async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.user._id;

  try {
    const booking = await BookingModel.findById(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    await BookingModel.findByIdAndDelete(bookingId);

    return res
      .status(200)
      .json({ success: true, message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling booking",
    });
  }
};

module.exports = {
  signup,
  login,
  fetchUserDetails,
  updateUserDetails,
  forgotPassword,
  resetPassword,
  createBooking,
  getUserBookings,
  cancelBooking,
};
