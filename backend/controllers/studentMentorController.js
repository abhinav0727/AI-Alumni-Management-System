const User = require('../models/User');
const AlumniProfile = require('../models/AlumniProfile');

const getAllMentors = async (req, res) => {
  console.log("Mentors route hit");
  try {
    const alumniUsers = await User.find({ role: 'alumni' }).lean();

    const profiles = await AlumniProfile.find({
      user: { $in: alumniUsers.map(u => u._id) }
    }).lean();

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.user.toString()] = p;
    });

    const mentors = alumniUsers.map(user => {
      const profile = profileMap[user._id.toString()];

      return {
        _id: user._id,
        name: user.name || user.fullName || 'Unknown',
        email: user.email,
        company: profile?.company || 'N/A',
        designation: profile?.designation || 'N/A',
        industry: profile?.industry || 'N/A',
        skills: profile?.skills || []
      };
    });

    return res.status(200).json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return res.status(500).json({ message: 'Server error while fetching mentors' });
  }
};

module.exports = { getAllMentors };
