import { useState } from 'react'
import useCVStore from '../../store/cvStore'
import PersonalForm from './PersonalForm'
import WorkForm from './WorkForm'
import EducationForm from './EducationForm'
import SkillsForm from './SkillsForm'
import ProjectsForm from './ProjectsForm'
import CertificationsForm from './CertificationsForm'

const SECTIONS = [
  { id: 'personal', label: 'Personal Info', icon: '👤' },
  { id: 'work', label: 'Work Experience', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'certifications', label: 'Certifications', icon: '🏆' },
]

export default function EditorPanel({ cv }) {
  const [openSection, setOpenSection] = useState('personal')

  return (
    <div className="flex flex-col h-full">
      {/* Section nav */}
      <div className="flex gap-1 p-3 overflow-x-auto flex-shrink-0 bg-white border-b border-ink-100">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setOpenSection(s.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              openSection === s.id ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'text-ink-500 hover:bg-ink-100'
            }`}
          >
            <span>{s.icon}</span>
            <span className="hidden sm:block">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="flex-1 overflow-y-auto p-4">
        {openSection === 'personal' && <PersonalForm cv={cv} />}
        {openSection === 'work' && <WorkForm cv={cv} />}
        {openSection === 'education' && <EducationForm cv={cv} />}
        {openSection === 'skills' && <SkillsForm cv={cv} />}
        {openSection === 'projects' && <ProjectsForm cv={cv} />}
        {openSection === 'certifications' && <CertificationsForm cv={cv} />}
      </div>
    </div>
  )
}
