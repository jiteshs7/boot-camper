const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

//@dec      Get all users
//@route    GET api/v1/users
//@access   Private/Admin

exports.getUsers = asyncHandler(async (req, res, next) => {
  return res.success(200).json(res.advancedResults);
});

//@dec      Get all users
//@route    GET api/v1/users/:id
//@access   Private/Admin

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = User.findById(req.params.id);
  if (!user) {
    return next(new ErrorResponse("User not found!", 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@dec      Create user
//@route    POST api/v1/users
//@access   Private/Admin

exports.createUser = asyncHandler(async (req, res, next) => {
  const oldUser = User.findByOne({ email: req.body.email });
  // Checking if user is present with same email
  if (oldUser) {
    return next(new ErrorResponse("User already present!"));
  }
  const user = User.create(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
});

//@dec      Update user
//@route    PUT api/v1/users/:id
//@access   Private/Admin

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = User.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!user) {
    return next(new ErrorResponse("User not found!", 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@dec      Delete user
//@route    DELETE api/v1/users/:id
//@access   Private/Admin

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new ErrorResponse("User not found!", 404));
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});
