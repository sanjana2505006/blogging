import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/getUserRole'
import { AUTHOR_ROLES, type Role } from '@/lib/roles'
import PostForm from '@/components/PostForm'
import { isAuthBypassEnabled } from '@/lib/authBypass'

export const dynamic = 'force-dynamic'

export default async function NewPostPage() {
  if (!isAuthBypassEnabled()) {
  const { userId, role } = await getUserRole()
  if (!userId || !role || !(AUTHOR_ROLES as Role[]).includes(role)) {
    redirect('/login?next=/posts/new')
  }
  }

  return (
    <div className="stack-lg">
      <PostForm mode="create" actionUrl="/api/posts/create" />
      <p className="hint card card-pad" style={{ margin: 0 }}>
        After you publish, an AI-generated summary (~200 words) is saved and shown on the home page and here. Add your{' '}
        <code style={{ fontSize: '0.85em', background: 'var(--bg-subtle)', padding: '0.15rem 0.35rem', borderRadius: 4 }}>GOOGLE_GEMINI_API_KEY</code>{' '}
        in <code style={{ fontSize: '0.85em', background: 'var(--bg-subtle)', padding: '0.15rem 0.35rem', borderRadius: 4 }}>.env.local</code> for real summaries.
      </p>
    </div>
  )
}
