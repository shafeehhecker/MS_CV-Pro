// PDF Export Service using Puppeteer

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

function buildCleanTemplate(cv) {
  const pi = cv.personalInfo || {};
  const formatDate = (d) => d || '';
  const dateRange = (s, e, cur) => `${formatDate(s)}${s ? ' – ' : ''}${cur ? 'Present' : formatDate(e)}`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Arial', sans-serif; font-size: 10pt; line-height: 1.5; color: #1a1a1a; padding: 28px 32px; }
  h1 { font-size: 22pt; font-weight: 700; letter-spacing: -0.5px; color: #111; }
  .subtitle { font-size: 11pt; color: #555; margin-top: 2px; }
  .contact { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px; font-size: 9pt; color: #444; }
  .contact span { display: flex; align-items: center; gap: 4px; }
  hr.divider { border: none; border-top: 1.5px solid #1a1a1a; margin: 14px 0 10px; }
  hr.thin { border: none; border-top: 0.5px solid #ddd; margin: 8px 0; }
  h2 { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #333; margin-bottom: 8px; }
  .section { margin-bottom: 16px; }
  .entry-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .entry-title { font-weight: 700; font-size: 10.5pt; }
  .entry-sub { font-size: 9.5pt; color: #555; }
  .entry-date { font-size: 9pt; color: #666; text-align: right; white-space: nowrap; }
  .entry-desc { margin-top: 4px; font-size: 9.5pt; color: #333; }
  .entry-desc ul { margin-left: 16px; margin-top: 2px; }
  .entry-desc li { margin-bottom: 2px; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill-tag { background: #f0f0f0; border-radius: 3px; padding: 2px 8px; font-size: 9pt; color: #333; }
  .summary { font-size: 10pt; color: #333; line-height: 1.6; }
  .links { display: flex; gap: 12px; margin-top: 4px; font-size: 9pt; color: #2563eb; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
</style>
</head>
<body>
  <div>
    <h1>${pi.fullName || 'Your Name'}</h1>
    ${pi.title ? `<div class="subtitle">${pi.title}</div>` : ''}
    <div class="contact">
      ${pi.email ? `<span>${pi.email}</span>` : ''}
      ${pi.phone ? `<span>${pi.phone}</span>` : ''}
      ${pi.location ? `<span>${pi.location}</span>` : ''}
    </div>
    ${(pi.linkedin || pi.github || pi.website) ? `
    <div class="links">
      ${pi.linkedin ? `<span>${pi.linkedin}</span>` : ''}
      ${pi.github ? `<span>${pi.github}</span>` : ''}
      ${pi.website ? `<span>${pi.website}</span>` : ''}
    </div>` : ''}
  </div>

  ${pi.summary ? `
  <hr class="divider">
  <div class="section">
    <h2>Professional Summary</h2>
    <div class="summary">${pi.summary}</div>
  </div>` : ''}

  ${cv.workExperiences?.length ? `
  <hr class="divider">
  <div class="section">
    <h2>Work Experience</h2>
    ${cv.workExperiences.map(w => `
    <div style="margin-bottom:10px;">
      <div class="entry-header">
        <div>
          <div class="entry-title">${w.position}</div>
          <div class="entry-sub">${w.company}${w.location ? ` · ${w.location}` : ''}</div>
        </div>
        <div class="entry-date">${dateRange(w.startDate, w.endDate, w.current)}</div>
      </div>
      ${w.description ? `<div class="entry-desc">${w.description.includes('•') || w.description.includes('-') ?
        `<ul>${w.description.split(/\n|•|-/).filter(l => l.trim()).map(l => `<li>${l.trim()}</li>`).join('')}</ul>` :
        w.description
      }</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${cv.educations?.length ? `
  <hr class="divider">
  <div class="section">
    <h2>Education</h2>
    ${cv.educations.map(e => `
    <div style="margin-bottom:8px;">
      <div class="entry-header">
        <div>
          <div class="entry-title">${e.degree}${e.field ? ` in ${e.field}` : ''}</div>
          <div class="entry-sub">${e.institution}${e.gpa ? ` · GPA: ${e.gpa}` : ''}</div>
        </div>
        <div class="entry-date">${dateRange(e.startDate, e.endDate, false)}</div>
      </div>
      ${e.description ? `<div class="entry-desc">${e.description}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${cv.skills?.length ? `
  <hr class="divider">
  <div class="section">
    <h2>Skills</h2>
    <div class="skills-grid">
      ${cv.skills.map(s => `<span class="skill-tag">${s.name}</span>`).join('')}
    </div>
  </div>` : ''}

  ${cv.projects?.length ? `
  <hr class="divider">
  <div class="section">
    <h2>Projects</h2>
    ${cv.projects.map(p => `
    <div style="margin-bottom:8px;">
      <div class="entry-header">
        <div>
          <div class="entry-title">${p.name}${p.url ? ` <span style="font-weight:400;font-size:9pt;color:#2563eb">${p.url}</span>` : ''}</div>
          ${p.technologies ? `<div class="entry-sub">${p.technologies}</div>` : ''}
        </div>
        <div class="entry-date">${dateRange(p.startDate, p.endDate, false)}</div>
      </div>
      ${p.description ? `<div class="entry-desc">${p.description}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${cv.certifications?.length ? `
  <hr class="divider">
  <div class="section">
    <h2>Certifications</h2>
    ${cv.certifications.map(c => `
    <div style="margin-bottom:6px;">
      <div class="entry-header">
        <div>
          <div class="entry-title">${c.name}</div>
          <div class="entry-sub">${c.issuer}</div>
        </div>
        ${c.date ? `<div class="entry-date">${c.date}</div>` : ''}
      </div>
    </div>`).join('')}
  </div>` : ''}
</body>
</html>`;
}

async function exportToPDF(cv, outputPath) {
  const html = buildCleanTemplate(cv);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      printBackground: true
    });
  } finally {
    await browser.close();
  }
  return outputPath;
}

module.exports = { exportToPDF, buildCleanTemplate };
