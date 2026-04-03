import { notFound } from 'next/navigation'
import Link from 'next/link'
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
  const authorName = Array.isArray(postAny.users) ? postAny.users?.[0]?.name : postAny.users?.name

  const userEmail = user?.email ?? null

  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('id,comment_text,user_id,users(name)')
    .eq('post_id', params.id)
    .order('created_at', { ascending: true })

  if (commentsError) {
    console.error(commentsError)
  }

  const canEdit = role && userId && (role === 'admin' || (role === 'author' && post.author_id === userId))

  return (
    <div className="stack-lg">
      <article className="card card-pad">
        <div className="article-hero">
          <h1 className="article-title">{post.title}</h1>
          <p className="article-byline">By {authorName ?? 'Unknown'}</p>
          {canEdit ? (
            <p style={{ margin: '1rem 0 0' }}>
              <Link href={`/posts/${params.id}/edit`} className="btn btn-ghost btn-sm">
                Edit post
              </Link>
            </p>
          ) : null}
        </div>

        {post.image_url ? <img src={post.image_url} alt="" className="article-cover" /> : null}

        <h2 className="section-title">Summary</h2>
        <div className="prose muted" style={{ marginBottom: '1.5rem' }}>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{post.summary ?? 'Summary not generated yet.'}</p>
        </div>

        <h2 className="section-title">Article</h2>
        <div className="prose">
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{post.body}</p>
        </div>
      </article>

      <section className="card card-pad stack-lg">
        <h2 className="section-title" style={{ margin: 0 }}>
          Comments
        </h2>

        <CommentForm postId={params.id} userEmail={userEmail} />

        <div className="stack">
          {comments && comments.length > 0 ? (
            comments.map((c: any) => (
              <div key={c.id} className="comment-item">
                <p className="comment-author">
                  {Array.isArray(c.users) ? c.users?.[0]?.name ?? 'Unknown' : c.users?.name ?? 'Unknown'}
                </p>
                <p className="comment-body">{c.comment_text}</p>
              </div>
            ))
          ) : (
            <p className="muted" style={{ margin: 0 }}>
              No comments yet. Be the first to share your thoughts.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
