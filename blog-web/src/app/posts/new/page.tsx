import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/getUserRole'
import { AUTHOR_ROLES, type Role } from '@/lib/roles'
import PostForm from '@/components/PostForm'

export const dynamic = 'force-dynamic'

export default async function NewPostPage() {
  const { userId, role } = await getUserRole()
  if (!userId || !role || !(AUTHOR_ROLES as Role[]).includes(role)) {
    redirect('/login?next=/posts/new')
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <PostForm mode="create" actionUrl="/api/posts/create" />
      <p style={{ color: '#6b7280', margin: 0 }}>
        Summary is generated automatically when you publish the post.
      </p>
    </div>
  )
}

