import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import CommentForm from '@/components/CommentForm'
import { getUserRole } from '@/lib/getUserRole'

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const { userId, role } = await getUserRole()

  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id,title,body,image_url,summary,author_id,users(name)')
    .eq('id', params.id)
    .single()

  if (postError || !post) return notFound()

  const postAny = post as any
  const authorName = Array.isArray(postAny.users)
    ? postAny.users?.[0]?.name
    : postAny.users?.name

  const userEmail = user?.email ?? null

  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('id,comment_text,user_id,users(name)')
    .eq('post_id', params.id)
    .order('created_at', { ascending: true })

  if (commentsError) {
    // Comments failing shouldn't break reading the post.
    console.error(commentsError)
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <article style={{ background: 'white', border: '1px solid #e5e7eb', padding: 16, borderRadius: 12 }}>
        <h1 style={{ marginTop: 0 }}>{post.title}</h1>
        <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Author: {authorName ?? 'Unknown'}</p>

        {role && userId && (role === 'admin' || (role === 'author' && post.author_id === userId)) ? (
          <a
            href={`/posts/${params.id}/edit`}
            style={{ display: 'inline-block', marginTop: 8, marginBottom: 10 }}
          >
            Edit post
          </a>
        ) : null}

        {post.image_url ? (
          <img src={post.image_url} alt="" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 10, marginTop: 12 }} />
        ) : null}

        <h3 style={{ marginTop: 16, marginBottom: 6 }}>Summary</h3>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{post.summary ?? 'Summary not generated yet.'}</p>

        <h3 style={{ marginTop: 16, marginBottom: 6 }}>Body</h3>
        <div style={{ whiteSpace: 'pre-wrap' }}>{post.body}</div>
      </article>

      <section style={{ background: 'white', border: '1px solid #e5e7eb', padding: 16, borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Comments</h2>

        <CommentForm postId={params.id} userEmail={userEmail} />

        <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
          {comments && comments.length > 0 ? (
            comments.map((c: any) => (
              <div key={c.id} style={{ border: '1px solid #e5e7eb', padding: 12, borderRadius: 10 }}>
                <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>
                  {Array.isArray(c.users) ? c.users?.[0]?.name ?? 'Unknown' : c.users?.name ?? 'Unknown'}
                </p>
                <p style={{ margin: '6px 0 0 0', whiteSpace: 'pre-wrap' }}>{c.comment_text}</p>
              </div>
            ))
          ) : (
            <p style={{ color: '#6b7280' }}>No comments yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}

