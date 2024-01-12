const jwt = require("jsonwebtoken");

const asyncHandler = require("./asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Protext routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  //Check token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse("Not authorized!", 401));
  }

  // Verify token
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = await User.findById(decodedToken.id);
    if (!req.user) throw new Error("Not authorized!");
    return next();
  } catch (error) {
    console.log("Verification error", error);
    return next(new ErrorResponse("Not authorized!", 401));
  }
});

exports.authorization = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role as ${req.user.role} is not authorized!`,
          403
        )
      );
    }
    next();
  };
};
