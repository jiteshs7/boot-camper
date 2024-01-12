const mongoose = require("mongoose");

const connectDB = async () => {
  const connect = await mongoose.connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  });

  console.log(
    `MongoDb connected ${connect.connection.host}`.cyan.underline.bold
  );
};

module.exports = connectDB;
