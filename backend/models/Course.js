const mongoose = require('mongoose');

/**
 * Course Model
 * Represents an academic course offered in a given semester.
 * Faculty is a reference to a User (typically role: admin or faculty).
 *
 * FIX #3  – semester stored as Number (e.g. 1–8)
 */
const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      trim: true,
      uppercase: true,
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [12, 'Semester cannot exceed 12'],
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [1, 'Credits must be at least 1'],
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Unique constraint: one course code per semester per department
courseSchema.index({ courseCode: 1, semester: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Course', courseSchema);
