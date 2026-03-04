const {
  postTourPlan,
  getTourPackages,
  getTourPackageDetails,
  addCompanionInTour,
  getMyTours,
  removeJoinedTour,
  deleteTour,
  updateTourPlan,
} = require("../../controllers/tour.controller");
const { ensureAuthenticated } = require("../../middlewares/auth.middleware");

const router = require("express").Router();

router.post("/postTourPlan", ensureAuthenticated, postTourPlan);
router.get("/getTourPackages", getTourPackages);
router.get("/getTourPackage/:id", getTourPackageDetails);
router.post("/addCompanion/:id", ensureAuthenticated, addCompanionInTour);
router.get("/myTours", getMyTours);
router.put("/removeJoinedTours", ensureAuthenticated, removeJoinedTour);
router.delete("/deleteTour/:id", ensureAuthenticated, deleteTour);
router.put("/updateTour/:id", ensureAuthenticated, updateTourPlan);

module.exports = router;
