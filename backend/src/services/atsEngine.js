// ATS Scoring Engine — keyword matching with synonyms, section analysis, format scoring

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','are','was','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'shall','can','need','dare','ought','used','about','above','after',
  'before','between','during','into','through','we','our','you','your',
  'they','their','it','its','this','that','these','those','as','not',
  'if','so','yet','both','either','neither','whether','while','also',
  'just','than','then','when','where','which','who','whom','whose',
  'work','worked','working','use','using','used','make','making','made',
  'help','helped','helping','other','others','within','across','over',
  'under','up','out','off','one','two','three','per','etc','including'
]);

// Synonym clusters: matching any word in a cluster counts as matching all
const SYNONYM_CLUSTERS = [
  ['led','managed','directed','headed','oversaw','supervised','spearheaded'],
  ['built','developed','created','engineered','implemented','designed','architected'],
  ['improved','enhanced','optimized','increased','boosted','accelerated','streamlined'],
  ['reduced','decreased','cut','lowered','minimized','eliminated'],
  ['collaborated','partnered','worked with','cooperated','coordinated'],
  ['responsible for','in charge of','accountable for','owned'],
  ['javascript','js'],
  ['typescript','ts'],
  ['python','py'],
  ['machine learning','ml'],
  ['artificial intelligence','ai'],
  ['user interface','ui'],
  ['user experience','ux'],
  ['application programming interface','api'],
  ['continuous integration','ci'],
  ['continuous deployment','cd'],
  ['database','db'],
  ['kubernetes','k8s'],
  ['amazon web services','aws'],
  ['google cloud platform','gcp'],
  ['microsoft azure','azure'],
  ['react','reactjs','react.js'],
  ['node','nodejs','node.js'],
  ['postgresql','postgres'],
  ['mongodb','mongo'],
  ['developed','created','built','coded','programmed','wrote'],
  ['analysed','analyzed','researched','investigated','evaluated'],
  ['presented','communicated','delivered','conveyed'],
  ['agile','scrum','kanban','sprint'],
  ['devops','site reliability','sre'],
  ['frontend','front-end','front end','client-side'],
  ['backend','back-end','back end','server-side'],
  ['fullstack','full-stack','full stack'],
];

// Build a map from each word → canonical cluster index
const SYNONYM_MAP = new Map();
SYNONYM_CLUSTERS.forEach((cluster, idx) => {
  cluster.forEach(term => SYNONYM_MAP.set(term.toLowerCase(), idx));
});

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function extractBigrams(tokens) {
  const bigrams = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
}

