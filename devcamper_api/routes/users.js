const express = require("express");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");

const advancedResults = require("../middleware/advancedResults");
const { protect, authorization } = require("../middleware/auth");

const User = require("../models/User");

const router = express.Router();

// Every route is going to use it
router.use(protect);
router.use(authorization("admin"));

// Admin routes
router.route("/").get(advancedResults(User), getUsers).post(createUser);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
