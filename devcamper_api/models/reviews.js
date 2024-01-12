const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxLength: 100,
      required: [true, "Please add a title."],
    },
    text: {
      type: String,
      required: [true, "Please add a review."],
      maxLength: 3000,
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: [true, "Please add rating between 1 to 10"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: "Bootcamp",
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// User can only add review once per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static method to get average rating
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: {
          $avg: "$rating",
        },
      },
    },
  ]);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating, // To give only even integers
    });
  } catch (error) {
    console.log("bootcamps Model getAverageRating() Error", error);
  }
};

// Get averageRating After save
ReviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

// Get averageRating before deletion
ReviewSchema.pre("deleteOne", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model("Review", ReviewSchema);
