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
      <a href="/login" style={{ marginLeft: 'auto' }}>
        Login
      </a>
    )
  }

  return (
    <button onClick={handleSignOut} style={{ marginLeft: 'auto', background: '#111827' }}>
      Sign out
    </button>
  )
}

