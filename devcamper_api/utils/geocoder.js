const dotenv = require("dotenv");
const NodeGeodocder = require("node-geocoder");

//Setting up env configs
dotenv.config({ path: "./config/config.env" });

const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

const geocoder = NodeGeodocder(options);

module.exports = geocoder;
