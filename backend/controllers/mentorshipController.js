const MentorshipRequest = require('../models/MentorshipRequest');

const getMentorshipRequests = async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({ mentor: req.user.id })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });
    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const updateMentorshipStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await MentorshipRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Mentorship request not found' });
    }

    if (request.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be updated' });
    }

    request.status = status;
    await request.save();

    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getMentorshipRequests,
  updateMentorshipStatus
};
