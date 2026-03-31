/**
 * studentRoutes.js
 * Phase 9 – Academic System Integration
 *
 * FIX #1 – Renamed from studentAcademicRoutes.js → studentRoutes.js
 *           (consistent with project naming: adminRoutes, authRoutes, jobRoutes…)
 *
 * All routes are protected + restricted to role 'student'.
 * Students can only READ their own data (controller scopes by req.user._id).
 *
 * Mounted at: /api/student
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const {
  getCourses,
  getAttendance,
  getInternalMarks,
  getMarks,
  getFees,
  getTimetable,
} = require('../controllers/academicController');

// Apply protect + student role gate to all routes in this router
router.use(protect, roleMiddleware('student'));

/**
 * GET /api/student/courses
 * Returns courses matching the student's department (from their profile).
 * Query: ?semester=3  (optional, integer 1-12)
 */
router.get('/courses', getCourses);

/**
 * GET /api/student/attendance
 * Query: ?semester=3  (optional, integer 1-12)
 */
router.get('/attendance', getAttendance);

/**
 * GET /api/student/internal-marks
 * Query: ?semester=3  (optional, integer 1-12)
 */
router.get('/internal-marks', getInternalMarks);

/**
 * GET /api/student/marks
 * Query: ?semester=3  (optional, integer 1-12)
 */
router.get('/marks', getMarks);

/**
 * GET /api/student/fees
 * Query: ?semester=3  (optional, integer 1-12)
 */
router.get('/fees', getFees);

/**
 * GET /api/student/timetable
 * Query: ?semester=3  (optional, integer 1-12)
 */
router.get('/timetable', getTimetable);

module.exports = router;
