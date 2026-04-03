import { redirect, notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AUTHOR_ROLES, type Role } from '@/lib/roles'
import { getUserRole } from '@/lib/getUserRole'
import PostForm from '@/components/PostForm'

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()

  const { userId, role } = await getUserRole()
  if (!userId || !role || !(AUTHOR_ROLES as Role[]).includes(role)) {
    redirect('/login?next=/posts/' + params.id + '/edit')
  }

  const { data: post, error: postError } = await supabase.from('posts').select('id,author_id,title,body,image_url').eq('id', params.id).single()
  if (postError || !post) return notFound()

  const canEdit = role === 'admin' || (role === 'author' && post.author_id === userId)
  if (!canEdit) return notFound()

  return (
    <div className="stack-lg">
      <PostForm
        mode="edit"
        actionUrl={`/api/posts/${params.id}`}
        initialTitle={post.title ?? ''}
        initialBody={post.body ?? ''}
        initialImageUrl={post.image_url}
      />
    </div>
  )
}
