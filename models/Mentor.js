// models/Mentor.js
const mongoose = require('mongoose');
const { connectDb3 } = require("../utils/getConnection");

const mentorSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    shortDes: { type: String, required: true },
    time: { type: String, required: true },
    img: { type: String, required: true },
    
    // New fields
    program: { type: String, required: true }, // e.g., "B.Tech CSE"
    department: { type: String, required: true }, // e.g., "Computer Science Engineering"
    yearOfStudy: { type: String, required: true }, // e.g., "3rd Year", "Final Year", "Alumni"
    specialization: [{ type: String }], // Array of specializations like ["DSA", "Web Dev", "Placements"]
    availabilitySlots: [{ type: String }], // Array of time slots like ["Mon 10-11 AM", "Wed 2-3 PM"]
    languagesSpoken: [{ type: String }], // Array like ["English", "Hindi", "Telugu"]
    bio: { type: String, required: true }, // Detailed bio/about me section
    
    // Academic Support Areas (Tags)
    supportAreas: [{ type: String }], // Array like ["Placement Guidance", "Coding Help", "Resume Review"]
    
    // Additional fields for better mentoring
    achievements: [{ type: String }], // Array of achievements
    contactInfo: {
        email: { type: String },
        linkedin: { type: String },
        github: { type: String }
    },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update the updatedAt field
mentorSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Mentor = connectDb3().model("Mentor", mentorSchema);
module.exports = Mentor;