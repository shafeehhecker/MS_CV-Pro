// ATS Scoring Engine - local, no API needed
// Uses keyword matching + section analysis + format scoring

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','are','was','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'shall','can','need','dare','ought','used','about','above','after',
  'before','between','during','into','through','we','our','you','your',
  'they','their','it','its','this','that','these','those','as','not',
  'if','so','yet','both','either','neither','whether','while'
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function extractBigrams(tokens) {
  const bigrams = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i+1]}`);
  }
  return bigrams;
}

function getFrequencyMap(tokens) {
  const map = {};
  for (const t of tokens) {
    map[t] = (map[t] || 0) + 1;
  }
  return map;
}

function extractKeywords(text, topN = 40) {
  const tokens = tokenize(text);
  const bigrams = extractBigrams(tokens);
  const all = [...tokens, ...bigrams];
  const freq = getFrequencyMap(all);

  // TF-IDF-like: boost longer, rarer tokens
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

function buildCVText(cv) {
  const parts = [];
  const pi = cv.personalInfo;
  if (pi) {
    if (pi.title) parts.push(pi.title);
    if (pi.summary) parts.push(pi.summary);
  }
  (cv.workExperiences || []).forEach(w => {
    parts.push(w.position, w.company, w.description);
  });
  (cv.educations || []).forEach(e => {
    parts.push(e.degree, e.field, e.institution, e.description);
  });
  (cv.skills || []).forEach(s => parts.push(s.name));
  (cv.projects || []).forEach(p => {
    parts.push(p.name, p.description, p.technologies);
  });
  (cv.certifications || []).forEach(c => {
    parts.push(c.name, c.issuer);
  });
  return parts.filter(Boolean).join(' ');
}

function scoreKeywords(cvText, jdText) {
  const jdKeywords = extractKeywords(jdText, 50);
  const cvTokens = new Set([...tokenize(cvText), ...extractBigrams(tokenize(cvText))]);

  const matched = [];
  const missing = [];

  for (const kw of jdKeywords) {
    if (cvTokens.has(kw)) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const score = jdKeywords.length > 0 ? (matched.length / jdKeywords.length) * 100 : 0;
  return { score: Math.round(score), matched, missing: missing.slice(0, 15) };
}

function scoreSections(cv) {
  const checks = [
    { name: 'Professional summary', pass: !!(cv.personalInfo?.summary?.length > 50), weight: 15 },
    { name: 'Work experience', pass: (cv.workExperiences || []).length > 0, weight: 25 },
    { name: 'Quantified achievements', pass: (cv.workExperiences || []).some(w => /\d+%|\$\d+|\d+x|\d+ (people|team|million|thousand)/i.test(w.description)), weight: 20 },
    { name: 'Education', pass: (cv.educations || []).length > 0, weight: 15 },
    { name: 'Skills section', pass: (cv.skills || []).length >= 3, weight: 15 },
    { name: 'Contact info complete', pass: !!(cv.personalInfo?.email && cv.personalInfo?.phone), weight: 10 },
  ];

  const passed = checks.filter(c => c.pass);
  const score = passed.reduce((sum, c) => sum + c.weight, 0);
  return { score, checks };
}

function scoreFormat(cv) {
  let score = 100;
  const issues = [];

  const pi = cv.personalInfo || {};
  const cvText = buildCVText(cv);

  // Check for common ATS killers
  if (!pi.email) { score -= 10; issues.push('Missing email address'); }
  if (!pi.phone) { score -= 5; issues.push('Missing phone number'); }
  if (cvText.length < 200) { score -= 20; issues.push('CV content is too sparse'); }

  // Check for date formats
  const allDates = [
    ...(cv.workExperiences || []).flatMap(w => [w.startDate, w.endDate]),
    ...(cv.educations || []).flatMap(e => [e.startDate, e.endDate])
  ].filter(Boolean);

  if (allDates.length === 0 && (cv.workExperiences || []).length > 0) {
    score -= 10;
    issues.push('No dates on work experience (ATS requires dates)');
  }

  return { score: Math.max(0, score), issues };
}

function generateSuggestions(cv, jdText, keywordResult, sectionResult) {
  const suggestions = [];

  if (keywordResult.score < 50) {
    suggestions.push(`Add these high-priority keywords: ${keywordResult.missing.slice(0, 5).join(', ')}`);
  }

  if (!(cv.personalInfo?.summary?.length > 50)) {
    suggestions.push('Add a professional summary (2-3 sentences tailored to the role)');
  }

  const hasQuantified = (cv.workExperiences || []).some(w =>
    /\d+%|\$\d+|\d+x|\d+ (people|team|million|thousand)/i.test(w.description)
  );
  if (!hasQuantified) {
    suggestions.push('Quantify achievements (e.g., "Increased sales by 30%", "Managed team of 8")');
  }

  if ((cv.skills || []).length < 5) {
    suggestions.push('Add more relevant skills — aim for 8-12 skills');
  }

  if (!cv.personalInfo?.linkedin) {
    suggestions.push('Add your LinkedIn profile URL');
  }

  const jdTokens = tokenize(jdText);
  const titleWords = jdTokens.slice(0, 10);
  if (cv.personalInfo?.title) {
    const titleMatch = titleWords.some(w => cv.personalInfo.title.toLowerCase().includes(w));
    if (!titleMatch) {
      suggestions.push('Consider aligning your job title with the target role title');
    }
  }

  return suggestions.slice(0, 6);
}

function scoreCV(cv, jobTitle, jobDescription) {
  const cvText = buildCVText(cv);
  const jdText = `${jobTitle} ${jobDescription}`;

  const keywordResult = scoreKeywords(cvText, jdText);
  const sectionResult = scoreSections(cv);
  const formatResult = scoreFormat(cv);
  const suggestions = generateSuggestions(cv, jdText, keywordResult, sectionResult);

  const overallScore = Math.round(
    keywordResult.score * 0.45 +
    sectionResult.score * 0.35 +
    formatResult.score * 0.20
  );

  return {
    overallScore,
    keywordScore: keywordResult.score,
    sectionScore: sectionResult.score,
    formatScore: formatResult.score,
    matchedKeywords: keywordResult.matched.slice(0, 20),
    missingKeywords: keywordResult.missing,
    suggestions,
    sectionChecks: sectionResult.checks,
    formatIssues: formatResult.issues
  };
}

module.exports = { scoreCV, extractKeywords };
