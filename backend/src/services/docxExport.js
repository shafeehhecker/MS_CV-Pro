// DOCX Export Service — ATS-friendly Word document generation

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType
} = require('docx');
const fs = require('fs');

function txt(str) {
  return String(str || '').trim();
}

function dateRange(s, e, cur) {
  const start = txt(s);
  const end = cur ? 'Present' : txt(e);
  if (!start && !end) return '';
  if (!start) return end;
  return `${start} – ${end}`;
}

function sectionHeading(text) {
  return new Paragraph({
    text: text.toUpperCase(),
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: '1a1a1a', space: 4 }
    }
  });
}

function bulletParagraphs(text) {
  if (!text) return [];
  const lines = text.split(/\n|•/).map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean);
  if (lines.length <= 1) {
    return [new Paragraph({ text: txt(text), spacing: { before: 40 } })];
  }
  return lines.map(line => new Paragraph({
    text: line,
    bullet: { level: 0 },
    spacing: { before: 20 }
  }));
}

async function exportToDOCX(cv, outputPath) {
  const pi = cv.personalInfo || {};
  const sections = [];

  // ── Header ────────────────────────────────────────────────────────────────────────
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: txt(pi.fullName) || 'Your Name', bold: true, size: 48 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 }
    })
  );

  if (pi.title) {
    sections.push(new Paragraph({
      children: [new TextRun({ text: txt(pi.title), size: 26, color: '555555' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 }
    }));
  }

  const contactParts = [pi.email, pi.phone, pi.location, pi.linkedin, pi.github, pi.website]
    .filter(Boolean).map(txt);
  if (contactParts.length) {
    sections.push(new Paragraph({
      children: contactParts.flatMap((v, i) => [
        new TextRun({ text: v, size: 18, color: '444444' }),
        ...(i < contactParts.length - 1 ? [new TextRun({ text: '  |  ', size: 18, color: '888888' })] : [])
      ]),
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 }
    }));
  }

  // ── Summary ────────────────────────────────────────────────────────────────────────
  if (pi.summary) {
    sections.push(sectionHeading('Professional Summary'));
    sections.push(new Paragraph({ text: txt(pi.summary), spacing: { after: 80 } }));
  }

  // ── Work Experience ──────────────────────────────────────────────────────────────────────────────
  if (cv.workExperiences?.length) {
    sections.push(sectionHeading('Work Experience'));
    for (const w of cv.workExperiences) {
      sections.push(new Paragraph({
        children: [
          new TextRun({ text: txt(w.position), bold: true, size: 22 }),
          new TextRun({ text: `  —  ${txt(w.company)}${w.location ? `, ${txt(w.location)}` : ''}`, size: 22 }),
          new TextRun({ text: `   ${dateRange(w.startDate, w.endDate, w.current)}`, size: 20, color: '666666', italics: true })
        ],
        spacing: { before: 120, after: 40 }
      }));
      sections.push(...bulletParagraphs(w.description));
    }
  }

  // ── Education ──────────────────────────────────────────────────────────────────────────────
  if (cv.educations?.length) {
    sections.push(sectionHeading('Education'));
    for (const e of cv.educations) {
      sections.push(new Paragraph({
        children: [
          new TextRun({ text: `${txt(e.degree)}${e.field ? ` in ${txt(e.field)}` : ''}`, bold: true, size: 22 }),
          new TextRun({ text: `  —  ${txt(e.institution)}${e.gpa ? `, GPA: ${txt(e.gpa)}` : ''}`, size: 22 }),
          new TextRun({ text: `   ${dateRange(e.startDate, e.endDate, false)}`, size: 20, color: '666666', italics: true })
        ],
        spacing: { before: 120, after: 40 }
      }));
      if (e.description) sections.push(new Paragraph({ text: txt(e.description), spacing: { after: 40 } }));
    }
  }

  // ── Skills ────────────────────────────────────────────────────────────────────────────────
  if (cv.skills?.length) {
    sections.push(sectionHeading('Skills'));
    sections.push(new Paragraph({
      children: [new TextRun({ text: cv.skills.map(s => txt(s.name)).join('  ·  '), size: 20 })],
      spacing: { after: 80 }
    }));
  }

  // ── Projects ────────────────────────────────────────────────────────────────────────────────
  if (cv.projects?.length) {
    sections.push(sectionHeading('Projects'));
    for (const p of cv.projects) {
      sections.push(new Paragraph({
        children: [
          new TextRun({ text: txt(p.name), bold: true, size: 22 }),
          ...(p.technologies ? [new TextRun({ text: `  —  ${txt(p.technologies)}`, size: 20, color: '555555' })] : []),
          ...(p.url ? [new TextRun({ text: `  ${txt(p.url)}`, size: 19, color: '2563eb' })] : []),
          new TextRun({ text: `   ${dateRange(p.startDate, p.endDate, false)}`, size: 20, color: '666666', italics: true })
        ],
        spacing: { before: 120, after: 40 }
      }));
      sections.push(...bulletParagraphs(p.description));
    }
  }

  // ── Certifications ──────────────────────────────────────────────────────────────────────────────
  if (cv.certifications?.length) {
    sections.push(sectionHeading('Certifications'));
    for (const c of cv.certifications) {
      sections.push(new Paragraph({
        children: [
          new TextRun({ text: txt(c.name), bold: true, size: 22 }),
          new TextRun({ text: `  —  ${txt(c.issuer)}`, size: 22 }),
          ...(c.date ? [new TextRun({ text: `   ${txt(c.date)}`, size: 20, color: '666666', italics: true })] : [])
        ],
        spacing: { before: 80, after: 40 }
      }));
    }
  }

  const doc = new Document({
    creator: 'MS CV Pro',
    title: txt(pi.fullName) || 'CV',
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 20 }
        }
      },
      paragraphStyles: [
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          run: { bold: true, size: 22, color: '1a1a1a' }
        }
      ]
    },
    sections: [{ children: sections }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

module.exports = { exportToDOCX };
