const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { 
  blockUser,
  getAdminStats,
  getAllStudents,
  getStudentById,
  getAllAlumni,
  getAlumniById
} = require('../controllers/adminController');

// Phase 9 – Academic System (admin write handlers)
const {
  createCourse,
  updateAttendance,
  updateInternalMarks,
  updateMarks,
  updateFees,
  updateTimetable,
} = require('../controllers/academicController');

// ── Existing Admin Routes (unchanged) ──────────────────────────

// Sample admin-only route
router.get('/dashboard', protect, roleMiddleware('admin'), (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard', user: req.user });
});

// Block user route
router.post('/block/:userId', protect, roleMiddleware('admin'), blockUser);

// Analytics Route
router.get('/stats', protect, roleMiddleware('admin'), getAdminStats);

// User Management Routes
router.get('/students', protect, roleMiddleware('admin'), getAllStudents);
router.get('/students/:id', protect, roleMiddleware('admin'), getStudentById);
router.get('/alumni', protect, roleMiddleware('admin'), getAllAlumni);
router.get('/alumni/:id', protect, roleMiddleware('admin'), getAlumniById);

// ── Phase 9: Academic System Admin Routes ──────────────────────
// All routes below require admin role

/**
 * POST /api/admin/course
 * Create a new course.
 */
router.post('/course', protect, roleMiddleware('admin'), createCourse);

/**
 * POST /api/admin/attendance
 * Create or update attendance for a student in a course + semester.
 */
router.post('/attendance', protect, roleMiddleware('admin'), updateAttendance);

/**
 * POST /api/admin/internal-marks
 * Create or update internal assessment marks.
 */
router.post('/internal-marks', protect, roleMiddleware('admin'), updateInternalMarks);

/**
 * POST /api/admin/marks
 * Create or update semester results (grades + SGPA/CGPA).
 */
router.post('/marks', protect, roleMiddleware('admin'), updateMarks);

/**
 * POST /api/admin/fees
 * Create or update fee payment record.
 */
router.post('/fees', protect, roleMiddleware('admin'), updateFees);

/**
 * POST /api/admin/timetable
 * Create or update a student's weekly timetable.
 */
router.post('/timetable', protect, roleMiddleware('admin'), updateTimetable);

module.exports = router;
