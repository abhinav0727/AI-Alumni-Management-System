// Predefined skill list (can be expanded)
const SKILL_LIST = [
  'JavaScript', 'Python', 'Java', 'C++', 'Node.js', 'React', 'MongoDB', 'Express', 'SQL', 'HTML', 'CSS',
  'Machine Learning', 'Data Analysis', 'AWS', 'Docker', 'Kubernetes', 'Git', 'REST', 'GraphQL', 'TypeScript'
];

/**
 * Parses text and extracts matched skills based on keyword matching
 * 
 * @param {string} text - The raw text parsed from the resume
 * @returns {Array<string>} An array of detected skill strings
 */
const extractSkills = (text) => {
  if (!text) return [];
  
  const extractedSkills = SKILL_LIST.filter(skill =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
  );

  return extractedSkills;
};

module.exports = {
  extractSkills
};
