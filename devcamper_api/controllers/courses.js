const asyncHandler = require("../middleware/asyncHandler");

const Course = require("../models/courses");
const Bootcamp = require("../models/bootcamps");
const ErrorResponse = require("../utils/errorResponse");

//@dec      Get all courses
//@route    GET api/v1/courses
//@route    GET api/v1/bootcamps/:bootcampId/courses
//@access   Public

exports.getCourses = asyncHandler(async (req, res, next) => {
  // Checking if we need to get courses on the basis of
  // bootcamp id or not
  if (req.params.bootcampId) {
    const courses = Course.find({ bootcamp: req.params.bootcampId });

    res.status(200).json({
      success: true,
      msg: "Course fetched!",
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@dec      Get Single course
//@route    GET api/v1/courses/:id
//@access   Public

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    next(
      new ErrorResponse(`course not found with id of ${req.params.id}`, 404)
    );
    return;
  }

  res.status(200).json({
    success: true,
    msg: "Course fetched!",
    data: course,
  });
});

//@dec      Create new course
//@route    POST api/v1/bootcamps/:bootcampId/courses/
//@access   Private

exports.createCourse = asyncHandler(async (req, res, next) => {
  // Add user to the body
  req.body.user = req.user.id;

  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    next(
      new ErrorResponse(
        `Bootcamp not found with id of ${req.params.bootcampId}`,
        404
      )
    );
    return;
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to add this course.`, 401)
    );
  }

  const newCourse = await Course.create(req.body);

  res.status(201).json({
    success: true,
    msg: "New course created!",
    data: newCourse,
  });
});

//@dec      Update course
//@route    PUT api/v1/courses/:id
//@access   Private

exports.updateCourse = asyncHandler(async (req, res, next) => {
  let updatedCourse = await Course.findById(req.params.id);

  if (!updatedCourse) {
    next(
      new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
    );
    return;
  }

  if (
    updatedCourse.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(`User is not authorized to update this course.`, 401)
    );
  }

  updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // To return new updated data
    runValidators: true, // To have proper validation
  });

  res.status(200).json({
    success: true,
    msg: "Course updated!",
    data: updatedCourse,
  });
});

//@dec      Delete bootcamp
//@route    DELETE api/v1/coursess/:id
//@access   Private

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    next(
      new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
    );
    return;
  }

  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to delete this course.`, 401)
    );
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    msg: "Course deleted!",
  });
});
