const router = require("express").Router();

const authRoutes = require("./v1/auth.route");
const messageRoutes = require("./v1/message.route");
const reviewRoutes = require("./v1/review.route");
const roomListingRoutes = require("./v1/roomListing.route");
const tourRoutes = require("./v1/tour.route");
const adminRoutes = require("./v1/admin.route");

router.use("/auth", authRoutes);
router.use("/chat", messageRoutes);
router.use("/review", reviewRoutes);
router.use("/roomListing", roomListingRoutes);
router.use("/tour", tourRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
