// models/Booking.js
const mongoose = require("mongoose");
const { connectDb2 } = require("../utils/getConnection"); // Import connectDb2

const bookingSchema = new mongoose.Schema(
  {
    mentorId: {
      type: String,
      required: true,
      trim: true,
    },
    menteeId: {
      type: String,
      required: true,
      trim: true,
    },
    scheduleTime: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

bookingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model with connectDb2 connection
const Booking = connectDb2().model("Booking", bookingSchema);

module.exports = Booking;
