const { getAllReviews } = require("../../controllers/admin.controller");
const {
  getReviews,
  addReview,
} = require("../../controllers/review.controller");
const { ensureAuthenticated } = require("../../middlewares/auth.middleware");

const router = require("express").Router();

router.get("/getReviews/:itemId", getReviews);
router.post("/addReview/:itemId", ensureAuthenticated, addReview);
router.get("/getAllReviews", getAllReviews);

module.exports = router;
