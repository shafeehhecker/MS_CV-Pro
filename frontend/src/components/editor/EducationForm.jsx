import { useState, useRef } from 'react'
import useCVStore from '../../store/cvStore'
import { SectionItem, AddButton } from './SectionItem'

// ─── Education ───────────────────────────────────────────────────────────────
function EduItem({ cvId, item }) {
  const { updateItem, deleteItem } = useCVStore()
  const [form, setForm] = useState({ ...item })
  const timer = useRef(null)
  const handleChange = (f, v) => {
    const u = { ...form, [f]: v }
    setForm(u)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => updateItem(cvId, 'education', item.id, u), 800)
  }
  return (
    <SectionItem title={form.degree || 'Degree'} subtitle={form.institution} onDelete={() => deleteItem(cvId, 'education', item.id)} defaultOpen={!item.institution}>
      <div className="space-y-3 pt-2">
        <div><label className="label">Institution</label><input className="input" value={form.institution} onChange={e => handleChange('institution', e.target.value)} placeholder="University of Oxford" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="label">Degree</label><input className="input" value={form.degree} onChange={e => handleChange('degree', e.target.value)} placeholder="BSc" /></div>
          <div><label className="label">Field of study</label><input className="input" value={form.field} onChange={e => handleChange('field', e.target.value)} placeholder="Computer Science" /></div>
          <div><label className="label">Start</label><input className="input" value={form.startDate} onChange={e => handleChange('startDate', e.target.value)} placeholder="Sep 2018" /></div>
          <div><label className="label">End</label><input className="input" value={form.endDate} onChange={e => handleChange('endDate', e.target.value)} placeholder="Jul 2021" /></div>
          <div className="col-span-2"><label className="label">GPA / Grade</label><input className="input" value={form.gpa} onChange={e => handleChange('gpa', e.target.value)} placeholder="First Class / 3.9" /></div>
        </div>
        <div><label className="label">Additional info</label><textarea className="textarea" rows={2} value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Thesis, awards, relevant coursework…" /></div>
      </div>
    </SectionItem>
  )
}

