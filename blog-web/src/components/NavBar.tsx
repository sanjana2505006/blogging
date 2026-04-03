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
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">
          Blog Web
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/" className="nav-link">
            Home
          </Link>
          {canCreate ? (
            <Link href="/posts/new" className="nav-link">
              New post
            </Link>
          ) : null}
        </nav>
        <div className="nav-spacer" />
        <AuthActions userEmail={userEmail} />
      </div>
    </header>
  )
}
