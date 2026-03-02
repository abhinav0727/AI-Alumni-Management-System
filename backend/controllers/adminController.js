const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Block user
exports.blockUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    await User.updateOne({ _id: userId }, { isBlocked: true });
    await AuditLog.create({
      action: 'BLOCKED',
      performedBy: req.user.id,
      affectedUser: userId
    });
    res.json({ blocked: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