export function EducationForm({ cv }) {
  const { addItem } = useCVStore()
  return (
    <div className="space-y-3 animate-fade-in">
      <h2 className="text-sm font-semibold text-ink-700">Education</h2>
      {(cv.educations || []).map(item => <EduItem key={item.id} cvId={cv.id} item={item} />)}
      <AddButton onClick={() => addItem(cv.id, 'education', { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', description: '', order: 0 })} label="Add education" />
    </div>
  )
}

// ─── Skills ──────────────────────────────────────────────────────────────────
const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert']
const LEVEL_COLORS = { beginner: 'bg-ink-200', intermediate: 'bg-brand-300', advanced: 'bg-brand-500', expert: 'bg-brand-700' }

function SkillRow({ cvId, item }) {
  const { updateItem, deleteItem } = useCVStore()
  const [form, setForm] = useState({ ...item })
  const timer = useRef(null)
  const handleChange = (f, v) => {
    const u = { ...form, [f]: v }
    setForm(u)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => updateItem(cvId, 'skills', item.id, u), 600)
  }
  return (
    <div className="flex items-center gap-2 group">
      <input className="input flex-1 py-1.5 text-sm" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. React, Python…" />
      <select className="input py-1.5 text-xs w-28" value={form.level} onChange={e => handleChange('level', e.target.value)}>
        {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
      </select>
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${LEVEL_COLORS[form.level]}`} />
      <button className="text-ink-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1" onClick={() => deleteItem(cvId, 'skills', item.id)}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  )
}

export function SkillsForm({ cv }) {
  const { addItem } = useCVStore()
  const grouped = (cv.skills || []).reduce((acc, s) => {
    const cat = s.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-sm font-semibold text-ink-700">Skills</h2>
      <p className="text-xs text-ink-400">Add skills individually. ATS scanners prefer plain skill names over progress bars.</p>
      <div className="space-y-2">
        {(cv.skills || []).map(item => <SkillRow key={item.id} cvId={cv.id} item={item} />)}
      </div>
      <AddButton onClick={() => addItem(cv.id, 'skills', { name: '', level: 'intermediate', category: 'Technical', order: 0 })} label="Add skill" />
    </div>
  )
}

// ─── Projects ────────────────────────────────────────────────────────────────
function ProjectItem({ cvId, item }) {
  const { updateItem, deleteItem } = useCVStore()
  const [form, setForm] = useState({ ...item })
  const timer = useRef(null)
  const handleChange = (f, v) => {
    const u = { ...form, [f]: v }
    setForm(u)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => updateItem(cvId, 'projects', item.id, u), 800)
  }
  return (
    <SectionItem title={form.name || 'Project'} subtitle={form.technologies} onDelete={() => deleteItem(cvId, 'projects', item.id)} defaultOpen={!item.name}>
      <div className="space-y-3 pt-2">
        <div><label className="label">Project name</label><input className="input" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Open Source CLI Tool" /></div>
        <div><label className="label">Technologies</label><input className="input" value={form.technologies} onChange={e => handleChange('technologies', e.target.value)} placeholder="Node.js, TypeScript, GitHub Actions" /></div>
        <div><label className="label">URL / Link</label><input className="input" value={form.url} onChange={e => handleChange('url', e.target.value)} placeholder="github.com/you/project" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="label">Start</label><input className="input" value={form.startDate} onChange={e => handleChange('startDate', e.target.value)} placeholder="Mar 2023" /></div>
          <div><label className="label">End</label><input className="input" value={form.endDate} onChange={e => handleChange('endDate', e.target.value)} placeholder="Ongoing" /></div>
        </div>
        <div><label className="label">Description</label><textarea className="textarea" rows={3} value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Built a CLI tool that automates…" /></div>
      </div>
    </SectionItem>
  )
}

export function ProjectsForm({ cv }) {
  const { addItem } = useCVStore()
  return (
    <div className="space-y-3 animate-fade-in">
      <h2 className="text-sm font-semibold text-ink-700">Projects</h2>
      {(cv.projects || []).map(item => <ProjectItem key={item.id} cvId={cv.id} item={item} />)}
      <AddButton onClick={() => addItem(cv.id, 'projects', { name: '', description: '', url: '', technologies: '', startDate: '', endDate: '', order: 0 })} label="Add project" />
    </div>
  )
}

// ─── Certifications ──────────────────────────────────────────────────────────
function CertItem({ cvId, item }) {
  const { updateItem, deleteItem } = useCVStore()
  const [form, setForm] = useState({ ...item })
  const timer = useRef(null)
  const handleChange = (f, v) => {
    const u = { ...form, [f]: v }
    setForm(u)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => updateItem(cvId, 'certifications', item.id, u), 800)
  }
  return (
    <SectionItem title={form.name || 'Certification'} subtitle={form.issuer} onDelete={() => deleteItem(cvId, 'certifications', item.id)} defaultOpen={!item.name}>
      <div className="space-y-3 pt-2">
        <div><label className="label">Name</label><input className="input" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="AWS Solutions Architect" /></div>
        <div><label className="label">Issuer</label><input className="input" value={form.issuer} onChange={e => handleChange('issuer', e.target.value)} placeholder="Amazon Web Services" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="label">Date</label><input className="input" value={form.date} onChange={e => handleChange('date', e.target.value)} placeholder="June 2023" /></div>
          <div><label className="label">Credential URL</label><input className="input" value={form.url} onChange={e => handleChange('url', e.target.value)} placeholder="credly.com/…" /></div>
        </div>
      </div>
    </SectionItem>
  )
}

export function CertificationsForm({ cv }) {
  const { addItem } = useCVStore()
  return (
    <div className="space-y-3 animate-fade-in">
      <h2 className="text-sm font-semibold text-ink-700">Certifications</h2>
      {(cv.certifications || []).map(item => <CertItem key={item.id} cvId={cv.id} item={item} />)}
      <AddButton onClick={() => addItem(cv.id, 'certifications', { name: '', issuer: '', date: '', url: '', order: 0 })} label="Add certification" />
    </div>
  )
}

export default EducationForm
