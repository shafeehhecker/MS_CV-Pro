import useCVStore from '../../store/cvStore'

function DateRange({ start, end, current }) {
  if (!start && !end) return null
  return <span>{start}{start ? ' – ' : ''}{current ? 'Present' : end}</span>
}

export default function CVPreview({ cv }) {
  const pi = cv?.personalInfo || {}

  return (
    <div className="w-full max-w-[680px] bg-white shadow-lg rounded-sm animate-fade-in" style={{ minHeight: '900px', fontFamily: 'Arial, sans-serif', fontSize: '10pt', lineHeight: 1.5, color: '#1a1a1a' }}>
      <div style={{ padding: '32px 36px' }}>
        {/* Header */}
        <div style={{ marginBottom: '12px' }}>
          <h1 style={{ fontSize: '22pt', fontWeight: 700, margin: 0, color: '#111', letterSpacing: '-0.3px' }}>
            {pi.fullName || <span style={{ color: '#ccc' }}>Your Name</span>}
          </h1>
          {pi.title && <p style={{ margin: '2px 0 0', fontSize: '11pt', color: '#555' }}>{pi.title}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px', fontSize: '9pt', color: '#444' }}>
            {pi.email && <span>{pi.email}</span>}
            {pi.phone && <span>{pi.phone}</span>}
            {pi.location && <span>{pi.location}</span>}
          </div>
          {(pi.linkedin || pi.github || pi.website) && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '9pt', color: '#2563eb' }}>
              {pi.linkedin && <span>{pi.linkedin}</span>}
              {pi.github && <span>{pi.github}</span>}
              {pi.website && <span>{pi.website}</span>}
            </div>
          )}
        </div>

        {pi.summary && (
          <>
            <hr style={{ border: 'none', borderTop: '1.5px solid #1a1a1a', margin: '12px 0 8px' }} />
            <Section title="Professional Summary">
              <p style={{ fontSize: '10pt', color: '#333', lineHeight: 1.6 }}>{pi.summary}</p>
            </Section>
          </>
        )}

        {(cv.workExperiences || []).length > 0 && (
          <>
            <hr style={{ border: 'none', borderTop: '1.5px solid #1a1a1a', margin: '12px 0 8px' }} />
            <Section title="Work Experience">
              {(cv.workExperiences || []).map(w => (
                <div key={w.id} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '10.5pt', margin: 0 }}>{w.position}</p>
                      <p style={{ fontSize: '9.5pt', color: '#555', margin: '1px 0 0' }}>{w.company}{w.location ? ` · ${w.location}` : ''}</p>
                    </div>
                    <p style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      <DateRange start={w.startDate} end={w.endDate} current={w.current} />
                    </p>
                  </div>
                  {w.description && (
                    <div style={{ marginTop: '4px', fontSize: '9.5pt', color: '#333' }}>
                      {w.description.split('\n').filter(l => l.trim()).map((line, i) => (
                        <p key={i} style={{ margin: '1px 0', paddingLeft: line.startsWith('•') || line.startsWith('-') ? '8px' : 0 }}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Section>
          </>
        )}

        {(cv.educations || []).length > 0 && (
          <>
            <hr style={{ border: 'none', borderTop: '1.5px solid #1a1a1a', margin: '12px 0 8px' }} />
            <Section title="Education">
              {(cv.educations || []).map(e => (
                <div key={e.id} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '10.5pt', margin: 0 }}>{e.degree}{e.field ? ` in ${e.field}` : ''}</p>
                      <p style={{ fontSize: '9.5pt', color: '#555', margin: '1px 0 0' }}>{e.institution}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</p>
                    </div>
                    <p style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                      <DateRange start={e.startDate} end={e.endDate} />
                    </p>
                  </div>
                  {e.description && <p style={{ margin: '3px 0 0', fontSize: '9.5pt', color: '#444' }}>{e.description}</p>}
                </div>
              ))}
            </Section>
          </>
        )}

        {(cv.skills || []).length > 0 && (
          <>
            <hr style={{ border: 'none', borderTop: '1.5px solid #1a1a1a', margin: '12px 0 8px' }} />
            <Section title="Skills">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(cv.skills || []).map(s => (
                  <span key={s.id} style={{ background: '#f0f0f0', borderRadius: '3px', padding: '2px 8px', fontSize: '9pt', color: '#333' }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </Section>
          </>
        )}

        {(cv.projects || []).length > 0 && (
          <>
            <hr style={{ border: 'none', borderTop: '1.5px solid #1a1a1a', margin: '12px 0 8px' }} />
            <Section title="Projects">
              {(cv.projects || []).map(p => (
                <div key={p.id} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '10.5pt', margin: 0 }}>{p.name}{p.url ? <span style={{ fontWeight: 400, fontSize: '9pt', color: '#2563eb', marginLeft: '6px' }}>{p.url}</span> : ''}</p>
                      {p.technologies && <p style={{ fontSize: '9.5pt', color: '#555', margin: '1px 0 0' }}>{p.technologies}</p>}
                    </div>
                    {(p.startDate || p.endDate) && (
                      <p style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                        <DateRange start={p.startDate} end={p.endDate} />
                      </p>
                    )}
                  </div>
                  {p.description && <p style={{ margin: '3px 0 0', fontSize: '9.5pt', color: '#333' }}>{p.description}</p>}
                </div>
              ))}
            </Section>
          </>
        )}

        {(cv.certifications || []).length > 0 && (
          <>
            <hr style={{ border: 'none', borderTop: '1.5px solid #1a1a1a', margin: '12px 0 8px' }} />
            <Section title="Certifications">
              {(cv.certifications || []).map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '10pt', margin: 0 }}>{c.name}</p>
                    <p style={{ fontSize: '9.5pt', color: '#555', margin: '1px 0 0' }}>{c.issuer}</p>
                  </div>
                  {c.date && <p style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap', marginLeft: '8px' }}>{c.date}</p>}
                </div>
              ))}
            </Section>
          </>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <h2 style={{ fontSize: '10pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: '#333', margin: '0 0 8px' }}>{title}</h2>
      {children}
    </div>
  )
}
