const mongoose = require('mongoose');

/**
 * Attendance Model
 * Tracks per-student attendance for a specific course in a semester.
 * studentId must reference a User with role 'student'.
 *
 * FIX #3  – semester stored as Number (e.g. 1–8)
 * FIX #6  – percentage virtual included in JSON/Object output (already set below)
 */
const attendanceSchema = new mongoose.Schema(
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
    totalClasses: {
      type: Number,
      required: [true, 'Total classes are required'],
      min: [0, 'Total classes cannot be negative'],
    },
    attendedClasses: {
      type: Number,
      required: [true, 'Attended classes are required'],
      min: [0, 'Attended classes cannot be negative'],
    },
  },
  { timestamps: true }
);

// Virtual: attendance percentage (not stored, computed on the fly)
attendanceSchema.virtual('percentage').get(function () {
  if (this.totalClasses === 0) return 0;
  return ((this.attendedClasses / this.totalClasses) * 100).toFixed(2);
});

attendanceSchema.set('toJSON', { virtuals: true });
attendanceSchema.set('toObject', { virtuals: true });

// Compound unique index: one attendance record per student per course per semester
attendanceSchema.index({ studentId: 1, courseId: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
