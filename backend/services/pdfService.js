const fs = require('fs');
const pdfParseModule = require('pdf-parse');

const pdfParse =
  pdfParseModule?.default ||
  pdfParseModule?.pdf ||
  pdfParseModule;

exports.extractTextFromPDF = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text || '';
};
