const mongoose = require('mongoose');

const alumniProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  company: { type: String },
  designation: { type: String },
  yearsOfExperience: { type: Number },
  industry: { type: String },
  location: { type: String },
  skills: [{ type: String }],
  isMentorAvailable: { type: Boolean, default: false },
  careerTimeline: [{
    company: String,
    designation: String,
    startYear: Number,
    endYear: Number
  }],
}, { timestamps: true });

module.exports = mongoose.model('AlumniProfile', alumniProfileSchema);
