'use client'

import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthActions({ userEmail }: { userEmail: string | null }) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  if (!userEmail) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <a href="/login" className="btn btn-primary btn-sm">
          Log in
        </a>
        <a href="/signup" className="btn btn-ghost btn-sm">
          Sign up
        </a>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span className="muted" style={{ fontSize: '0.8125rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={userEmail}>
        {userEmail}
      </span>
      <button type="button" className="btn btn-ghost btn-sm" onClick={handleSignOut}>
        Sign out
      </button>
    </div>
  )
}
