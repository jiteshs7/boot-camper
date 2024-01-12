const express = require("express");

const {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  updateUser,
  updatePassword,
  logout,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/currentUser", protect, getCurrentUser);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgotPassword", forgotPassword);

router.put("/updateUser/", protect, updateUser);
router.put("/updatePassword/", protect, updatePassword);
router.put("/resetPassword/:resettoken", resetPassword);

module.exports = router;
