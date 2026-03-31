const mongoose = require('mongoose');

/**
 * Fee Model
 * Tracks fee payment status for a student in a given semester.
 * status: 'paid' | 'pending' | 'partial'
 */
const feeSchema = new mongoose.Schema(
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
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paidAmount: {
      type: Number,
      required: [true, 'Paid amount is required'],
      min: [0, 'Paid amount cannot be negative'],
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['paid', 'pending', 'partial'],
        message: 'Status must be paid, pending, or partial',
      },
      default: 'pending',
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Business-logic validation: paidAmount must not exceed totalAmount
feeSchema.pre('save', function (next) {
  if (this.paidAmount > this.totalAmount) {
    return next(
      new Error(
        `Paid amount (${this.paidAmount}) cannot exceed total amount (${this.totalAmount})`
      )
    );
  }
  // Auto-derive status from amounts
  if (this.paidAmount === 0) {
    this.status = 'pending';
  } else if (this.paidAmount >= this.totalAmount) {
    this.status = 'paid';
  } else {
    this.status = 'partial';
  }
  next();
});

// Compound unique index: one fee record per student per semester
feeSchema.index({ studentId: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Fee', feeSchema);
