const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  graduationYear: { type: Number },
  department: { type: String },
  section: { type: String },
  admissionYear: { type: Number },
  registerNumber: { type: String },
  hasActiveArrears: { type: Boolean, default: false },
  CGPA: { type: Number },
  projects: [{ type: String }],
  achievements: [{ type: String }],
  skills: [{ type: String }],
  resume: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
