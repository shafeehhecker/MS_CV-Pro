// Shared accordion item shell used by all section forms
import { useState } from 'react'

export function SectionItem({ title, subtitle, onDelete, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-ink-50 transition-colors" onClick={() => setOpen(o => !o)}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink-700 truncate">{title || 'Untitled'}</p>
          {subtitle && <p className="text-xs text-ink-400 truncate mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            className="p-1.5 text-ink-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            onClick={e => { e.stopPropagation(); onDelete() }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <svg
            className={`w-4 h-4 text-ink-300 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
      {open && <div className="px-4 pb-4 pt-1 border-t border-ink-100">{children}</div>}
    </div>
  )
}

export function AddButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-ink-200 rounded-xl text-sm text-ink-400 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      {label}
    </button>
  )
}
