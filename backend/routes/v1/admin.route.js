const {
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
  updateAccountStatus,
} = require("../../controllers/admin.controller");
const {
  getRoomListing,
  postRoomListing,
  updateRoomListing,
  deleteRoomListing,
} = require("../../controllers/roomListing.controller");
const { deleteTour } = require("../../controllers/tour.controller");
const {
  ensureAuthenticated,
  ensureAdmin,
} = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/imageUploading.middleware");

const router = require("express").Router();

router.get("/getAllUsers", getAllUsers);
router.put("/updateUser/:id", ensureAuthenticated, ensureAdmin, updateUser);
router.delete("/deleteUser/:id", ensureAuthenticated, ensureAdmin, deleteUser);
router.post("/createUser", ensureAuthenticated, ensureAdmin, createUser);
router.get("/getAllTours", getAllTours);
router.post("/createTour", ensureAuthenticated, ensureAdmin, createTour);
router.put("/updateTour/:id", ensureAuthenticated, ensureAdmin, updateTour);
router.delete("/deleteTour/:id", ensureAuthenticated, ensureAdmin, deleteTour);
router.get("/getAllRoomListings", getRoomListing);
router.post(
  "/createRoomListing",
  ensureAuthenticated,
  ensureAdmin,
  upload.array("images", 10),
  postRoomListing
);
router.put(
  "/updateRoomListing/:id",
  ensureAuthenticated,
  ensureAdmin,
  upload.array("images", 10),
  updateRoomListing
);
router.delete(
  "/deleteRoomListing/:id",
  ensureAuthenticated,
  ensureAdmin,
  deleteRoomListing
);
router.get("/getAllReviews", getAllReviews);
router.put("/updateReview/:id", ensureAuthenticated, ensureAdmin, updateReview);
router.delete(
  "/deleteReview/:id",
  ensureAuthenticated,
  ensureAdmin,
  deleteReview
);
router.put(
  "/updateAccountStatus/:id",
  ensureAuthenticated,
  ensureAdmin,
  updateAccountStatus
);

module.exports = router;
