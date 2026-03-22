const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { scoreCV } = require('../services/atsEngine');

const prisma = new PrismaClient();

const CV_INCLUDE = {
  personalInfo: true,
  workExperiences: { orderBy: { order: 'asc' } },
  educations: { orderBy: { order: 'asc' } },
  skills: { orderBy: { order: 'asc' } },
  projects: { orderBy: { order: 'asc' } },
  certifications: { orderBy: { order: 'asc' } }
};

router.post('/score/:cvId', auth, async (req, res) => {
  try {
    const { jobTitle, jobDescription } = req.body;
    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({ error: 'Job description must be at least 50 characters' });
    }

    const cv = await prisma.cV.findFirst({
      where: { id: req.params.cvId, userId: req.user.userId },
      include: CV_INCLUDE
    });
    if (!cv) return res.status(404).json({ error: 'CV not found' });

    const result = scoreCV(cv, jobTitle || '', jobDescription);

    const atsScore = await prisma.atsScore.create({
      data: {
        cvId: cv.id,
        jobTitle: jobTitle || 'Unknown',
        jobDescription,
        overallScore: result.overallScore,
        keywordScore: result.keywordScore,
        sectionScore: result.sectionScore,
        formatScore: result.formatScore,
        matchedKeywords: result.matchedKeywords,
        missingKeywords: result.missingKeywords,
        suggestions: result.suggestions
      }
    });

    res.json({ ...atsScore, sectionChecks: result.sectionChecks, formatIssues: result.formatIssues });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'ATS scoring failed' });
  }
});

router.get('/history/:cvId', auth, async (req, res) => {
  try {
    const scores = await prisma.atsScore.findMany({
      where: { cvId: req.params.cvId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    res.json(scores);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch ATS history' }); }
});

module.exports = router;