// Simple suffix stemmer (handles common English inflections)
function stem(word) {
  if (word.length < 5) return word;
  if (word.endsWith('ing')) return word.slice(0, -3);
  if (word.endsWith('tion') || word.endsWith('sion')) return word.slice(0, -3);
  if (word.endsWith('ed')) return word.slice(0, -2);
  if (word.endsWith('er') || word.endsWith('ly')) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

function clusterOf(term) {
  return SYNONYM_MAP.get(term) ?? SYNONYM_MAP.get(stem(term)) ?? null;
}

function getFrequencyMap(tokens) {
  const map = {};
  for (const t of tokens) map[t] = (map[t] || 0) + 1;
  return map;
}

function extractKeywords(text, topN = 50) {
  const tokens = tokenize(text);
  const bigrams = extractBigrams(tokens);
  const all = [...tokens, ...bigrams];
  const freq = getFrequencyMap(all);
  return Object.entries(freq)
    .sort((a, b) => {
      // Boost multi-word terms and tech terms
      const aBoost = a[0].includes(' ') ? 1.4 : 1;
      const bBoost = b[0].includes(' ') ? 1.4 : 1;
      return b[1] * bBoost - a[1] * aBoost;
    })
    .slice(0, topN)
    .map(([word]) => word);
}

function buildCVTokenSet(cv) {
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
  const fullText = parts.filter(Boolean).join(' ');
  const tokens = tokenize(fullText);
  const bigrams = extractBigrams(tokens);
  return {
    exact: new Set([...tokens, ...bigrams]),
    stemmed: new Set([...tokens.map(stem), ...bigrams]),
    clusters: new Set(tokens.map(t => clusterOf(t)).filter(c => c !== null))
  };
}

function scoreKeywords(cvSets, jdText) {
  const jdKeywords = extractKeywords(jdText, 50);
  const matched = [];
  const missing = [];

  for (const kw of jdKeywords) {
    const kwTokens = tokenize(kw);
    const kwStemmed = kwTokens.map(stem).join(' ');
    const kwCluster = clusterOf(kw) ?? (kwTokens.length === 1 ? clusterOf(kwTokens[0]) : null);

    const isMatch =
      cvSets.exact.has(kw) ||
      cvSets.stemmed.has(kwStemmed) ||
      (kwCluster !== null && cvSets.clusters.has(kwCluster));

    if (isMatch) matched.push(kw);
    else missing.push(kw);
  }

  const score = jdKeywords.length > 0 ? (matched.length / jdKeywords.length) * 100 : 0;
  return { score: Math.round(score), matched, missing: missing.slice(0, 15) };
}

function scoreSections(cv) {
  const checks = [
    { name: 'Professional summary',     pass: !!(cv.personalInfo?.summary?.length > 50), weight: 15 },
    { name: 'Work experience',          pass: (cv.workExperiences || []).length > 0,      weight: 25 },
    { name: 'Quantified achievements',  pass: (cv.workExperiences || []).some(w =>
        /\d+%|\$[\d,]+|\d+[kKmM]\b|\d+x|\d+\s+(people|engineers|reports|clients|users|million|thousand|projects)/i.test(w.description)),
      weight: 20 },
    { name: 'Education',                pass: (cv.educations || []).length > 0,           weight: 15 },
    { name: 'Skills section',           pass: (cv.skills || []).length >= 3,              weight: 15 },
    { name: 'Contact info complete',    pass: !!(cv.personalInfo?.email && cv.personalInfo?.phone), weight: 10 },
  ];

  const score = checks.reduce((sum, c) => sum + (c.pass ? c.weight : 0), 0);
  return { score, checks };
}

function scoreFormat(cv) {
  let score = 100;
  const issues = [];

  const pi = cv.personalInfo || {};
  const allText = [
    pi.summary,
    ...(cv.workExperiences || []).map(w => w.description),
    ...(cv.skills || []).map(s => s.name)
  ].filter(Boolean).join(' ');

  if (!pi.email) { score -= 10; issues.push('Missing email address'); }
  if (!pi.phone) { score -= 5;  issues.push('Missing phone number'); }
  if (allText.length < 200) { score -= 20; issues.push('CV content is too sparse'); }

  const allDates = [
    ...(cv.workExperiences || []).flatMap(w => [w.startDate, w.endDate]),
    ...(cv.educations || []).flatMap(e => [e.startDate, e.endDate])
  ].filter(Boolean);

  if (allDates.length === 0 && (cv.workExperiences || []).length > 0) {
    score -= 10;
    issues.push('No dates on work experience (ATS requires dates)');
  }

  if ((cv.skills || []).length < 3) {
    score -= 10;
    issues.push('Too few skills listed');
  }

  if (!pi.linkedin) {
    score -= 5;
    issues.push('Missing LinkedIn URL');
  }

  return { score: Math.max(0, score), issues };
}

function generateSuggestions(cv, jdText, keywordResult, sectionResult) {
  const suggestions = [];

  if (keywordResult.missing.length > 0) {
    const top = keywordResult.missing.slice(0, 5).join(', ');
    suggestions.push(`Add these high-priority keywords from the job description: ${top}`);
  }

  if (!(cv.personalInfo?.summary?.length > 50)) {
    suggestions.push('Add a professional summary (2–3 sentences) tailored to this specific role');
  }

  const hasQuantified = (cv.workExperiences || []).some(w =>
    /\d+%|\$[\d,]+|\d+[kKmM]\b|\d+x|\d+\s+(people|engineers|clients|users|million|thousand)/i.test(w.description)
  );
  if (!hasQuantified) {
    suggestions.push('Quantify your achievements — e.g. "Increased throughput by 40%", "Managed team of 6 engineers"');
  }

  if ((cv.skills || []).length < 8) {
    suggestions.push(`Add more relevant skills — aim for 8–12. Missing from JD: ${keywordResult.missing.slice(0, 3).join(', ')}`);
  }

  if (!cv.personalInfo?.linkedin) {
    suggestions.push('Add your LinkedIn profile URL — many ATS systems and recruiters require it');
  }

  if (cv.personalInfo?.title) {
    const jdTokens = new Set(tokenize(jdText).map(stem));
    const titleTokens = tokenize(cv.personalInfo.title).map(stem);
    const overlap = titleTokens.filter(t => jdTokens.has(t));
    if (overlap.length === 0) {
      suggestions.push('Consider aligning your professional title with the target job title for better ATS matching');
    }
  }

  const hasProjects = (cv.projects || []).length > 0;
  const hasCerts = (cv.certifications || []).length > 0;
  if (!hasProjects && !hasCerts) {
    suggestions.push('Add relevant projects or certifications to strengthen your application');
  }

  return suggestions.slice(0, 6);
}

function scoreCV(cv, jobTitle, jobDescription) {
  const jdText = `${jobTitle} ${jobDescription}`;
  const cvSets = buildCVTokenSet(cv);

  const keywordResult = scoreKeywords(cvSets, jdText);
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
