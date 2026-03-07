const User = require('../models/User');
const pdfService = require('../services/pdfService');
const path = require('path');

// Predefined skill list (can be moved to config/db in future)
const SKILL_LIST = [
  'JavaScript', 'Python', 'Java', 'C++', 'Node.js', 'React', 'MongoDB', 'Express', 'SQL', 'HTML', 'CSS',
  'Machine Learning', 'Data Analysis', 'AWS', 'Docker', 'Kubernetes', 'Git', 'REST', 'GraphQL', 'TypeScript'
];

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
    // Basic keyword-based skill extraction
    const extractedSkills = SKILL_LIST.filter(skill =>
      new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
    );
    // Update user document
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resumeURL: req.file.path, extractedSkills },
      { new: true }
    ).select('-password');
    res.status(200).json({ message: 'Resume uploaded and skills extracted', user });
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
