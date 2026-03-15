const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const Job = require('../models/Job');

// Block user
exports.blockUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    await User.updateOne({ _id: userId }, { isBlocked: true });
    await AuditLog.create({
      action: 'BLOCKED',
      performedBy: req.user.id,
      affectedUser: userId
    });
    res.json({ blocked: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalAlumni,
      activeMentors,
      jobsPosted,
      applicationsAggregation,
      graduationTransitions
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'alumni' }),
      AlumniProfile.countDocuments({ isMentorAvailable: true }),
      Job.countDocuments(),
      Job.aggregate([{ $unwind: "$applications" }, { $count: "total" }]),
      AuditLog.countDocuments({ action: 'GRADUATED' })
    ]);

    const applications = applicationsAggregation.length > 0 ? applicationsAggregation[0].total : 0;

    res.status(200).json({
      totalUsers,
      totalStudents,
      totalAlumni,
      activeMentors,
      jobsPosted,
      applications,
      graduationTransitions
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching stats', error: err.message });
  }
};

// GET /api/admin/students
exports.getAllStudents = async (req, res) => {
  try {
    const profiles = await StudentProfile.find()
      .populate('user', '-password');
      
    const students = profiles.filter(
      (s) => s.user && s.user.role === 'student'
    );
      
    res.status(200).json({ students });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching students', error: err.message });
  }
};

// GET /api/admin/students/:id
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await StudentProfile.findOne({ user: id })
      .populate('user', '-password');
    
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    
    if (student.user && student.user.role !== 'student') {
      return res.status(404).json({ message: 'User role mismatch' });
    }
    
    res.status(200).json({ student });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching student', error: err.message });
  }
};

// GET /api/admin/alumni
exports.getAllAlumni = async (req, res) => {
  try {
    const profiles = await AlumniProfile.find()
      .populate('user', '-password');
      
    const alumni = profiles.filter(
      (a) => a.user && a.user.role === 'alumni'
    );
      
    res.status(200).json({ alumni });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching alumni', error: err.message });
  }
};

// GET /api/admin/alumni/:id
exports.getAlumniById = async (req, res) => {
  try {
    const { id } = req.params;
    const alumni = await AlumniProfile.findOne({ user: id })
      .populate('user', '-password');
    
    if (!alumni) return res.status(404).json({ message: 'Alumni profile not found' });
    
    if (alumni.user && alumni.user.role !== 'alumni') {
      return res.status(404).json({ message: 'User role mismatch' });
    }
    
    res.status(200).json({ alumni });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching alumni', error: err.message });
  }
};
