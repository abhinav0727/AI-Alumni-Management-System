/**
 * AI Recommendation Service
 * Computes cosine similarity based on TF-IDF scoring of skills arrays
 */

const preprocess = (skillsArray) => {
  if (!skillsArray || !Array.isArray(skillsArray)) return [];
  // flatten, lowercase, remove punctuation, extract unique distinct alphanumeric words
  const words = skillsArray
    .join(' ')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1);
  return [...new Set(words)]; 
};

// Computes term frequencies for a document
const computeTF = (docTokens) => {
  const tf = {};
  docTokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });
  const total = docTokens.length;
  for (let key in tf) {
    tf[key] = tf[key] / total;
  }
  return tf;
};

// Computes IDF across a collection of documents
const computeIDF = (docs) => {
  const idf = {};
  const N = docs.length;
  docs.forEach(docTokens => {
    const uniqueTokens = new Set(docTokens);
    uniqueTokens.forEach(token => {
      idf[token] = (idf[token] || 0) + 1;
    });
  });
  for (let key in idf) {
    idf[key] = Math.log(N / idf[key]);
  }
  return idf;
};

// Compute cosine similarity between two vectors
const cosineSimilarity = (vecA, vecB) => {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  keys.forEach(key => {
    const valA = vecA[key] || 0;
    const valB = vecB[key] || 0;
    dotProduct += valA * valB;
    magA += valA * valA;
    magB += valB * valB;
  });

  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
};

exports.recommendMentors = (studentSkills, allMentors) => {
  // Preprocess mentor skills into documents
  const mentorDocs = allMentors.map(m => preprocess(m.skills));
  const studentDoc = preprocess(studentSkills);
  
  // Entire corpus = mentors + student
  const corpus = [...mentorDocs, studentDoc];
  const idf = computeIDF(corpus);

  // Vectorize student
  const studentTF = computeTF(studentDoc);
  const studentVector = {};
  for (let token in studentTF) {
    studentVector[token] = studentTF[token] * idf[token];
  }

  // Vectorize mentors and calculate similarities
  const rankedMentors = allMentors.map((mentor, index) => {
    const doc = mentorDocs[index];
    const tf = computeTF(doc);
    const vector = {};
    for (let token in tf) {
      vector[token] = tf[token] * idf[token];
    }
    
    // Similarity bound between 0 and 1, convert to %
    let sim = cosineSimilarity(studentVector, vector);
    if (isNaN(sim)) sim = 0;
    
    return {
      mentor: mentor,
      similarityScore: parseFloat((sim * 100).toFixed(1))
    };
  });

  // Sort descending and return top 5
  return rankedMentors
    .filter(m => m.similarityScore > 0) // Only those with >0 overlap
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 5);
};
