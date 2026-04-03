import Link from 'next/link'
import AuthActions from '@/components/AuthActions'
import { getUserRole } from '@/lib/getUserRole'
import { AUTHOR_ROLES, type Role } from '@/lib/roles'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function NavBar() {
  let userEmail: string | null = null
  let role: Role | null = null

  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    userEmail = user?.email ?? null

    const roleRes = await getUserRole()
    role = roleRes.role
  } catch {
    // If cookies/Supabase is not configured yet, still render a usable navbar.
  }

  const canCreate = role ? AUTHOR_ROLES.includes(role) : false

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 12px',
        borderBottom: '1px solid #e5e7eb',
        background: 'white'
      }}
    >
      <Link href="/" style={{ fontWeight: 800 }}>
        Blog Web
      </Link>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link href="/">Home</Link>
        {canCreate ? <Link href="/posts/new">New Post</Link> : null}
      </nav>

      <AuthActions userEmail={userEmail} />
    </header>
  )
}

