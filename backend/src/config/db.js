const mongoose = require("mongoose");

async function connectDB(connectionString) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(connectionString, {
    autoIndex: true,
  });
  console.log("MongoDB connected");
}

module.exports = connectDB;
