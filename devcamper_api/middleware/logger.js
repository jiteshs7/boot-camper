// @desc used as a custom middleware to log data

const logger = (req, res, next) => {
  console.log(
    `${req.method}--${req.protocol}//${req.get("host")}${req.originalUrl}`
  );
  next();
};

exports = logger;
