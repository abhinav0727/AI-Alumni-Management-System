const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const { getMentorsRanking } = require('../services/recommendationService');

const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Fetch StudentProfile
    const studentProfile = await StudentProfile.findOne({ user: userId });
    
    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    const studentSkills = studentProfile.skills || [];

    // Edge case handling: If student has no skills, return empty mentor list
    if (studentSkills.length === 0) {
      return res.status(200).json({ mentors: [] });
    }

    // Fetch all AlumniProfile documents where isMentorAvailable = true and skills array is not empty
    const availableAlumni = await AlumniProfile.find({ 
      isMentorAvailable: true,
      skills: { $exists: true, $ne: [] }
    })
      .populate('user', 'name email role');
      
    // Call service to get ranked mentors
    const studentIndustryInterest = studentProfile.industryInterest || null;
    const rankedMentors = getMentorsRanking(studentSkills, availableAlumni, studentIndustryInterest);

    return res.status(200).json({
      mentors: rankedMentors
    });

  } catch (error) {
    console.error('Error fetching mentor recommendations:', error);
    return res.status(500).json({ message: 'Server error while fetching recommendations.' });
  }
};

module.exports = {
  getRecommendations
};
