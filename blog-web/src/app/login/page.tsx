'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const nextUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('next') ?? '/'
      : '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      router.push(nextUrl)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Authentication failed')
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
            Welcome back
          </h1>
          <p className="page-desc" style={{ marginTop: '0.5rem' }}>
            Sign in to comment and access your workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card card-pad stack">
          <div className="field">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              autoComplete="current-password"
            />
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Working…' : 'Sign in'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <a href="/signup" className="btn btn-ghost" style={{ width: '100%' }}>
            Need an account? Sign up
          </a>
        </div>
      </div>
    </div>
  )
}
