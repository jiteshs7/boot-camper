const asyncHandler = require("../middleware/asyncHandler");

const Review = require("../models/reviews");
const Bootcamp = require("../models/bootcamps");
const ErrorResponse = require("../utils/errorResponse");

//@dec      Get all reviews
//@route    GET api/v1/reviews
//@route    GET api/v1/bootcamps/:bootcampId/reviews
//@access   Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  // Checking if we need to get courses on the basis of
  // bootcamp id or not
  if (req.params.bootcampId) {
    const reviews = Review.find({ bootcamp: req.params.bootcampId });

    res.status(200).json({
      success: true,
      msg: "Course fetched!",
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@dec      Get single review
//@route    GET api/v1/reviews/:id
//@access   Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!review) {
    return next(new ErrorResponse("Review not found!", 404));
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

//@dec      Add review for bootcamp
//@route    POST api/v1/bootcamps/bootcampId/reviews
//@access   Public
exports.addReview = asyncHandler(async (req, res, next) => {
  const bootcamp = Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse("Bootcamp not found!", 404));
  }

  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const review = await Review.create(req.body);

  res.status(200).json({
    success: true,
    msg: "Review added!",
    data: review,
  });
});

//@dec      Update review for bootcamp
//@route    PUT api/v1/bootcamps/:bootcampId/reviews
//@access   Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse("Review not found!", 404));
  }

  if (review.user.toString !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse("You are not authoeized to update review!", 403)
    );
  }

  review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      text: req.body.text,
      rating: req.body.rating,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    msg: "Review updated!",
    data: review,
  });
});

//@dec      Add review for bootcamp
//@route    DELETE api/v1/reviews:/id
//@access   Pricate
exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse("Review not found!", 404));
  }

  if (review.user.toString !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse("You are not authoeized to update review!", 403)
    );
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    msg: "Review deleted!",
    data: {},
  });
});
