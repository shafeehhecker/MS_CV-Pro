const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

const CV_INCLUDE = {
  personalInfo: true,
  workExperiences: { orderBy: { order: 'asc' } },
  educations: { orderBy: { order: 'asc' } },
  skills: { orderBy: { order: 'asc' } },
  projects: { orderBy: { order: 'asc' } },
  certifications: { orderBy: { order: 'asc' } },
  atsScores: { orderBy: { createdAt: 'desc' }, take: 5 }
};

// Field whitelists to prevent mass assignment
function pickPersonalInfo(body) {
  const allowed = ['fullName','email','phone','location','title','summary','linkedin','github','website','photoUrl'];
  return Object.fromEntries(allowed.filter(k => k in body).map(k => [k, body[k]]));
}
function pickWork(body) {
  const allowed = ['company','position','location','startDate','endDate','current','description','order'];
  return Object.fromEntries(allowed.filter(k => k in body).map(k => [k, body[k]]));
}
function pickEducation(body) {
  const allowed = ['institution','degree','field','startDate','endDate','gpa','description','order'];
  return Object.fromEntries(allowed.filter(k => k in body).map(k => [k, body[k]]));
}
function pickSkill(body) {
  const allowed = ['name','level','category','order'];
  return Object.fromEntries(allowed.filter(k => k in body).map(k => [k, body[k]]));
}
function pickProject(body) {
  const allowed = ['name','description','url','technologies','startDate','endDate','order'];
  return Object.fromEntries(allowed.filter(k => k in body).map(k => [k, body[k]]));
}
function pickCertification(body) {
  const allowed = ['name','issuer','date','url','order'];
  return Object.fromEntries(allowed.filter(k => k in body).map(k => [k, body[k]]));
}

async function verifyCV(cvId, userId) {
  return prisma.cV.findFirst({ where: { id: cvId, userId }, select: { id: true } });
}

// List all CVs for user
router.get('/', auth, async (req, res) => {
  try {
    const cvs = await prisma.cV.findMany({
      where: { userId: req.user.userId },
      include: { personalInfo: true, atsScores: { take: 1, orderBy: { createdAt: 'desc' } } },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(cvs);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch CVs' }); }
});

// Get single CV
router.get('/:id', auth, async (req, res) => {
  try {
    const cv = await prisma.cV.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
      include: CV_INCLUDE
    });
    if (!cv) return res.status(404).json({ error: 'CV not found' });
    res.json(cv);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch CV' }); }
});

// Get public CV by share token (no auth)
router.get('/share/:token', async (req, res) => {
  try {
    const cv = await prisma.cV.findFirst({
      where: { shareToken: req.params.token, isPublic: true },
      include: CV_INCLUDE
    });
    if (!cv) return res.status(404).json({ error: 'CV not found' });
    res.json(cv);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch CV' }); }
});

// Create CV
router.post('/', auth, async (req, res) => {
  try {
    const { title, templateId } = req.body;
    const cv = await prisma.cV.create({
      data: {
        userId: req.user.userId,
        title: title || 'New CV',
        templateId: templateId || 'clean',
        personalInfo: { create: {} }
      },
      include: CV_INCLUDE
    });
    res.json(cv);
  } catch (e) { res.status(500).json({ error: 'Failed to create CV' }); }
});

// Duplicate CV
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const source = await prisma.cV.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
      include: CV_INCLUDE
    });
    if (!source) return res.status(404).json({ error: 'CV not found' });

    const { personalInfo, workExperiences, educations, skills, projects, certifications, atsScores, id, userId, shareToken, createdAt, updatedAt, ...rest } = source;
    const cv = await prisma.cV.create({
      data: {
        ...rest,
        userId: req.user.userId,
        title: `${source.title} (Copy)`,
        shareToken: null,
        isPublic: false,
        personalInfo: personalInfo ? { create: { ...personalInfo, id: undefined, cvId: undefined } } : { create: {} },
        workExperiences: { create: workExperiences.map(({ id, cvId, ...w }) => w) },
        educations: { create: educations.map(({ id, cvId, ...e }) => e) },
        skills: { create: skills.map(({ id, cvId, ...s }) => s) },
        projects: { create: projects.map(({ id, cvId, ...p }) => p) },
        certifications: { create: certifications.map(({ id, cvId, ...c }) => c) },
      },
      include: CV_INCLUDE
    });
    res.json(cv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to duplicate CV' });
  }
});

