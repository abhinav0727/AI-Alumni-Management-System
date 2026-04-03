const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    // 'type' maps to what the frontend calls 'category'
    type: {
      type: String,
      enum: ['Academic', 'Professional', 'Technical', 'Research', 'Other'],
      default: 'Professional',
    },
    date: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt auto-generated
  }
);

module.exports = mongoose.model('Achievement', achievementSchema);
