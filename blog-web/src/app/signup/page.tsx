'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? 'Sign up failed')
        return
      }
      setSuccess('Account created successfully. Please sign in.')
      setName('')
      setPassword('')
      setTimeout(() => router.push('/login'), 800)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card stack-lg">
        <div>
          <p className="page-eyebrow">Account</p>
          <h1 className="page-title" style={{ fontSize: '1.75rem' }}>
            Create account
          </h1>
          <p className="page-desc" style={{ marginTop: '0.5rem' }}>
            Create a new user for testing without email confirmation friction.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="card card-pad stack">
          <div className="field">
            <label className="label" htmlFor="name">Name</label>
            <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </div>
          <div className="field">
            <label className="label" htmlFor="email">Email</label>
            <input id="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required type="email" />
          </div>
          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <input id="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required type="password" minLength={6} />
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          {success ? <p className="hint">{success}</p> : null}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <a href="/login" className="btn btn-ghost" style={{ width: '100%' }}>
          Already have an account? Sign in
        </a>
      </div>
    </div>
  )
}

