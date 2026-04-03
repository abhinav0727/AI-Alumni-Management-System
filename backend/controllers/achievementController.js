const Achievement = require('../models/Achievement');

// ─────────────────────────────────────────────
// @desc    Add a new achievement
// @route   POST /api/alumni/achievements
// @access  Private – alumni only
// ─────────────────────────────────────────────
const addAchievement = async (req, res) => {
  try {
    const { title, description, type, date } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const achievement = await Achievement.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      type: type || 'Professional',
      date: date || null,
    });

    return res.status(201).json({
      message: 'Achievement added successfully.',
      achievement,
    });
  } catch (error) {
    console.error('addAchievement error:', error);
    return res.status(500).json({ message: 'Server error while adding achievement.' });
  }
};

// ─────────────────────────────────────────────
// @desc    Get all achievements for logged-in alumni
// @route   GET /api/alumni/achievements
// @access  Private – alumni only
// ─────────────────────────────────────────────
const getMyAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ user: req.user._id }).sort({
      createdAt: -1, // newest first
    });

    return res.status(200).json({ achievements });
  } catch (error) {
    console.error('getMyAchievements error:', error);
    return res.status(500).json({ message: 'Server error while fetching achievements.' });
  }
};

// ─────────────────────────────────────────────
// @desc    Delete an achievement by ID
// @route   DELETE /api/alumni/achievements/:id
// @access  Private – alumni only (own records only)
// ─────────────────────────────────────────────
const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found.' });
    }

    // Ensure the achievement belongs to the requesting user
    if (achievement.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own achievements.' });
    }

    await achievement.deleteOne();

    return res.status(200).json({ message: 'Achievement deleted successfully.' });
  } catch (error) {
    console.error('deleteAchievement error:', error);
    return res.status(500).json({ message: 'Server error while deleting achievement.' });
  }
};

module.exports = { addAchievement, getMyAchievements, deleteAchievement };
