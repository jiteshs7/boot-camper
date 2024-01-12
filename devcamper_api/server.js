const path = require("path");

const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const expressLimit = require("express-rate-limit");

const errorHandler = require("./middleware/errorHandler");
//Routes
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

const connectDb = require("./config/db");

dotenv.config({ path: "./config/config.env" });

// connect db
connectDb();

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
//Body parser
app.use(express.json());

// File Upload
app.use(fileUpload());

// Sanitize data
app.use(mongoSanitize());

// Add security headers
app.use(helmet());

// Prevent scripting/XSS attacks
app.use(xss());

// Rate limiting
const limiter = expressLimit({
  windowsMS: 10 * 60 * 1000, //10mins
  max: 100,
});

app.use(limiter);
app.use(hpp());

// Enable CORS
app.use(cors());

//Cookie Parser
app.use(cookieParser());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Mount Routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.green
      .underline
  )
);

//Handle unhandled rejections

process.on("unhandledRejection", (err, promise) => {
  console.log(`Unhandled Error: ${err}`.red.bold);

  // close server and exit process

  server.close(() => process.exit(1));
});
