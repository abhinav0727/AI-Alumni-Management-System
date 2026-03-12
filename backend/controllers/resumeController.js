const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const pdfService = require('../services/pdfService');
const nlpService = require('../services/nlpService');
const path = require('path');

// POST /api/resume/upload
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Only PDF files are allowed' });
    }
    
    // Extract text from PDF
    const pdfPath = path.resolve(req.file.path);
    const text = await pdfService.extractTextFromPDF(pdfPath);
    
    // Extract skills using the centralized NLP service
    const extractedSkills = nlpService.extractSkills(text);
    
    let updatedProfile = null;
    let roleMessage = '';

    // Update profile based on user role
    if (req.user.role === 'student') {
      updatedProfile = await StudentProfile.findOneAndUpdate(
        { user: req.user.id },
        { 
          resume: req.file.path, 
          skills: extractedSkills 
        },
        { new: true, upsert: true }
      );
      roleMessage = 'Student resume uploaded and skills extracted';
    } else if (req.user.role === 'alumni') {
      updatedProfile = await AlumniProfile.findOneAndUpdate(
        { user: req.user.id },
        { 
          resume: req.file.path,
          skills: extractedSkills,
          isMentorAvailable: true 
        },
        { new: true, upsert: true }
      );
      roleMessage = 'Alumni resume uploaded and skills extracted';
    } else {
      return res.status(403).json({ message: 'Role not authorized for resume upload' });
    }

    // Optional backwards compatibility: still update base User model
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resumeURL: req.file.path, extractedSkills },
      { new: true }
    ).select('-password');

    res.status(200).json({ 
      message: roleMessage, 
      user,
      profile: updatedProfile
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/resume/skills
exports.getExtractedSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('extractedSkills');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ extractedSkills: user.extractedSkills || [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
