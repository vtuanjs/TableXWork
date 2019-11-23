const mongoose = require("mongoose");

mongoose.set("useFindAndModify", false);
const connect = async () => {
  try {
    let options = {
      connectTimeoutMS: 10000,
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    };
    if (process.env.NODE_ENV === "test") {
      const url = process.env.MONGO_URL; // Change to DB_TEST_URL
      await mongoose.connect(url, options);
    } else {
      const url = process.env.MONGO_URL;
      await mongoose.connect(url, options);
    }

    console.log("Connect database successfully!");
  } catch (error) {
    console.log(`Connect database error: ${error}`);
  }
};

const close = () => {
  return mongoose.disconnect();
};

module.exports = { connect, close };
