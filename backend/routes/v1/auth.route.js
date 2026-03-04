const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  fetchUserDetails,
  updateUserDetails,
  createBooking,
  getUserBookings,
  cancelBooking,
} = require("../../controllers/auth.controller");
const { ensureAuthenticated } = require("../../middlewares/auth.middleware");
const uploadImage = require("../../middlewares/imageUploading.middleware");

const router = require("express").Router();

router.post("/signup", uploadImage.array("kycDocuments", 3), signup);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:id/:token", resetPassword);
router.get("/fetchUserDetails", ensureAuthenticated, fetchUserDetails);
router.post("/updateUserDetails", ensureAuthenticated, updateUserDetails);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:id/:token", resetPassword);
router.post("/createBooking", ensureAuthenticated, createBooking);
router.get("/userBookings", ensureAuthenticated, getUserBookings);
router.delete("/cancelBooking/:id", ensureAuthenticated, cancelBooking);

module.exports = router;
