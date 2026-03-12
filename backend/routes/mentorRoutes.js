const express = require('express');
const { getRecommendations } = require('../controllers/mentorController');
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get(
  '/recommend',
  protect,
  roleMiddleware('student'),
  getRecommendations
);

module.exports = router;
