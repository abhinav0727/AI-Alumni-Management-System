const calculateTFIDF = (documents) => {
  if (documents.length === 0) return [];

  const documentCount = documents.length;
  const df = {};
  
  // Calculate document frequency
  documents.forEach(doc => {
    const uniqueTerms = new Set(doc.map(term => term.toLowerCase().trim()));
    uniqueTerms.forEach(term => {
      if (!term) return;
      df[term] = (df[term] || 0) + 1;
    });
  });

  // Calculate IDF
  const idf = {};
  for (const term in df) {
    idf[term] = Math.log(documentCount / (1 + df[term])) + 1;
  }

  // Calculate TF-IDF
  const tfidfVectors = documents.map(doc => {
    const tfidf = {};
    const termCount = doc.length;
    if (termCount === 0) return tfidf;

    const termFreqs = {};
    doc.forEach(term => {
      const cleanTerm = term.toLowerCase().trim();
      if (!cleanTerm) return;
      termFreqs[cleanTerm] = (termFreqs[cleanTerm] || 0) + 1;
    });

    for (const term in termFreqs) {
      const tf = termFreqs[term] / termCount;
      tfidf[term] = tf * (idf[term] || 0);
    }

    return tfidf;
  });

  return tfidfVectors;
};

const cosineSimilarity = (vecA, vecB) => {
  const allTerms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  allTerms.forEach(term => {
    const valA = vecA[term] || 0;
    const valB = vecB[term] || 0;
    
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  });

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Computes a weighted recommendation score for alumni mentors.
 * 
 * Mentors are ranked using `finalScore`, which is calculated as:
 * finalScore = (0.7 * skillSimilarity) + (0.2 * industryMatchScore) + (0.1 * experienceScore)
 * 
 * @param {Array} studentSkills - Array of student skill strings
 * @param {Array} alumniList - Array of AlumniProfile objects
 * @param {String|null} studentIndustryInterest - The student's intended industry
 * @returns {Array} List of mentor objects sorted by `finalScore` descending
 */
const getMentorsRanking = (studentSkills, alumniList, studentIndustryInterest = null) => {
  if (!studentSkills || studentSkills.length === 0) {
    return alumniList.map(alumni => ({
      alumniId: alumni._id,
      name: alumni.user ? alumni.user.name : 'Unknown',
      company: alumni.company || '',
      skills: alumni.skills || [],
      skillSimilarity: 0,
      industryMatchScore: 0,
      experienceScore: 0,
      finalScore: 0
    }));
  }

  const documents = [
    studentSkills,
    ...alumniList.map(alumni => alumni.skills || [])
  ];

  const tfidfVectors = calculateTFIDF(documents);
  const studentVector = tfidfVectors[0];
  const rankedMentors = [];

  for (let i = 0; i < alumniList.length; i++) {
    const alumni = alumniList[i];
    const alumniVector = tfidfVectors[i + 1];
    
    let skillSimilarity = cosineSimilarity(studentVector, alumniVector);
    if (isNaN(skillSimilarity)) skillSimilarity = 0;

    // Industry Match Score
    let industryMatchScore = 0;
    if (studentIndustryInterest && alumni.industry) {
      if (studentIndustryInterest.toLowerCase().trim() === alumni.industry.toLowerCase().trim()) {
        industryMatchScore = 1;
      }
    }

    // Experience Score
    let experienceScore = 0;
    const exp = alumni.yearsOfExperience;
    if (exp !== undefined && exp !== null) {
      if (exp >= 0 && exp <= 2) experienceScore = 0.4;
      else if (exp >= 3 && exp <= 5) experienceScore = 1.0;
      else if (exp >= 6 && exp <= 10) experienceScore = 0.7;
      else if (exp > 10) experienceScore = 0.5;
    }

    // Final Score
    const finalScore = (0.7 * skillSimilarity) + (0.2 * industryMatchScore) + (0.1 * experienceScore);

    rankedMentors.push({
      alumniId: alumni._id,
      name: alumni.user ? alumni.user.name : 'Unknown',
      company: alumni.company || '',
      skills: alumni.skills || [],
      skillSimilarity: parseFloat(skillSimilarity.toFixed(4)),
      industryMatchScore,
      experienceScore,
      finalScore: parseFloat(finalScore.toFixed(4))
    });
  }

  rankedMentors.sort((a, b) => b.finalScore - a.finalScore);

  return rankedMentors;
};

module.exports = {
  calculateTFIDF,
  cosineSimilarity,
  getMentorsRanking
};
