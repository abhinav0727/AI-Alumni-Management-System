const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const {
  addAchievement,
  getMyAchievements,
  deleteAchievement,
} = require('../controllers/achievementController');
const {
  getMentorshipRequests,
  updateMentorshipStatus,
} = require('../controllers/mentorshipController');

// ─── Achievements ────────────────────────────────────────────────────────────
// POST   /api/alumni/achievements       → add a new achievement
// GET    /api/alumni/achievements       → get all own achievements
// DELETE /api/alumni/achievements/:id  → delete specific achievement
router.post(  '/achievements',     protect, roleMiddleware('alumni'), addAchievement);
router.get(   '/achievements',     protect, roleMiddleware('alumni'), getMyAchievements);
router.delete('/achievements/:id', protect, roleMiddleware('alumni'), deleteAchievement);

// ─── Mentorship ──────────────────────────────────────────────────────────────
router.get('/mentorship', protect, roleMiddleware('alumni'), getMentorshipRequests);
router.put('/mentorship/:id', protect, roleMiddleware('alumni'), updateMentorshipStatus);

// Legacy sample route (kept for backwards compatibility)
router.get('/mentors', protect, roleMiddleware('alumni'), (req, res) => {
  res.json({ message: 'Alumni mentors area', user: req.user });
});

module.exports = router;
