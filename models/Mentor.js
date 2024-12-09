// models/Mentor.js
const mongoose = require('mongoose');
const { connectDb3 } = require("../utils/getConnection");
const mentorSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    shortDes: { type: String, required: true },
    time: { type: String, required: true },
    img: { type: String, required: true },
});


const Mentor = connectDb3().model("Mentor", mentorSchema);
module.exports = Mentor;