// Update CV meta
router.patch('/:id', auth, async (req, res) => {
  try {
    const { title, templateId, isPublic } = req.body;
    const data = {};
    if (title !== undefined) data.title = String(title).slice(0, 200);
    if (templateId !== undefined) data.templateId = String(templateId).slice(0, 50);
    if (isPublic !== undefined) {
      data.isPublic = Boolean(isPublic);
      data.shareToken = isPublic ? uuidv4() : null;
    }
    const cv = await prisma.cV.updateMany({
      where: { id: req.params.id, userId: req.user.userId },
      data
    });
    if (cv.count === 0) return res.status(404).json({ error: 'CV not found' });
    const updated = await prisma.cV.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
      include: CV_INCLUDE
    });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: 'Failed to update CV' }); }
});

// Delete CV
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.cV.deleteMany({ where: { id: req.params.id, userId: req.user.userId } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Failed to delete CV' }); }
});

// Update personal info
router.put('/:id/personal', auth, async (req, res) => {
  try {
    if (!await verifyCV(req.params.id, req.user.userId)) {
      return res.status(404).json({ error: 'CV not found' });
    }
    const data = pickPersonalInfo(req.body);
    const pi = await prisma.personalInfo.upsert({
      where: { cvId: req.params.id },
      update: data,
      create: { cvId: req.params.id, ...data }
    });
    await prisma.cV.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
    res.json(pi);
  } catch (e) { res.status(500).json({ error: 'Failed to update personal info' }); }
});

