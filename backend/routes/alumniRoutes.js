const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

// Sample alumni-only route
router.get('/mentors', protect, roleMiddleware('alumni'), (req, res) => {
  res.json({ message: 'Alumni mentors area', user: req.user });
});

module.exports = router;
