import { useState, useRef } from 'react'
import useCVStore from '../../store/cvStore'
import { SectionItem, AddButton } from './SectionItem'

function WorkItem({ cvId, item }) {
  const { updateItem, deleteItem } = useCVStore()
  const [form, setForm] = useState({ ...item })
  const timer = useRef(null)

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value }
    setForm(updated)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => updateItem(cvId, 'work', item.id, updated), 800)
  }

  return (
    <SectionItem
      title={form.position || 'New position'}
      subtitle={form.company}
      onDelete={() => deleteItem(cvId, 'work', item.id)}
      defaultOpen={!item.company}
    >
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <label className="label">Job title</label>
            <input className="input" value={form.position} onChange={e => handleChange('position', e.target.value)} placeholder="Software Engineer" />
          </div>
          <div className="col-span-2">
            <label className="label">Company</label>
            <input className="input" value={form.company} onChange={e => handleChange('company', e.target.value)} placeholder="Acme Corp" />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder="London, UK" />
          </div>
          <div />
          <div>
            <label className="label">Start date</label>
            <input className="input" value={form.startDate} onChange={e => handleChange('startDate', e.target.value)} placeholder="Jan 2022" />
          </div>
          <div>
            <label className="label">End date</label>
            <input className="input" value={form.endDate} onChange={e => handleChange('endDate', e.target.value)} placeholder="Dec 2023" disabled={form.current} />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id={`cur-${item.id}`} checked={form.current} onChange={e => handleChange('current', e.target.checked)} className="rounded" />
            <label htmlFor={`cur-${item.id}`} className="text-xs text-ink-500">I currently work here</label>
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="textarea"
            rows={4}
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
            placeholder="• Led a team of 5 engineers to deliver…&#10;• Increased performance by 40% through…&#10;• Implemented CI/CD pipeline reducing deploy time by 60%"
          />
          <p className="text-xs text-ink-300 mt-1">Tip: Start bullet points with • or - and use numbers to quantify impact</p>
        </div>
      </div>
    </SectionItem>
  )
}

export default function WorkForm({ cv }) {
  const { addItem } = useCVStore()

  const handleAdd = () => addItem(cv.id, 'work', {
    company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '', order: 0
  })

  return (
    <div className="space-y-3 animate-fade-in">
      <h2 className="text-sm font-semibold text-ink-700">Work Experience</h2>
      {(cv.workExperiences || []).map(item => (
        <WorkItem key={item.id} cvId={cv.id} item={item} />
      ))}
      <AddButton onClick={handleAdd} label="Add work experience" />
    </div>
  )
}
