const crypto = require("crypto");

const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const sendMail = require("../utils/sendEmail");
const User = require("../models/User");

//@dec      Register a user
//@route    POST api/v1/auth/register
//@access   Public

exports.register = asyncHandler(async (req, res, next) => {
  const { email, name, role, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, res, 200);
});

//@dec      Login a user
//@route    POST api/v1/auth/login
//@access   Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate Email and password

  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Please provide valid credentials.", 401));
  }

  //Match password

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Please provide valid credentials.", 401));
  }

  sendTokenResponse(user, res, 200);
});

//@dec      Logout user
//@route    POST api/v1/auth/logout
//@access   Public

exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

//@dec      Get a user
//@route    Get api/v1/auth/currentUser
//@access   Public

exports.getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.status(200).json({
      success: true,
      data: user,
    });
  } else {
    next(new ErrorResponse("User not found!", 404));
  }
});

//@dec      Handle Update user
//@route    PUT api/v1/auth/updateUser
//@access   Public

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      email: req.body.email,
      name: req.body.name,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    return next(
      new ErrorResponse("NO user found with provided email address", 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});
//@dec      Handle Update password
//@route    PUT api/v1/auth/updatePassword
//@access   Public

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(
      new ErrorResponse("No user found with provided email address", 404)
    );
  }

  if (await !user.matchPassword(req.body.currentPassword)) {
    return next(new ErrorResponse("Inocorrect password!", 401));
  }

  if (req.body.currentPassword === req.body.newPassword) {
    return next(
      new ErrorResponse("Old and new password can not be same.", 401)
    );
  }

  user.password = req.body.newPassword;

  await user.save();

  sendTokenResponse(user, res, 200);
});

//@dec      Handle Forgot Password
//@route    POST api/v1/auth/forgotPassword
//@access   Public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse("NO user found with provided email address", 404)
    );
  }
  // Get Reset Token

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //Create reset token
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/resetPassword/${resetToken}`;

  const message = `You are receving this email because you(or someone else) has requested the reset of a password, please click on the link to reset it <a href=${resetURL} >Reset Password</a>`;

  try {
    await sendMail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({
      success: "true",
      data: "Email sent!",
    });
  } catch (error) {
    console.log("sendMail Error", error);
    user.resetPasswordExpire = null;
    user.resetPasswordToken = null;

    await user.save({ validateBeforeSave: false });
    next(new ErrorResponse("Internal server error.", 500));
  }
});

//@dec      Handle Forgot Password
//@route    PUTT api/v1/auth/resetPassword/:resettoken
//@access   Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get token

  const token = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 403));
  }

  user.password = req.body.password;
  user.resetPasswordExpire = null;
  user.resetPasswordToken = null;

  await user.save();

  sendTokenResponse(user, res, 200);
});

//Get token from model, create cookie and send response

const sendTokenResponse = (user, res, statusCode) => {
  const token = user.getSignedJWTToken();

  const options = {
    expire: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ), // Converting 30 to 30 days
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    msg: "User LoggedIn!",
    data: { token },
  });
};
