const mongoose = require('mongoose');
const { connectDb2 } = require("../utils/getConnection"); // Adjust connection as needed

const bookingSchema = new mongoose.Schema({
    mentorId: { type: String, required: true },
    menteeIds: [{ type: String, required: true }], // Array of mentee IDs
    scheduleTime: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    maxMentees: { type: Number, default: 5 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Compound index to ensure unique mentor-time combinations
bookingSchema.index({ mentorId: 1, scheduleTime: 1 }, { unique: true });

// Pre-save middleware to update the updatedAt field
bookingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Booking = connectDb2().model("Booking", bookingSchema);
module.exports = Booking;