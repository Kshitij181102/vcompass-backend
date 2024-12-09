// models/User.js
const mongoose = require("mongoose");
const { connectDb1 } = require("../utils/getConnection"); // Import connectDb1

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    disId: { type: String },
    otp: {
      otp: { type: String },
      sendTime: { type: Number },
      token: { type: String },
    },
  
  },
  { timestamps: true }
);

// Create the model with connectDb1 connection
const User = connectDb1().model("User", userSchema);

module.exports = User;
