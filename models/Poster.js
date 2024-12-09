const mongoose = require('mongoose');
const { connectDb5 } = require("../utils/getConnection");
// MongoDB connection

// News schema
const posterSchema = new mongoose.Schema({
  matter: {
    type: String,
    required: true,
  },
});

const Poster = connectDb5().model('Poster', posterSchema);

// Export both connection function and model
module.exports =  Poster ;
