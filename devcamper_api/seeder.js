const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

// Load Env vars
dotenv.config({ path: "./config/config.js" });

// Load models

const Bootcamp = require("./models/bootcamps");
const Course = require("./models/courses");
const User = require("./models/User");
const Review = require("./models/reviews");

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {});

// Read JSON files

const bootcamps = fs.readFileSync(
  `${__dirname}/../_data/bootcamps.json`,
  "utf-8"
); // Added file path with it's encoding type
const reviews = fs.readFileSync(`${__dirname}/../_data/reviews.json`, "utf-8"); // Added file path with it's encoding type
const courses = fs.readFileSync(`${__dirname}/../_data/courses.json`, "utf-8"); // Added file path with it's encoding type
const users = fs.readFileSync(`${__dirname}/../_data/users.json`, "utf-8"); // Added file path with it's encoding type

// Import into DB

const importFiles = async () => {
  try {
    await Bootcamp.create(JSON.parse(bootcamps));
    await Course.create(JSON.parse(courses));
    await Review.create(JSON.parse(reviews));
    await User.create(JSON.parse(users));
    console.log("DATA Imported!!".green.inverse);
    process.exit();
  } catch (error) {
    console.log("importFiles() Error", error);
    process.exit();
  }
};

// Delete data
const deleteFiles = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log("DATA deleted!!".red.inverse);
    process.exit();
  } catch (error) {
    console.log("deleteFiles() Error", error);
    process.exit();
  }
};

// We can import and destroy data by using commands like
// node seeder -i to import data
// node seeder -d to destroy data

if (process.argv[2] === "-i") {
  importFiles();
} else if (process.argv[2] === "-d") {
  deleteFiles();
}
