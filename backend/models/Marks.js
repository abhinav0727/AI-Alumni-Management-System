const mongoose = require('mongoose');

/**
 * Marks (Grades) Model
 * Stores semester-wise results for a student.
 * subjects: array of { courseId, grade, credits }
 * sgpa: computed for this semester
 * cgpa: running cumulative GPA stored by admin
 */

// Grade point map (10-point scale)
const GRADE_POINTS = {
  O: 10,
  'A+': 9,
  A: 8,
  'B+': 7,
  B: 6,
  C: 5,
  RA: 0, // Re-Appear (arrear)
  AB: 0, // Absent
};

const subjectSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    grade: {
      type: String,
      required: true,
      enum: {
        values: Object.keys(GRADE_POINTS),
        message: 'Invalid grade value',
      },
    },
    credits: {
      type: Number,
      required: true,
      min: [1, 'Credits must be at least 1'],
    },
  },
  { _id: false }
);

const marksSchema = new mongoose.Schema(
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
    subjects: {
      type: [subjectSchema],
      default: [],
    },
    sgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    cgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
  },
  { timestamps: true }
);

/**
 * Auto-compute SGPA before saving.
 * SGPA = Σ(grade_point × credits) / Σ(credits)
 */
marksSchema.pre('save', function (next) {
  if (this.subjects && this.subjects.length > 0) {
    let totalWeightedPoints = 0;
    let totalCredits = 0;
    for (const subj of this.subjects) {
      const gp = GRADE_POINTS[subj.grade] ?? 0;
      totalWeightedPoints += gp * subj.credits;
      totalCredits += subj.credits;
    }
    this.sgpa =
      totalCredits > 0
        ? parseFloat((totalWeightedPoints / totalCredits).toFixed(2))
        : 0;
  }
  next();
});

// Compound unique index: one result record per student per semester
marksSchema.index({ studentId: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Marks', marksSchema);
