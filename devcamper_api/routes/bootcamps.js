const express = require("express");

const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");

const advancedResults = require("../middleware/advancedResults");
const Bootcamp = require("../models/bootcamps");
// Include other resourse routers
const courseRouter = require("./courses");
const reviewRouter = require("./reviews");
const { protect, authorization } = require("../middleware/auth");
const router = express.Router();

// Re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

//Bootcamps routes

router.route("/radius/:zipCode/:distance/:unit").get(getBootcampsInRadius);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorization("publisher", "admin"), createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorization("publisher", "admin"), updateBootcamp)
  .delete(protect, authorization("publisher", "admin"), deleteBootcamp);

router
  .route("/:id/photo")
  .put(protect, authorization("publisher", "admin"), bootcampPhotoUpload);

module.exports = router;
