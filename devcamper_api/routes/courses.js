const express = require("express");

const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses");

const advancedResults = require("../middleware/advancedResults");
const Course = require("../models/courses");
const { protect, authorization } = require("../middleware/auth");

const router = express.Router({ mergeParams: true }); // It let us to use course router in other routes

//Courses routes

router
  .route("/")
  .get(
    advancedResults(Course, {
      path: "bootcamp",
      select: "name description",
    }),
    getCourses
  )
  .post(protect, authorization("publisher", "admin"), createCourse);
router
  .route("/:id")
  .get(getCourse)
  .put(protect, authorization("publisher", "admin"), updateCourse)
  .delete(protect, authorization("publisher", "admin"), deleteCourse);

module.exports = router;
