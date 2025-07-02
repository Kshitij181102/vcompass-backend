// models/User.js
const mongoose = require("mongoose");
const { connectDb1 } = require("../utils/getConnection"); // Import connectDb1

const userSchema = new mongoose.Schema(
  {
    // Account Details
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, default: "" },
    disId: { type: String, required: true },
    
    // Academic Information
    academicInfo: {
      studentId: { type: String, default: "" },
      program: { type: String, default: "" }, // e.g., B.Tech CSE, MBA, etc.
      department: { type: String, default: "" },
      yearOfStudy: { type: String, default: "" }, // e.g., 1st Year, 2nd Year
      section: { type: String, default: "" }, // Section / Batch
    },
    
    // Profile completion status
    profileCompleted: { type: Boolean, default: false },
    
    // OTP for password reset
    otp: {
      otp: { type: String },
      sendTime: { type: Number },
      token: { type: String },
    },
  },
  { timestamps: true }
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ disId: 1 });

// Create the model with connectDb1 connection
const User = connectDb1().model("User", userSchema);

module.exports = User;