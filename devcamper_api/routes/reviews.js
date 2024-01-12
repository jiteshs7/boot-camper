const express = require("express");

const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviews");

const advancedResults = require("../middleware/advancedResults");
const Review = require("../models/reviews");
const { protect, authorization } = require("../middleware/auth");

const router = express.Router({ mergeParams: true }); // It let us to use Review router in other routes

//Reviews routes

router
  .route("/")
  .get(
    advancedResults(Review, {
      path: "bootcamp",
      select: "name description",
    }),
    getReviews
  )
  .post(protect, authorization("user", "admin"), addReview);
router
  .route("/:id")
  .get(getReview)
  .put(protect, authorization("user", "admin"), updateReview)
  .delete(protect, authorization("user", "admin"), deleteReview);

module.exports = router;
