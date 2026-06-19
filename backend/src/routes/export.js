const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { exportToPDF, buildTemplate } = require('../services/pdfExport');
const { exportToDOCX } = require('../services/docxExport');
const path = require('path');
const fs = require('fs');
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

function cvFileName(cv, ext) {
  const name = (cv.personalInfo?.fullName || 'CV').replace(/[^a-z0-9]/gi, '_');
  const title = (cv.title || 'CV').replace(/[^a-z0-9]/gi, '_');
  return `${name}_${title}.${ext}`;
}

// Export PDF
router.get('/pdf/:cvId', auth, async (req, res) => {
  let outputPath = null;
  try {
    const cv = await prisma.cV.findFirst({
      where: { id: req.params.cvId, userId: req.user.userId },
      include: CV_INCLUDE
    });
    if (!cv) return res.status(404).json({ error: 'CV not found' });

    outputPath = path.join(__dirname, '../../exports', `${uuidv4()}.pdf`);
    await exportToPDF(cv, outputPath);

    res.download(outputPath, cvFileName(cv, 'pdf'), (err) => {
      fs.unlink(outputPath, () => {});
      if (err && !res.headersSent) res.status(500).json({ error: 'Download failed' });
    });
  } catch (e) {
    console.error(e);
    if (outputPath) fs.unlink(outputPath, () => {});
    if (!res.headersSent) res.status(500).json({ error: 'Export failed' });
  }
});

// Export DOCX
router.get('/docx/:cvId', auth, async (req, res) => {
  let outputPath = null;
  try {
    const cv = await prisma.cV.findFirst({
      where: { id: req.params.cvId, userId: req.user.userId },
      include: CV_INCLUDE
    });
    if (!cv) return res.status(404).json({ error: 'CV not found' });

    outputPath = path.join(__dirname, '../../exports', `${uuidv4()}.docx`);
    await exportToDOCX(cv, outputPath);

    res.download(outputPath, cvFileName(cv, 'docx'), (err) => {
      fs.unlink(outputPath, () => {});
      if (err && !res.headersSent) res.status(500).json({ error: 'Download failed' });
    });
  } catch (e) {
    console.error(e);
    if (outputPath) fs.unlink(outputPath, () => {});
    if (!res.headersSent) res.status(500).json({ error: 'DOCX export failed' });
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
    const html = buildTemplate(cv, cv.templateId || 'clean');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (e) { res.status(500).json({ error: 'Preview failed' }); }
});

module.exports = router;
