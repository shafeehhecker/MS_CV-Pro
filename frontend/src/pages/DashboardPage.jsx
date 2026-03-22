import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCVStore from '../store/cvStore'
import useAuthStore from '../store/authStore'

function ScoreBadge({ score }) {
  if (!score) return <span className="text-xs text-ink-300">No score yet</span>
  const cls = score >= 70 ? 'score-good' : score >= 45 ? 'score-mid' : 'score-low'
  return <span className={`text-sm font-semibold ${cls}`}>{Math.round(score)}% ATS</span>
}

function CVCard({ cv, onOpen, onDuplicate, onDelete }) {
  const [menu, setMenu] = useState(false)
  const latestScore = cv.atsScores?.[0]?.overallScore

  return (
    <div className="card hover:shadow-md transition-shadow cursor-pointer group relative" onClick={onOpen}>
      {/* Color strip */}
      <div className="h-1.5 rounded-t-xl bg-brand-500 opacity-60" />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-ink-800 truncate">{cv.title}</h3>
            <p className="text-sm text-ink-400 truncate mt-0.5">{cv.personalInfo?.fullName || 'No name set'}</p>
          </div>
          <button
            className="ml-2 p-1.5 rounded-lg text-ink-300 hover:bg-ink-100 hover:text-ink-600 opacity-0 group-hover:opacity-100 transition-all"
            onClick={e => { e.stopPropagation(); setMenu(m => !m) }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
              <circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/>
            </svg>
          </button>
          {menu && (
            <div className="absolute top-10 right-4 bg-white rounded-xl shadow-lg border border-ink-100 py-1.5 z-20 min-w-[140px]" onClick={e => e.stopPropagation()}>
              <button className="w-full text-left px-4 py-2 text-sm text-ink-600 hover:bg-ink-50" onClick={() => { onDuplicate(); setMenu(false) }}>Duplicate</button>
              <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50" onClick={() => { onDelete(); setMenu(false) }}>Delete</button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <ScoreBadge score={latestScore} />
          <span className="text-xs text-ink-300">
            {new Date(cv.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { cvs, fetchCVs, createCV, duplicateCV, deleteCV, isLoading } = useCVStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchCVs() }, [])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const cv = await createCV({ title: 'New CV' })
      navigate(`/editor/${cv.id}`)
    } finally { setCreating(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this CV permanently?')) return
    await deleteCV(id)
  }

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Nav */}
      <nav className="bg-white border-b border-ink-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm leading-none">M</span>
          </div>
          <span className="font-semibold text-ink-800 tracking-tight">MS CV Pro</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-400 hidden sm:block">{user?.name}</span>
          <button onClick={logout} className="btn-ghost text-xs">Sign out</button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-ink-800">My CVs</h1>
            <p className="text-sm text-ink-400 mt-0.5">{cvs.length} {cvs.length === 1 ? 'CV' : 'CVs'} in your workspace</p>
          </div>
          <button className="btn-primary" onClick={handleCreate} disabled={creating}>
            {creating ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
            New CV
          </button>
        </div>

        {/* ATS callout */}
        <div className="bg-gradient-to-r from-brand-50 to-blue-50 border border-brand-100 rounded-xl p-4 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-brand-800">ATS scoring powered locally</p>
            <p className="text-xs text-brand-600 mt-0.5">Open any CV, paste a job description, and get instant keyword analysis — no API keys needed.</p>
          </div>
        </div>

        {/* CV grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="card p-5 animate-pulse h-28 bg-ink-100" />)}
          </div>
        ) : cvs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-ink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="font-semibold text-ink-600 mb-1">No CVs yet</h3>
            <p className="text-sm text-ink-400 mb-4">Create your first CV to get started</p>
            <button className="btn-primary" onClick={handleCreate}>Create your first CV</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cvs.map(cv => (
              <CVCard
                key={cv.id}
                cv={cv}
                onOpen={() => navigate(`/editor/${cv.id}`)}
                onDuplicate={() => duplicateCV(cv.id)}
                onDelete={() => handleDelete(cv.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
