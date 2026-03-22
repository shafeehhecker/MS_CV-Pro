const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { exportToPDF, buildCleanTemplate } = require('../services/pdfExport');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

const CV_INCLUDE = {
  personalInfo: true,
  workExperiences: { orderBy: { order: 'asc' } },
  educations: { orderBy: { order: 'asc' } },
  skills: { orderBy: { order: 'asc' } },
  projects: { orderBy: { order: 'asc' } },
  certifications: { orderBy: { order: 'asc' } }
};

// Export PDF
router.get('/pdf/:cvId', auth, async (req, res) => {
  try {
    const cv = await prisma.cV.findFirst({
      where: { id: req.params.cvId, userId: req.user.userId },
      include: CV_INCLUDE
    });
    if (!cv) return res.status(404).json({ error: 'CV not found' });

    const filename = `${uuidv4()}.pdf`;
    const outputPath = path.join(__dirname, '../../exports', filename);

    await exportToPDF(cv, outputPath);

    res.download(outputPath, `${cv.personalInfo?.fullName || 'CV'}_${cv.title}.pdf`, (err) => {
      if (!err) {
        const fs = require('fs');
        setTimeout(() => { try { fs.unlinkSync(outputPath); } catch {} }, 30000);
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Preview HTML
router.get('/preview/:cvId', auth, async (req, res) => {
  try {
    const cv = await prisma.cV.findFirst({
      where: { id: req.params.cvId, userId: req.user.userId },
      include: CV_INCLUDE
    });
    if (!cv) return res.status(404).json({ error: 'CV not found' });
    const html = buildCleanTemplate(cv);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (e) { res.status(500).json({ error: 'Preview failed' }); }
});

module.exports = router;
