const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');

// Student profile: GET and PUT
exports.getStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Student profile not found' });
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateStudentProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user.id });
    }
    Object.assign(profile, req.body);
    await profile.save();
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Alumni profile: GET and PUT
exports.getAlumniProfile = async (req, res) => {
  try {
    const profile = await AlumniProfile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Alumni profile not found' });
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateAlumniProfile = async (req, res) => {
  try {
    let profile = await AlumniProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new AlumniProfile({ user: req.user.id });
    }
    Object.assign(profile, req.body);
    await profile.save();
    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
