const mongoose = require('mongoose');

/**
 * InternalMarks Model
 * Stores internal assessment marks for a student in a course for a given semester.
 * Supports validation to ensure marksObtained <= maxMarks.
 *
 * FIX #3  – semester stored as Number (e.g. 1–8)
 * FIX #7  – marksObtained <= maxMarks enforced via pre-save hook (already present)
 */
const internalMarksSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [12, 'Semester cannot exceed 12'],
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained are required'],
      min: [0, 'Marks cannot be negative'],
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks are required'],
      min: [1, 'Max marks must be at least 1'],
    },
  },
  { timestamps: true }
);

// Business-logic validation: marksObtained must not exceed maxMarks
internalMarksSchema.pre('save', function (next) {
  if (this.marksObtained > this.maxMarks) {
    return next(
      new Error(
        `Marks obtained (${this.marksObtained}) cannot exceed max marks (${this.maxMarks})`
      )
    );
  }
  next();
});

// Compound unique index: one record per student per course per semester
internalMarksSchema.index({ studentId: 1, courseId: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('InternalMarks', internalMarksSchema);
