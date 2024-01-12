const path = require("path");

const asyncHandler = require("../middleware/asyncHandler");
const Bootcamp = require("../models/bootcamps");
const geocoder = require("../utils/geocoder");
const ErrorResponse = require("../utils/errorResponse");

//@dec      Get all bootcamps
//@route    GET api/v1/bootcamps
//@access   Public

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  return res
    .status(200)
    .json({ ...res.advancedResults, msg: "Boootcamps fetched!" });
});

//@dec      Get specfic bootcamp
//@route    GET api/v1/bootcamps/:id
//@access   Public

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
    return;
  }

  res.status(200).json({
    success: true,
    msg: "Boootcamp fetched!",
    data: bootcamp,
  });
});

//@dec      Create new bootcamp
//@route    POST api/v1/bootcamps/
//@access   Private

exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to the body
  req.body.user = req.user.id;

  const isPublished = await Bootcamp.findOne({ user: req.user.id });

  if (isPublished && req.user.role !== "admin") {
    return next(
      new ErrorResponse("User already has a published bootcamp", 401)
    );
  }

  const newBootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    msg: "New Boootcamp created!",
    data: newBootcamp,
  });
});

//@dec      Update bootcamp
//@route    PUT api/v1/bootcamps/:id
//@access   Private

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let updatedBootcamp = await Bootcamp.findById(req.params.id);

  if (!updatedBootcamp) {
    next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
    return;
  }

  if (
    updatedBootcamp.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(`User is not authorized to update this bootcamp.`, 401)
    );
  }

  updatedBootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // To return new updated data
    runValidators: true, // To have proper validation
  });

  res.status(200).json({
    success: true,
    msg: "Boootcamp updated!",
    data: updatedBootcamp,
  });
});

//@dec      Delete bootcamp
//@route    DELETE api/v1/bootcamps/:id
//@access   Private

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
    return;
  }

  if (
    updatedBootcamp.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(`User is not authorized to delete this bootcamp.`, 401)
    );
  }

  await bootcamp.deleteOne();

  res.status(200).json({
    success: true,
    msg: "Boootcamp deleted!",
  });
});

//@dec      Get bootcamps within a radius
//@route    GET api/v1/bootcamps/radius/:zipcode/:distance/:unit
//@access   Private

exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipCode, distance, unit = "mi" } = req.params;

  // Get lat long from geocoder
  const loc = await geocoder.geocode(zipCode);

  const { latitude, longitude } = loc[0];

  //calc radius using radians
  // Divide distance by radius of the Earch
  // Earth radius = 3,963 mi/ 6,378 km
  let radius = null;
  if (unit === "mi") {
    radius = distance / 3963;
  } else {
    radius = distance / 6378;
  }

  // Get bootcamp
  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

//@dec      Upload photo for bootcamp
//@route    PUT api/v1/bootcamps/photo
//@access   Public

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
    return;
  }

  if (
    updatedBootcamp.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(`User is not authorized to update this bootcamp.`, 401)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Check for image file
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload a valid image`, 400));
  }

  // Check for file size
  if (file.size > process.env.UPLOAD_LIMIT) {
    return next(
      new ErrorResponse(
        `Please upload a image less than ${process.env.UPLOAD_LIMIT}`,
        400
      )
    );
  }

  // Add custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log("photo upload error", err);
      return next(new ErrorResponse(`Problem with file upload!`, 500));
    }
  });

  await Bootcamp.findByIdAndUpdate(req.params.id, { photot: file.name });

  res.status(200).json({
    success: true,
    data: file.name,
  });
});
