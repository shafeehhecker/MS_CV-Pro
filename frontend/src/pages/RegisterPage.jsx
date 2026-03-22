import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const register = useAuthStore(s => s.register)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await register(form.name, form.email, form.password)
      navigate(data.defaultCvId ? `/editor/${data.defaultCvId}` : '/')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">M</span>
          </div>
          <span className="text-xl font-semibold text-ink-800 tracking-tight">MS CV Pro</span>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-semibold text-ink-800 mb-1">Create your account</h1>
          <p className="text-sm text-ink-400 mb-6">Start building ATS-optimised CVs</p>

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 characters" minLength={6} required />
            </div>
            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
              Create account
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
