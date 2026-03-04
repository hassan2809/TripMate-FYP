const {
  getRoomListing,
  postRoomListing,
  filterRoomListings,
  getRoomById,
  deleteRoomListing,
  updateRoomListing,
  getMyRoomListings,
  getRoomByUser,
} = require("../../controllers/roomListing.controller");
const { ensureAuthenticated } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/imageUploading.middleware");
const router = require("express").Router();

router.post(
  "/postRoomListing",
  ensureAuthenticated,
  upload.array("images", 10),
  postRoomListing
);
router.get("/getRoomListings", getRoomListing);
router.post("/filterRoomListings", filterRoomListings);
router.get("/getRoomById/:id", getRoomById);
router.delete("/deleteRoomListing/:id", ensureAuthenticated, deleteRoomListing);
router.put(
  "/updateRoomListing/:id",
  ensureAuthenticated,
  upload.array("images", 10),
  updateRoomListing
);
router.get("/myRoomListings", getMyRoomListings);
router.get("/getRoomByUser/:id", getRoomByUser);

module.exports = router;
