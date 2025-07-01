const mongoose = require('mongoose');
const { connectDb4 } = require("../utils/getConnection");
const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true,
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['academic', 'sports', 'cultural', 'placement', 'announcement', 'general'],
    default: 'general'
  },
  image: {
    type: String, // URL to image
    default: null
  },
  author: {
    type: String,
    required: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  readTime: {
    type: Number, // in minutes
    default: 5
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  }
}, {
  timestamps: true
});
const News = connectDb4().model("News", newsSchema);
module.exports = News;