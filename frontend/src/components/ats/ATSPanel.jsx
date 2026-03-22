import { useState } from 'react'
import useCVStore from '../../store/cvStore'

function ScoreRing({ score, size = 80 }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{Math.round(score)}</span>
      </div>
    </div>
  )
}

function MiniBar({ label, score, color }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-ink-500">{label}</span>
        <span className="font-medium" style={{ color }}>{Math.round(score)}%</span>
      </div>
      <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  )
}

function KeywordChip({ word, matched }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
      matched ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
    }`}>
      {matched ? (
        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
      ) : (
        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
      )}
      {word}
    </span>
  )
}

export default function ATSPanel({ cvId }) {
  const { runATS, atsResult } = useCVStore()
  const [jobTitle, setJobTitle] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleScore = async () => {
    if (jobDesc.trim().length < 50) {
      setError('Please paste a job description (at least 50 characters)')
      return
    }
    setError('')
    setLoading(true)
    try {
      await runATS(cvId, jobTitle, jobDesc)
    } catch (e) {
      setError(e.response?.data?.error || 'Scoring failed')
    } finally {
      setLoading(false)
    }
  }

  const result = atsResult
  const scoreColor = result ? (result.overallScore >= 70 ? '#10b981' : result.overallScore >= 45 ? '#f59e0b' : '#ef4444') : '#9ca3af'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-ink-100 bg-white flex-shrink-0">
        <h2 className="text-sm font-semibold text-ink-800">ATS Score Checker</h2>
        <p className="text-xs text-ink-400 mt-0.5">Paste a job description to see how well your CV matches</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Input form */}
        <div className="space-y-3">
          <div>
            <label className="label">Job title (optional)</label>
            <input className="input" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" />
          </div>
          <div>
            <label className="label">Job description</label>
            <textarea
              className="textarea"
              rows={6}
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Paste the full job description here…"
            />
            <p className="text-xs text-ink-300 mt-1">{jobDesc.length} chars</p>
          </div>
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button className="btn-primary w-full justify-center" onClick={handleScore} disabled={loading}>
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Analysing…</>
            ) : 'Analyse CV'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 animate-slide-up">
            {/* Overall score */}
            <div className="card p-4">
              <div className="flex items-center gap-4">
                <ScoreRing score={result.overallScore} />
                <div className="flex-1">
                  <p className="text-xs text-ink-400 mb-0.5">Overall ATS match</p>
                  <p className="text-lg font-bold" style={{ color: scoreColor }}>
                    {result.overallScore >= 70 ? 'Strong match' : result.overallScore >= 45 ? 'Moderate match' : 'Needs work'}
                  </p>
                  <p className="text-xs text-ink-400">
                    {result.jobTitle && `for ${result.jobTitle}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Sub scores */}
            <div className="card p-4 space-y-3">
              <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide">Score breakdown</p>
              <MiniBar label="Keyword match" score={result.keywordScore} color={result.keywordScore >= 70 ? '#10b981' : result.keywordScore >= 45 ? '#f59e0b' : '#ef4444'} />
              <MiniBar label="Section quality" score={result.sectionScore} color={result.sectionScore >= 70 ? '#10b981' : result.sectionScore >= 45 ? '#f59e0b' : '#ef4444'} />
              <MiniBar label="Format score" score={result.formatScore} color={result.formatScore >= 70 ? '#10b981' : result.formatScore >= 45 ? '#f59e0b' : '#ef4444'} />
            </div>

            {/* Keywords */}
            {result.matchedKeywords?.length > 0 && (
              <div className="card p-4">
                <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-3">Matched keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedKeywords.slice(0, 16).map(kw => <KeywordChip key={kw} word={kw} matched />)}
                </div>
              </div>
            )}

            {result.missingKeywords?.length > 0 && (
              <div className="card p-4">
                <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-3">Missing keywords</p>
                <p className="text-xs text-ink-400 mb-2">Consider adding these to your CV where relevant:</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords.map(kw => <KeywordChip key={kw} word={kw} matched={false} />)}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <div className="card p-4">
                <p className="text-xs font-semibold text-ink-600 uppercase tracking-wide mb-3">Recommendations</p>
                <ul className="space-y-2">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-ink-600">
                      <span className="w-4 h-4 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold mt-0.5">{i+1}</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Format issues */}
            {result.formatIssues?.length > 0 && (
              <div className="card p-4 border-red-100">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Format issues</p>
                <ul className="space-y-1.5">
                  {result.formatIssues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-red-600">
                      <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!result && !loading && (
          <div className="text-center py-8 text-ink-300">
            <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">Paste a job description above to check your ATS match score</p>
          </div>
        )}
      </div>
    </div>
  )
}
