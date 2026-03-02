const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { blockUser } = require('../controllers/adminController');

// Sample admin-only route
router.get('/dashboard', protect, roleMiddleware('admin'), (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard', user: req.user });
});

// Block user route
router.post('/block/:userId', protect, roleMiddleware('admin'), blockUser);

module.exports = router;
