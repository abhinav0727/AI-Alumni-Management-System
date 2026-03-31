const mongoose = require('mongoose');

/**
 * Timetable Model
 * Stores the weekly class schedule for a student in a given semester.
 * schedule: array of { day, time, courseId }
 */

const VALID_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const scheduleEntrySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: [true, 'Day is required'],
      enum: {
        values: VALID_DAYS,
        message: 'Day must be a valid weekday (Monday–Saturday)',
      },
    },
    time: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true,
      // e.g. "09:00 - 10:00"
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required for each schedule entry'],
    },
  },
  { _id: false }
);

const timetableSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [12, 'Semester cannot exceed 12'],
    },
    schedule: {
      type: [scheduleEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Compound unique index: one timetable per student per semester
timetableSchema.index({ studentId: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
