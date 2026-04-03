import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id,title,summary,image_url,author_id,users(name)')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return (
      <div className="stack">
        <header className="page-header">
          <p className="page-eyebrow">Blog</p>
          <h1 className="page-title">Stories &amp; notes</h1>
        </header>
        <div className="card card-pad">
          <p className="error-text">Failed to load posts: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="stack-lg">
      <header className="hero page-header">
        <p className="page-eyebrow">Blog</p>
        <h1 className="page-title">Stories &amp; notes</h1>
        <p className="page-desc">Read posts with AI-generated summaries. Sign in to comment; authors and admins can publish.</p>
      </header>

      {posts && posts.length > 0 ? (
        <div className="post-grid">
          {posts.map((p: any) => {
            const authorName = Array.isArray(p.users) ? p.users?.[0]?.name ?? 'Unknown' : p.users?.name ?? 'Unknown'
            return (
              <Link key={p.id} href={`/posts/${p.id}`} className="post-card-link">
                <article className="card card-pad card-hover post-card">
                  <h2 className="post-card-title">{p.title}</h2>
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="post-card-img" loading="lazy" />
                  ) : null}
                  <p className="post-card-summary">{p.summary ?? 'No summary yet.'}</p>
                  <p className="post-meta">By {authorName}</p>
                </article>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="card card-pad empty-state">
          <p>No posts yet. When an author publishes, they&apos;ll show up here.</p>
        </div>
      )}
    </div>
  )
}
