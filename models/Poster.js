const mongoose = require('mongoose');

const posterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventTime: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  image: {
    type: String, // URL to poster image
    required: true
  },
  category: {
    type: String,
    enum: ['workshop', 'seminar', 'cultural', 'sports', 'competition', 'fest', 'placement', 'other'],
    default: 'other'
  },
  organizer: {
    type: String,
    required: true
  },
  registrationLink: {
    type: String,
    default: null
  },
  contactInfo: {
    email: String,
    phone: String
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Poster', posterSchema);