const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  durationYears: { type: Number, required: true },
  degreeType: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
