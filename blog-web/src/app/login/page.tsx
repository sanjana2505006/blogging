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

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
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
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } }
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }

      router.push(nextUrl)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h1 style={{ marginTop: 0 }}>{mode === 'signin' ? 'Sign in' : 'Sign up'}</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb' }}>
        {mode === 'signup' ? (
          <div style={{ display: 'grid', gap: 6 }}>
            <label>Your name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </div>
        ) : null}
        <div style={{ display: 'grid', gap: 6 }}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" />
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" />
        </div>
        {error ? <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p> : null}
        <button type="submit" disabled={loading}>
          {loading ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <div style={{ display: 'flex', gap: 12 }}>
        {mode === 'signin' ? (
          <button type="button" style={{ background: '#111827' }} onClick={() => setMode('signup')}>
            Need an account?
          </button>
        ) : (
          <button type="button" style={{ background: '#111827' }} onClick={() => setMode('signin')}>
            Already have an account?
          </button>
        )}
      </div>
    </div>
  )
}

