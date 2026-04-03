'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const nextUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('next') ?? '/'
      : '/'

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState<number>(0)
  const [now, setNow] = useState<number>(Date.now())

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return
    const timer = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(timer)
  }, [cooldownUntil])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (Date.now() < cooldownUntil) {
      setError('Please wait a few seconds before trying again.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } }
        })
        if (error) throw error
        if (!data.session) {
          setError(
            'Check your email to confirm your account, then sign in. Or disable email confirmation in Supabase Auth settings for local testing.'
          )
          return
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }

      router.push(nextUrl)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Authentication failed')
      setCooldownUntil(Date.now() + 10000)
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
            {mode === 'signin' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="page-desc" style={{ marginTop: '0.5rem' }}>
            {mode === 'signin' ? 'Sign in to comment and access your workspace.' : 'Join to read, comment, and publish (if you have author access).'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card card-pad stack">
          {mode === 'signup' ? (
            <div className="field">
              <label className="label" htmlFor="name">
                Your name
              </label>
              <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} autoComplete="name" />
            </div>
          ) : null}
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
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit" className="btn btn-primary" disabled={loading || now < cooldownUntil}>
            {loading ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          {mode === 'signin' ? (
            <button type="button" className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setMode('signup')}>
              Need an account? Sign up
            </button>
          ) : (
            <button type="button" className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setMode('signin')}>
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
