const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'alumni', 'admin'], default: 'student' },
  graduationYear: { type: Number },
  academicDetails: { type: Object },
  professionalDetails: { type: Object },
  skills: [{ type: String }],
  resumeURL: { type: String },
  extractedSkills: [{ type: String }],
  isMentorAvailable: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true });


// Secure password hashing
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
