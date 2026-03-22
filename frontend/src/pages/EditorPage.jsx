import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useCVStore from '../store/cvStore'
import EditorPanel from '../components/editor/EditorPanel'
import CVPreview from '../components/preview/CVPreview'
import ATSPanel from '../components/ats/ATSPanel'
import api from '../utils/api'

export default function EditorPage() {
  const { cvId } = useParams()
  const navigate = useNavigate()
  const { currentCV, fetchCV, isLoading, isSaving, lastSaved, updateMeta } = useCVStore()
  const [activeTab, setActiveTab] = useState('edit') // 'edit' | 'preview' | 'ats'
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState('')

  useEffect(() => { fetchCV(cvId) }, [cvId])
  useEffect(() => { if (currentCV) setTitle(currentCV.title) }, [currentCV?.title])

  const handleTitleSave = async () => {
    if (title.trim() && title !== currentCV?.title) {
      await updateMeta(cvId, { title: title.trim() })
    }
    setEditingTitle(false)
  }

  const handleExport = () => {
    window.open(`/api/export/pdf/${cvId}`, '_blank')
  }

  if (isLoading || !currentCV) return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-ink-400">
        <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading editor…</span>
      </div>
    </div>
  )

  return (
    <div className="h-screen flex flex-col bg-ink-100 overflow-hidden">
      {/* Top bar */}
      <header className="bg-white border-b border-ink-100 px-4 py-2.5 flex items-center gap-3 flex-shrink-0 z-30">
        <button onClick={() => navigate('/')} className="btn-ghost px-2 py-1.5 text-ink-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>

        <div className="h-4 w-px bg-ink-100" />

        {/* CV title */}
        {editingTitle ? (
          <input
            className="text-sm font-medium text-ink-800 border-b border-brand-400 outline-none px-0.5 bg-transparent"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') setEditingTitle(false) }}
            autoFocus
          />
        ) : (
          <button className="text-sm font-medium text-ink-700 hover:text-ink-900 flex items-center gap-1.5" onClick={() => setEditingTitle(true)}>
            {currentCV.title}
            <svg className="w-3.5 h-3.5 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
            </svg>
          </button>
        )}

        {/* Save status */}
        <span className="text-xs text-ink-300 ml-1">
          {isSaving ? '• Saving…' : lastSaved ? `• Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
        </span>

        {/* Tabs (desktop) */}
        <div className="hidden md:flex items-center gap-1 ml-auto bg-ink-100 rounded-lg p-0.5">
          {[
            { id: 'edit', label: 'Edit' },
            { id: 'preview', label: 'Preview' },
            { id: 'ats', label: 'ATS Score' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === tab.id ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button onClick={handleExport} className="btn-primary ml-2 hidden sm:flex text-xs px-3 py-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export PDF
        </button>
      </header>

      {/* Mobile tabs */}
      <div className="md:hidden flex bg-white border-b border-ink-100 px-4 gap-4">
        {[
          { id: 'edit', label: 'Edit' },
          { id: 'preview', label: 'Preview' },
          { id: 'ats', label: 'ATS' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-ink-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main content - 3 panes on desktop */}
      <div className="flex-1 overflow-hidden flex">
        {/* Edit panel */}
        <div className={`${activeTab === 'edit' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[380px] flex-shrink-0 border-r border-ink-200 bg-ink-50 overflow-y-auto`}>
          <EditorPanel cv={currentCV} />
        </div>

        {/* Preview panel */}
        <div className={`${activeTab === 'preview' ? 'flex' : 'hidden'} md:flex flex-col flex-1 bg-ink-200 overflow-y-auto items-center py-6 px-4`}>
          <CVPreview cv={currentCV} />
        </div>

        {/* ATS panel */}
        <div className={`${activeTab === 'ats' ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[340px] flex-shrink-0 border-l border-ink-200 bg-ink-50 overflow-y-auto`}>
          <ATSPanel cvId={cvId} />
        </div>
      </div>
    </div>
  )
}
