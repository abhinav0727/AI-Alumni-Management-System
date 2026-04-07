const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const User = require('../models/User');
const aiRecommendationService = require('../services/aiRecommendationService');

// @desc    Get top recommended mentors via AI TF-IDF Cosine Similarity
// @route   GET /api/recommend/mentors
// @access  Private (Student)
exports.getRecommendedMentors = async (req, res) => {
  try {
    // 1. Fetch Logged-in student skills
    const studentProfile = await StudentProfile.findOne({ user: req.user.id });
    if (!studentProfile || !studentProfile.skills || studentProfile.skills.length === 0) {
      return res.status(400).json({ 
        message: 'No skills found. Please upload your resume to extract skills before requesting recommendations.' 
      });
    }
    const studentSkills = studentProfile.skills;

    // 2. Fetch all alumni who are available as mentors
    const availableMentorsProfiles = await AlumniProfile.find({ isMentorAvailable: true }).populate('user', 'name email');
    
    if (availableMentorsProfiles.length === 0) {
      return res.status(200).json({ recommendations: [] });
    }

    // 3. Format into a clean structure expected by service layer
    const formattedMentors = availableMentorsProfiles.map(p => ({
      _id: p.user._id,
      name: p.user.name,
      email: p.user.email,
      company: p.company || 'N/A',
      designation: p.designation || 'N/A',
      industry: p.industry || 'N/A',
      skills: p.skills || []
    }));

    // 4. Compute Vectorized Similarity and Rank Top 5
    const recommendations = aiRecommendationService.recommendMentors(studentSkills, formattedMentors);

    // 5. Build final payload
    const responsePayload = recommendations.map(r => ({
      ...r.mentor,
      similarityScore: r.similarityScore
    }));

    return res.status(200).json(responsePayload);
    
  } catch (error) {
    console.error('Recommendation Error:', error);
    return res.status(500).json({ message: 'Server error during mentor recommendation', error: error.message });
  }
};
