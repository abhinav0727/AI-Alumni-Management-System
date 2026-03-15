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

module.exports = router;
