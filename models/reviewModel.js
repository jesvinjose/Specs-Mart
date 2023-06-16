const mongoose = require('mongoose');
const User = require('./userModel'); // Import the User model

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
