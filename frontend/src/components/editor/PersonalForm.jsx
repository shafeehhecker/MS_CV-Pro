import { useState, useEffect, useRef } from 'react'
import useCVStore from '../../store/cvStore'
import api from '../../utils/api'

export default function PersonalForm({ cv }) {
  const { savePersonal } = useCVStore()
  const pi = cv.personalInfo || {}
  const [form, setForm] = useState({
    fullName: pi.fullName || '',
    email: pi.email || '',
    phone: pi.phone || '',
    location: pi.location || '',
    title: pi.title || '',
    summary: pi.summary || '',
    linkedin: pi.linkedin || '',
    github: pi.github || '',
    website: pi.website || '',
  })
  const timer = useRef(null)

  // Autosave on change
  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value }
    setForm(updated)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => savePersonal(cv.id, updated), 800)
  }

  const [uploading, setUploading] = useState(false)
  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('photo', file)
      const { data } = await api.post('/upload/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      await savePersonal(cv.id, { ...form, photoUrl: data.url })
    } finally { setUploading(false) }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-sm font-semibold text-ink-700">Personal Information</h2>

      {/* Photo */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-ink-100 border-2 border-dashed border-ink-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {pi.photoUrl ? (
            <img src={pi.photoUrl} className="w-full h-full object-cover" alt="" />
          ) : (
            <svg className="w-6 h-6 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          )}
        </div>
        <label className="btn-secondary cursor-pointer text-xs">
          {uploading ? 'Uploading…' : 'Upload photo'}
          <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={uploading} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Full name</label>
          <input className="input" value={form.fullName} onChange={e => handleChange('fullName', e.target.value)} placeholder="Jane Smith" />
        </div>
        <div className="col-span-2">
          <label className="label">Professional title</label>
          <input className="input" value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="Senior Software Engineer" />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="jane@example.com" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+44 7700 900000" />
        </div>
        <div className="col-span-2">
          <label className="label">Location</label>
          <input className="input" value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder="London, UK" />
        </div>
        <div className="col-span-2">
          <label className="label">LinkedIn</label>
          <input className="input" value={form.linkedin} onChange={e => handleChange('linkedin', e.target.value)} placeholder="linkedin.com/in/jane-smith" />
        </div>
        <div>
          <label className="label">GitHub</label>
          <input className="input" value={form.github} onChange={e => handleChange('github', e.target.value)} placeholder="github.com/janesmith" />
        </div>
        <div>
          <label className="label">Website</label>
          <input className="input" value={form.website} onChange={e => handleChange('website', e.target.value)} placeholder="janesmith.dev" />
        </div>
      </div>

      <div>
        <label className="label">Professional summary</label>
        <textarea
          className="textarea"
          rows={5}
          value={form.summary}
          onChange={e => handleChange('summary', e.target.value)}
          placeholder="A results-driven engineer with 5+ years experience in…"
        />
        <p className="text-xs text-ink-300 mt-1">{form.summary.length} chars · Aim for 200-400</p>
      </div>
    </div>
  )
}
