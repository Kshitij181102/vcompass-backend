const mongoose = require('mongoose');
const { connectDb4 } = require("../utils/getConnection");
// MongoDB connection

// News schema
const newsSchema = new mongoose.Schema({
  matter: {
    type: String,
    required: true,
  },
});

const News = connectDb4().model('News', newsSchema);

// Export both connection function and model
module.exports =  News ;
