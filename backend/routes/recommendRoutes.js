const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const recommendController = require('../controllers/recommendController');

// GET /api/recommend/mentors
// Accessible only by students
router.get('/mentors', protect, roleMiddleware('student'), recommendController.getRecommendedMentors);

module.exports = router;
