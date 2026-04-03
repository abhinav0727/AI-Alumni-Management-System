const MentorshipRequest = require('../models/MentorshipRequest');

// @desc    Create a new mentorship request
// @route   POST /api/student/mentorship
// @access  Private (student)
const createMentorshipRequest = async (req, res) => {
  try {
    const student = req.user.id;
    const { mentorId: mentor, topic } = req.body;

    if (!mentor || !topic) {
      return res.status(400).json({ message: 'Mentor ID and topic are required' });
    }

    // Check for existing pending request with same mentor + student
    const existingRequest = await MentorshipRequest.findOne({
      student,
      mentor,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'A pending request to this mentor already exists' });
    }

    const newRequest = await MentorshipRequest.create({
      student,
      mentor,
      topic,
      status: 'pending'
    });

    return res.status(201).json(newRequest);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all mentorship requests by current student
// @route   GET /api/student/mentorship
// @access  Private (student)
const getMyMentorshipRequests = async (req, res) => {
  try {
    const student = req.user.id;
    const requests = await MentorshipRequest.find({ student }).lean();
    
    // Return map of mentorId -> status
    const statusMap = {};
    requests.forEach(r => {
      statusMap[r.mentor.toString()] = r.status;
    });

    return res.status(200).json(statusMap);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createMentorshipRequest,
  getMyMentorshipRequests
};
