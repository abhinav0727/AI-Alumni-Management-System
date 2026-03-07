const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const Department = require('../models/Department');
const AuditLog = require('../models/AuditLog');

// Utility: Compute academic year (for display only)
function computeAcademicYear(studentProfile, department) {
  const currentYear = new Date().getFullYear();
  if (!studentProfile.graduationYear || !department) return null;
  return department.durationYears - (studentProfile.graduationYear - currentYear);
}

// Utility: Compute eligibility (graduationYear-based)
async function isEligible(studentProfile, user) {
  if (!studentProfile || !user) return false;
  const currentYear = new Date().getFullYear();
  return (
    studentProfile.graduationYear <= currentYear &&
    !studentProfile.hasActiveArrears &&
    user.role === 'student'
  );
}

// 1) GET /api/lifecycle/students
exports.getStudents = async (req, res) => {
  try {
    const filters = {};
    if (req.query.graduationYear) filters.graduationYear = req.query.graduationYear;
    if (req.query.department) filters.department = req.query.department;
    if (req.query.section) filters.section = req.query.section;
    if (req.query.admissionYear) filters.admissionYear = req.query.admissionYear;
    const profiles = await StudentProfile.find(filters).populate('user', 'name email role');
    const result = await Promise.all(profiles.map(async (profile) => {
      const department = await Department.findOne({ name: profile.department });
      const eligible = await isEligible(profile, profile.user);
      // academicYear is for display only
      const academicYear = computeAcademicYear(profile, department);
      return {
        userId: profile.user._id,
        name: profile.user.name,
        academicYear,
        eligible,
        ...profile.toObject()
      };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 2) POST /api/lifecycle/graduate/preview
exports.graduatePreview = async (req, res) => {
  try {
    const { department, section, admissionYear } = req.body;
    const filters = {};
    if (department) filters.department = department;
    if (section) filters.section = section;
    if (admissionYear) filters.admissionYear = admissionYear;
    const profiles = await StudentProfile.find(filters).populate('user', 'name email role');
    const eligibleUsers = [];
    const nonEligibleUsers = [];
    for (const profile of profiles) {
      if (await isEligible(profile, profile.user)) {
        eligibleUsers.push(profile.user._id);
      } else {
        nonEligibleUsers.push(profile.user._id);
      }
    }
    res.json({
      eligibleCount: eligibleUsers.length,
      nonEligibleCount: nonEligibleUsers.length,
      eligibleUserIds: eligibleUsers
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 3) POST /api/lifecycle/graduate/confirm
exports.graduateConfirm = async (req, res) => {
  try {
    const { department, section, admissionYear, confirm } = req.body;
    if (!confirm) return res.status(400).json({ message: 'Confirmation required.' });
    const filters = {};
    if (department) filters.department = department;
    if (section) filters.section = section;
    if (admissionYear) filters.admissionYear = admissionYear;
    const profiles = await StudentProfile.find(filters).populate('user', 'name email role');
    let graduated = 0;
    for (const profile of profiles) {
      if (await isEligible(profile, profile.user)) {
        await User.updateOne({ _id: profile.user._id }, { role: 'alumni' });
        await AlumniProfile.updateOne(
          { user: profile.user._id },
          { isMentorAvailable: false, $set: { isActive: true } },
          { upsert: true }
        );
        await AuditLog.create({
          action: 'GRADUATED',
          performedBy: req.user.id,
          affectedUser: profile.user._id,
          metadata: { department: profile.department, section: profile.section }
        });
        graduated++;
      }
    }
    res.json({ graduated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 4) POST /api/lifecycle/graduate/:userId
exports.graduateSingle = async (req, res) => {
  try {
    const userId = req.params.userId;
    const profile = await StudentProfile.findOne({ user: userId }).populate('user', 'name email role');
    if (!profile || !(await isEligible(profile, profile.user))) {
      return res.status(400).json({ message: 'User not eligible for graduation.' });
    }
    await User.updateOne({ _id: userId }, { role: 'alumni' });
    await AlumniProfile.updateOne(
      { user: userId },
      { isMentorAvailable: false, $set: { isActive: true } },
      { upsert: true }
    );
    await AuditLog.create({
      action: 'GRADUATED',
      performedBy: req.user.id,
      affectedUser: userId,
      metadata: { department: profile.department, section: profile.section }
    });
    res.json({ graduated: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 5) POST /api/lifecycle/revert/:userId
exports.revertGraduation = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user || user.role !== 'alumni') {
      return res.status(404).json({ message: 'Alumni user not found' });
    }
    user.role = 'student';
    await user.save();
    // Remove AlumniProfile
    await require('../models/AlumniProfile').findOneAndDelete({ user: userId });
    // Audit log
    await AuditLog.create({
      action: 'REVERTED',
      performedBy: req.user.id,
      affectedUser: userId
    });
    res.json({ reverted: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