// Work experience CRUD
router.post('/:id/work', auth, async (req, res) => {
  try {
    if (!await verifyCV(req.params.id, req.user.userId)) {
      return res.status(404).json({ error: 'CV not found' });
    }
    const count = await prisma.workExperience.count({ where: { cvId: req.params.id } });
    const item = await prisma.workExperience.create({
      data: { cvId: req.params.id, ...pickWork(req.body), order: count }
    });
    await prisma.cV.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
    res.json(item);
  } catch (e) { res.status(500).json({ error: 'Failed to add work experience' }); }
});
router.put('/:id/work/:itemId', auth, async (req, res) => {
  try {
    const existing = await prisma.workExperience.findFirst({
      where: { id: req.params.itemId, cv: { userId: req.user.userId } }
    });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    const item = await prisma.workExperience.update({
      where: { id: req.params.itemId }, data: pickWork(req.body)
    });
    await prisma.cV.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
    res.json(item);
  } catch (e) { res.status(500).json({ error: 'Failed to update' }); }
});
router.delete('/:id/work/:itemId', auth, async (req, res) => {
  try {
    const existing = await prisma.workExperience.findFirst({
      where: { id: req.params.itemId, cv: { userId: req.user.userId } }
    });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    await prisma.workExperience.delete({ where: { id: req.params.itemId } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Failed to delete' }); }
});

// Education CRUD
router.post('/:id/education', auth, async (req, res) => {
  try {
    if (!await verifyCV(req.params.id, req.user.userId)) {
      return res.status(404).json({ error: 'CV not found' });
    }
    const count = await prisma.education.count({ where: { cvId: req.params.id } });
    const item = await prisma.education.create({
      data: { cvId: req.params.id, ...pickEducation(req.body), order: count }
    });
    await prisma.cV.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
    res.json(item);
  } catch (e) { res.status(500).json({ error: 'Failed to add education' }); }
});
router.put('/:id/education/:itemId', auth, async (req, res) => {
  try {
    const existing = await prisma.education.findFirst({
      where: { id: req.params.itemId, cv: { userId: req.user.userId } }
    });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    const item = await prisma.education.update({
      where: { id: req.params.itemId }, data: pickEducation(req.body)
    });
    await prisma.cV.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
    res.json(item);
  } catch (e) { res.status(500).json({ error: 'Failed to update' }); }
});
router.delete('/:id/education/:itemId', auth, async (req, res) => {
  try {
    const existing = await prisma.education.findFirst({
      where: { id: req.params.itemId, cv: { userId: req.user.userId } }
    });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    await prisma.education.delete({ where: { id: req.params.itemId } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Failed to delete' }); }
});

// Skills CRUD
router.post('/:id/skills', auth, async (req, res) => {
  try {
    if (!await verifyCV(req.params.id, req.user.userId)) {
      return res.status(404).json({ error: 'CV not found' });
    }
    const count = await prisma.skill.count({ where: { cvId: req.params.id } });
    const item = await prisma.skill.create({
      data: { cvId: req.params.id, ...pickSkill(req.body), order: count }
    });
    await prisma.cV.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
    res.json(item);
  } catch (e) { res.status(500).json({ error: 'Failed to add skill' }); }
});
router.put('/:id/skills/:itemId', auth, async (req, res) => {
  try {
    const existing = await prisma.skill.findFirst({
      where: { id: req.params.itemId, cv: { userId: req.user.userId } }
    });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    const item = await prisma.skill.update({
      where: { id: req.params.itemId }, data: pickSkill(req.body)
    });
    await prisma.cV.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
    res.json(item);
  } catch (e) { res.status(500).json({ error: 'Failed to update' }); }
});
router.delete('/:id/skills/:itemId', auth, async (req, res) => {
  try {
    const existing = await prisma.skill.findFirst({
      where: { id: req.params.itemId, cv: { userId: req.user.userId } }
    });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    await prisma.skill.delete({ where: { id: req.params.itemId } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Failed to delete' }); }
});

// Projects CRUD
router.post('/:id/projects', auth, async (req, res) => {
  try {
    if (!await verifyCV(req.params.id, req.user.userId)) {
      return res.status(404).json({ error: 'CV not found' });
    }
    const count = await prisma.project.count({ where: { cvId: req.params.id } });
    const item = await prisma.project.create({
      data: { cvId: req.params.id, ...pickProject(req.body), order: count }
    });
    await prisma.cV.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
    res.json(item);
  } catch (e) { res.status(500).json({ error: 'Failed to add project' }); }
});
router.put('/:id/projects/:itemId', auth, async (req, res) => {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: req.params.itemId, cv: { userId: req.user.userId } }
    });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    const item = await prisma.project.update({
      where: { id: req.params.itemId }, data: pickProject(req.body)
    });
    await prisma.cV.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
    res.json(item);
  } catch (e) { res.status(500).json({ error: 'Failed to update' }); }
});
router.delete('/:id/projects/:itemId', auth, async (req, res) => {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: req.params.itemId, cv: { userId: req.user.userId } }
    });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    await prisma.project.delete({ where: { id: req.params.itemId } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Failed to delete' }); }
});

// Certifications CRUD
router.post('/:id/certifications', auth, async (req, res) => {
  try {
    if (!await verifyCV(req.params.id, req.user.userId)) {
      return res.status(404).json({ error: 'CV not found' });
    }
    const count = await prisma.certification.count({ where: { cvId: req.params.id } });
    const item = await prisma.certification.create({
      data: { cvId: req.params.id, ...pickCertification(req.body), order: count }
    });
    await prisma.cV.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
    res.json(item);
  } catch (e) { res.status(500).json({ error: 'Failed to add certification' }); }
});
router.put('/:id/certifications/:itemId', auth, async (req, res) => {
  try {
    const existing = await prisma.certification.findFirst({
      where: { id: req.params.itemId, cv: { userId: req.user.userId } }
    });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    const item = await prisma.certification.update({
      where: { id: req.params.itemId }, data: pickCertification(req.body)
    });
    await prisma.cV.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
    res.json(item);
  } catch (e) { res.status(500).json({ error: 'Failed to update' }); }
});
router.delete('/:id/certifications/:itemId', auth, async (req, res) => {
  try {
    const existing = await prisma.certification.findFirst({
      where: { id: req.params.itemId, cv: { userId: req.user.userId } }
    });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    await prisma.certification.delete({ where: { id: req.params.itemId } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Failed to delete' }); }
});

module.exports = router;
