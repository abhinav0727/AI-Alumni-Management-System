const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const {
  getStudentProfile,
  updateStudentProfile,
  getAlumniProfile,
  updateAlumniProfile
} = require('../controllers/profileController');

// Student profile routes
router.get('/student/me', protect, roleMiddleware('student'), getStudentProfile);
router.put('/student/me', protect, roleMiddleware('student'), updateStudentProfile);

// Alumni profile routes
router.get('/alumni/me', protect, roleMiddleware('alumni'), getAlumniProfile);
router.put('/alumni/me', protect, roleMiddleware('alumni'), updateAlumniProfile);

module.exports = router;
