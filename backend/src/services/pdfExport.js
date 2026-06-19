// PDF Export Service using Puppeteer — supports multiple templates

const puppeteer = require('puppeteer');

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function dateRange(s, e, cur) {
  const start = esc(s) || '';
  const end = cur ? 'Present' : (esc(e) || '');
  if (!start && !end) return '';
  if (!start) return end;
  return `${start} – ${end}`;
}

function descHtml(text) {
  if (!text) return '';
  const safe = esc(text);
  if (text.includes('•') || text.includes('\n-') || text.includes('\n•')) {
    const items = safe.split(/\n|•/).map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean);
    return `<ul>${items.map(l => `<li>${l}</li>`).join('')}</ul>`;
  }
  return `<p>${safe.replace(/\n/g, '<br>')}</p>`;
}

// ─── Template: clean ────────────────────────────────────────────────────────────────────────

function buildCleanTemplate(cv) {
  const pi = cv.personalInfo || {};
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.5; color: #1a1a1a; padding: 28px 32px; }
  h1 { font-size: 22pt; font-weight: 700; letter-spacing: -0.5px; color: #111; }
  .subtitle { font-size: 11pt; color: #555; margin-top: 2px; }
  .contact { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 6px; font-size: 9pt; color: #444; }
  hr.divider { border: none; border-top: 1.5px solid #1a1a1a; margin: 14px 0 10px; }
  h2 { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #333; margin-bottom: 8px; }
  .section { margin-bottom: 16px; }
  .entry-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .entry-title { font-weight: 700; font-size: 10.5pt; }
  .entry-sub { font-size: 9.5pt; color: #555; }
  .entry-date { font-size: 9pt; color: #666; white-space: nowrap; margin-left: 12px; }
  .entry-desc { margin-top: 4px; font-size: 9.5pt; color: #333; }
  .entry-desc ul { margin-left: 16px; margin-top: 2px; }
  .entry-desc li { margin-bottom: 2px; }
  .entry-desc p { margin: 0; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill-tag { background: #f0f0f0; border-radius: 3px; padding: 2px 8px; font-size: 9pt; color: #333; }
  .summary { font-size: 10pt; color: #333; line-height: 1.6; }
  .links { display: flex; gap: 12px; margin-top: 4px; font-size: 9pt; color: #2563eb; }
</style>
</head>
<body>
  <div>
    <h1>${esc(pi.fullName) || 'Your Name'}</h1>
    ${pi.title ? `<div class="subtitle">${esc(pi.title)}</div>` : ''}
    <div class="contact">
      ${pi.email ? `<span>${esc(pi.email)}</span>` : ''}
      ${pi.phone ? `<span>${esc(pi.phone)}</span>` : ''}
      ${pi.location ? `<span>${esc(pi.location)}</span>` : ''}
    </div>
    ${(pi.linkedin || pi.github || pi.website) ? `
    <div class="links">
      ${pi.linkedin ? `<span>${esc(pi.linkedin)}</span>` : ''}
      ${pi.github ? `<span>${esc(pi.github)}</span>` : ''}
      ${pi.website ? `<span>${esc(pi.website)}</span>` : ''}
    </div>` : ''}
  </div>

  ${pi.summary ? `
  <hr class="divider">
  <div class="section">
    <h2>Professional Summary</h2>
    <div class="summary">${esc(pi.summary)}</div>
  </div>` : ''}

  ${cv.workExperiences?.length ? `
  <hr class="divider">
  <div class="section">
    <h2>Work Experience</h2>
    ${cv.workExperiences.map(w => `
    <div style="margin-bottom:10px;">
      <div class="entry-header">
        <div>
          <div class="entry-title">${esc(w.position)}</div>
          <div class="entry-sub">${esc(w.company)}${w.location ? ` · ${esc(w.location)}` : ''}</div>
        </div>
        <div class="entry-date">${dateRange(w.startDate, w.endDate, w.current)}</div>
      </div>
      <div class="entry-desc">${descHtml(w.description)}</div>
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
          <div class="entry-title">${esc(e.degree)}${e.field ? ` in ${esc(e.field)}` : ''}</div>
          <div class="entry-sub">${esc(e.institution)}${e.gpa ? ` · GPA: ${esc(e.gpa)}` : ''}</div>
        </div>
        <div class="entry-date">${dateRange(e.startDate, e.endDate, false)}</div>
      </div>
      ${e.description ? `<div class="entry-desc"><p>${esc(e.description)}</p></div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${cv.skills?.length ? `
  <hr class="divider">
  <div class="section">
    <h2>Skills</h2>
    <div class="skills-grid">
      ${cv.skills.map(s => `<span class="skill-tag">${esc(s.name)}</span>`).join('')}
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
          <div class="entry-title">${esc(p.name)}${p.url ? ` <span style="font-weight:400;font-size:9pt;color:#2563eb">${esc(p.url)}</span>` : ''}</div>
          ${p.technologies ? `<div class="entry-sub">${esc(p.technologies)}</div>` : ''}
        </div>
        <div class="entry-date">${dateRange(p.startDate, p.endDate, false)}</div>
      </div>
      <div class="entry-desc">${descHtml(p.description)}</div>
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
          <div class="entry-title">${esc(c.name)}</div>
          <div class="entry-sub">${esc(c.issuer)}</div>
        </div>
        ${c.date ? `<div class="entry-date">${esc(c.date)}</div>` : ''}
      </div>
    </div>`).join('')}
  </div>` : ''}
</body>
</html>`;
}

// ─── Template: modern ───────────────────────────────────────────────────────────────────────
function buildModernTemplate(cv) {
  const pi = cv.personalInfo || {};
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Arial', sans-serif; font-size: 9.5pt; line-height: 1.5; color: #1a1a1a; display: flex; min-height: 100vh; }
  .sidebar { width: 200px; min-width: 200px; background: #1e3a5f; color: #fff; padding: 28px 16px; }
  .sidebar h1 { font-size: 16pt; font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 4px; }
  .sidebar .role { font-size: 9pt; color: #93c5fd; margin-bottom: 20px; }
  .sidebar-section { margin-bottom: 18px; }
  .sidebar-section h3 { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #93c5fd; border-bottom: 1px solid #2d5a8e; padding-bottom: 4px; margin-bottom: 8px; }
  .sidebar-section p, .sidebar-section a { font-size: 8.5pt; color: #cbd5e1; display: block; margin-bottom: 4px; word-break: break-all; }
  .skill-item { font-size: 8.5pt; color: #e2e8f0; margin-bottom: 6px; }
  .skill-bar { height: 4px; background: #2d5a8e; border-radius: 2px; margin-top: 2px; }
  .skill-fill { height: 4px; background: #60a5fa; border-radius: 2px; }
  .main { flex: 1; padding: 28px 24px; }
  .main h2 { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 3px; margin-bottom: 10px; margin-top: 16px; }
  .main h2:first-child { margin-top: 0; }
  .entry-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; }
  .entry-title { font-weight: 700; font-size: 10pt; }
  .entry-sub { font-size: 9pt; color: #555; }
  .entry-date { font-size: 8.5pt; color: #1e3a5f; white-space: nowrap; margin-left: 8px; font-weight: 600; }
  .entry-desc { font-size: 9pt; color: #333; margin-top: 3px; }
  .entry-desc ul { margin-left: 14px; }
  .entry-desc li { margin-bottom: 1px; }
  .entry-desc p { margin: 0; }
  .entry { margin-bottom: 12px; }
  .summary-text { font-size: 9.5pt; color: #333; line-height: 1.6; }
  .cert-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
</style>
</head>
<body>
  <div class="sidebar">
    <h1>${esc(pi.fullName) || 'Your Name'}</h1>
    ${pi.title ? `<div class="role">${esc(pi.title)}</div>` : ''}

    <div class="sidebar-section">
      <h3>Contact</h3>
      ${pi.email ? `<p>${esc(pi.email)}</p>` : ''}
      ${pi.phone ? `<p>${esc(pi.phone)}</p>` : ''}
      ${pi.location ? `<p>${esc(pi.location)}</p>` : ''}
      ${pi.linkedin ? `<p>${esc(pi.linkedin)}</p>` : ''}
      ${pi.github ? `<p>${esc(pi.github)}</p>` : ''}
      ${pi.website ? `<p>${esc(pi.website)}</p>` : ''}
    </div>

    ${cv.skills?.length ? `
    <div class="sidebar-section">
      <h3>Skills</h3>
      ${cv.skills.map(s => {
        const pct = s.level === 'expert' ? 95 : s.level === 'advanced' ? 80 : s.level === 'intermediate' ? 60 : 40;
        return `<div class="skill-item">
          ${esc(s.name)}
          <div class="skill-bar"><div class="skill-fill" style="width:${pct}%"></div></div>
        </div>`;
      }).join('')}
    </div>` : ''}

    ${cv.certifications?.length ? `
    <div class="sidebar-section">
      <h3>Certifications</h3>
      ${cv.certifications.map(c => `<p><strong style="color:#e2e8f0">${esc(c.name)}</strong><br>${esc(c.issuer)}${c.date ? `<br><span style="color:#93c5fd">${esc(c.date)}</span>` : ''}</p>`).join('')}
    </div>` : ''}
  </div>

  <div class="main">
    ${pi.summary ? `
    <h2>Summary</h2>
    <div class="summary-text">${esc(pi.summary)}</div>` : ''}

    ${cv.workExperiences?.length ? `
    <h2>Experience</h2>
    ${cv.workExperiences.map(w => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <div class="entry-title">${esc(w.position)}</div>
          <div class="entry-sub">${esc(w.company)}${w.location ? ` · ${esc(w.location)}` : ''}</div>
        </div>
        <div class="entry-date">${dateRange(w.startDate, w.endDate, w.current)}</div>
      </div>
      <div class="entry-desc">${descHtml(w.description)}</div>
    </div>`).join('')}` : ''}

    ${cv.educations?.length ? `
    <h2>Education</h2>
    ${cv.educations.map(e => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <div class="entry-title">${esc(e.degree)}${e.field ? ` in ${esc(e.field)}` : ''}</div>
          <div class="entry-sub">${esc(e.institution)}${e.gpa ? ` · GPA: ${esc(e.gpa)}` : ''}</div>
        </div>
        <div class="entry-date">${dateRange(e.startDate, e.endDate, false)}</div>
      </div>
      ${e.description ? `<div class="entry-desc"><p>${esc(e.description)}</p></div>` : ''}
    </div>`).join('')}` : ''}

    ${cv.projects?.length ? `
    <h2>Projects</h2>
    ${cv.projects.map(p => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <div class="entry-title">${esc(p.name)}</div>
          ${p.technologies ? `<div class="entry-sub">${esc(p.technologies)}</div>` : ''}
        </div>
        <div class="entry-date">${dateRange(p.startDate, p.endDate, false)}</div>
      </div>
      <div class="entry-desc">${descHtml(p.description)}</div>
    </div>`).join('')}` : ''}
  </div>
</body>
</html>`;
}

// ─── Template: minimal ──────────────────────────────────────────────────────────────────────
function buildMinimalTemplate(cv) {
  const pi = cv.personalInfo || {};
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, serif; font-size: 10pt; line-height: 1.7; color: #2d2d2d; padding: 36px 40px; }
  .header { border-bottom: 3px double #2d2d2d; padding-bottom: 14px; margin-bottom: 20px; }
  h1 { font-size: 26pt; font-weight: 400; letter-spacing: -1px; color: #111; }
  .role { font-size: 12pt; color: #666; font-style: italic; margin-top: 4px; }
  .contact { font-size: 9pt; color: #555; margin-top: 8px; display: flex; flex-wrap: wrap; gap: 16px; }
  h2 { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 10px; margin-top: 20px; }
  .entry { display: grid; grid-template-columns: 140px 1fr; gap: 12px; margin-bottom: 14px; }
  .entry-meta { font-size: 9pt; color: #888; padding-top: 1px; }
  .entry-date { font-size: 8.5pt; color: #aaa; }
  .entry-title { font-weight: 700; font-size: 10pt; }
  .entry-sub { font-size: 9pt; color: #666; }
  .entry-desc { font-size: 9.5pt; color: #444; margin-top: 3px; }
  .entry-desc ul { margin-left: 14px; }
  .entry-desc li { margin-bottom: 1px; }
  .entry-desc p { margin: 0; }
  .summary { font-size: 10.5pt; color: #333; font-style: italic; line-height: 1.7; margin-bottom: 4px; }
  .skills-line { font-size: 9.5pt; color: #444; }
</style>
</head>
<body>
  <div class="header">
    <h1>${esc(pi.fullName) || 'Your Name'}</h1>
    ${pi.title ? `<div class="role">${esc(pi.title)}</div>` : ''}
    <div class="contact">
      ${pi.email ? `<span>${esc(pi.email)}</span>` : ''}
      ${pi.phone ? `<span>${esc(pi.phone)}</span>` : ''}
      ${pi.location ? `<span>${esc(pi.location)}</span>` : ''}
      ${pi.linkedin ? `<span>${esc(pi.linkedin)}</span>` : ''}
      ${pi.github ? `<span>${esc(pi.github)}</span>` : ''}
      ${pi.website ? `<span>${esc(pi.website)}</span>` : ''}
    </div>
  </div>

  ${pi.summary ? `
  <h2>Profile</h2>
  <div class="summary">${esc(pi.summary)}</div>` : ''}

  ${cv.workExperiences?.length ? `
  <h2>Experience</h2>
  ${cv.workExperiences.map(w => `
  <div class="entry">
    <div class="entry-meta">
      <div class="entry-date">${dateRange(w.startDate, w.endDate, w.current)}</div>
      <div style="margin-top:2px;font-size:9pt;color:#666">${esc(w.company)}</div>
    </div>
    <div>
      <div class="entry-title">${esc(w.position)}</div>
      ${w.location ? `<div class="entry-sub">${esc(w.location)}</div>` : ''}
      <div class="entry-desc">${descHtml(w.description)}</div>
    </div>
  </div>`).join('')}` : ''}

  ${cv.educations?.length ? `
  <h2>Education</h2>
  ${cv.educations.map(e => `
  <div class="entry">
    <div class="entry-meta">
      <div class="entry-date">${dateRange(e.startDate, e.endDate, false)}</div>
      <div style="margin-top:2px;font-size:9pt;color:#666">${esc(e.institution)}</div>
    </div>
    <div>
      <div class="entry-title">${esc(e.degree)}${e.field ? ` in ${esc(e.field)}` : ''}</div>
      ${e.gpa ? `<div class="entry-sub">GPA: ${esc(e.gpa)}</div>` : ''}
      ${e.description ? `<div class="entry-desc"><p>${esc(e.description)}</p></div>` : ''}
    </div>
  </div>`).join('')}` : ''}

  ${cv.skills?.length ? `
  <h2>Skills</h2>
  <div class="skills-line">${cv.skills.map(s => esc(s.name)).join(' · ')}</div>` : ''}

  ${cv.projects?.length ? `
  <h2>Projects</h2>
  ${cv.projects.map(p => `
  <div class="entry">
    <div class="entry-meta">
      <div class="entry-date">${dateRange(p.startDate, p.endDate, false)}</div>
    </div>
    <div>
      <div class="entry-title">${esc(p.name)}${p.url ? ` <span style="font-size:8.5pt;font-weight:400;color:#888">${esc(p.url)}</span>` : ''}</div>
      ${p.technologies ? `<div class="entry-sub">${esc(p.technologies)}</div>` : ''}
      <div class="entry-desc">${descHtml(p.description)}</div>
    </div>
  </div>`).join('')}` : ''}

  ${cv.certifications?.length ? `
  <h2>Certifications</h2>
  ${cv.certifications.map(c => `
  <div class="entry">
    <div class="entry-meta"><div class="entry-date">${esc(c.date)}</div></div>
    <div>
      <div class="entry-title">${esc(c.name)}</div>
      <div class="entry-sub">${esc(c.issuer)}</div>
    </div>
  </div>`).join('')}` : ''}
</body>
</html>`;
}

// ─── Template: executive ────────────────────────────────────────────────────────────────────
function buildExecutiveTemplate(cv) {
  const pi = cv.personalInfo || {};
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 10.5pt; line-height: 1.6; color: #111; padding: 32px 40px; }
  .header { text-align: center; margin-bottom: 18px; }
  h1 { font-size: 22pt; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #000; }
  .role { font-size: 11pt; color: #444; margin-top: 4px; letter-spacing: 1px; }
  .contact { font-size: 9pt; color: #444; margin-top: 6px; }
  .contact span { margin: 0 8px; }
  h2 { font-size: 10pt; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #000; text-align: center; border-top: 2px solid #000; border-bottom: 1px solid #000; padding: 3px 0; margin: 18px 0 10px; }
  .entry { margin-bottom: 12px; }
  .entry-header { display: flex; justify-content: space-between; }
  .entry-title { font-weight: 700; font-size: 10.5pt; }
  .entry-sub { font-style: italic; font-size: 10pt; color: #444; }
  .entry-date { font-size: 9.5pt; color: #555; white-space: nowrap; }
  .entry-desc { font-size: 10pt; color: #222; margin-top: 4px; }
  .entry-desc ul { margin-left: 18px; }
  .entry-desc li { margin-bottom: 2px; }
  .entry-desc p { margin: 0; }
  .summary { font-size: 10.5pt; color: #222; text-align: justify; line-height: 1.7; }
  .skills-text { font-size: 10pt; color: #222; text-align: center; }
</style>
</head>
<body>
  <div class="header">
    <h1>${esc(pi.fullName) || 'Your Name'}</h1>
    ${pi.title ? `<div class="role">${esc(pi.title)}</div>` : ''}
    <div class="contact">
      ${[pi.email, pi.phone, pi.location, pi.linkedin].filter(Boolean).map(v => `<span>${esc(v)}</span>`).join('|')}
    </div>
  </div>

  ${pi.summary ? `
  <h2>Executive Profile</h2>
  <div class="summary">${esc(pi.summary)}</div>` : ''}

  ${cv.workExperiences?.length ? `
  <h2>Professional Experience</h2>
  ${cv.workExperiences.map(w => `
  <div class="entry">
    <div class="entry-header">
      <div>
        <span class="entry-title">${esc(w.position)}</span>
        ${w.company ? ` — <span class="entry-sub">${esc(w.company)}${w.location ? `, ${esc(w.location)}` : ''}</span>` : ''}
      </div>
      <div class="entry-date">${dateRange(w.startDate, w.endDate, w.current)}</div>
    </div>
    <div class="entry-desc">${descHtml(w.description)}</div>
  </div>`).join('')}` : ''}

  ${cv.educations?.length ? `
  <h2>Education</h2>
  ${cv.educations.map(e => `
  <div class="entry">
    <div class="entry-header">
      <div>
        <span class="entry-title">${esc(e.degree)}${e.field ? ` in ${esc(e.field)}` : ''}</span>
        ${e.institution ? ` — <span class="entry-sub">${esc(e.institution)}</span>` : ''}
        ${e.gpa ? ` <span style="font-size:9.5pt;color:#555">· GPA: ${esc(e.gpa)}</span>` : ''}
      </div>
      <div class="entry-date">${dateRange(e.startDate, e.endDate, false)}</div>
    </div>
    ${e.description ? `<div class="entry-desc"><p>${esc(e.description)}</p></div>` : ''}
  </div>`).join('')}` : ''}

  ${cv.skills?.length ? `
  <h2>Core Competencies</h2>
  <div class="skills-text">${cv.skills.map(s => esc(s.name)).join(' &nbsp;·&nbsp; ')}</div>` : ''}

  ${cv.projects?.length ? `
  <h2>Key Projects</h2>
  ${cv.projects.map(p => `
  <div class="entry">
    <div class="entry-header">
      <div>
        <span class="entry-title">${esc(p.name)}</span>
        ${p.technologies ? ` — <span class="entry-sub">${esc(p.technologies)}</span>` : ''}
      </div>
      <div class="entry-date">${dateRange(p.startDate, p.endDate, false)}</div>
    </div>
    <div class="entry-desc">${descHtml(p.description)}</div>
  </div>`).join('')}` : ''}

  ${cv.certifications?.length ? `
  <h2>Certifications &amp; Awards</h2>
  ${cv.certifications.map(c => `
  <div class="entry">
    <div class="entry-header">
      <div>
        <span class="entry-title">${esc(c.name)}</span>
        ${c.issuer ? ` — <span class="entry-sub">${esc(c.issuer)}</span>` : ''}
      </div>
      ${c.date ? `<div class="entry-date">${esc(c.date)}</div>` : ''}
    </div>
  </div>`).join('')}` : ''}
</body>
</html>`;
}

// ─── Template router ──────────────────────────────────────────────────────────────────────────────

function buildTemplate(cv, templateId) {
  switch (templateId) {
    case 'modern':    return buildModernTemplate(cv);
    case 'minimal':   return buildMinimalTemplate(cv);
    case 'executive': return buildExecutiveTemplate(cv);
    default:          return buildCleanTemplate(cv);
  }
}

// ─── PDF export ────────────────────────────────────────────────────────────────────────────────

async function exportToPDF(cv, outputPath) {
  const html = buildTemplate(cv, cv.templateId || 'clean');
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

module.exports = { exportToPDF, buildCleanTemplate, buildTemplate };
