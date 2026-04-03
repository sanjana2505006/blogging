import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 6

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const supabase = await createSupabaseServerClient()
  const params = await searchParams
  const q = (params.q ?? '').trim()
  const pageNum = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1)
  const from = (pageNum - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('posts')
    .select('id,title,summary,image_url,author_id,users(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (q) {
    query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`)
  }

  const { data: posts, error, count } = await query
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasPrev = pageNum > 1
  const hasNext = pageNum < totalPages
  const prevHref = `/?page=${pageNum - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`
  const nextHref = `/?page=${pageNum + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`

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

      <form className="card card-pad search-row" method="get" action="/">
        <input
          className="input"
          name="q"
          defaultValue={q}
          placeholder="Search by title or summary..."
          aria-label="Search posts"
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

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
          <p>{q ? `No posts found for "${q}".` : 'No posts yet. When an author publishes, they\'ll show up here.'}</p>
        </div>
      )}

      <div className="pagination-row">
        <p className="muted" style={{ margin: 0 }}>
          Page {pageNum} of {totalPages}
        </p>
        <div className="pagination-actions">
          {hasPrev ? (
            <Link href={prevHref} className="btn btn-ghost btn-sm">
              Previous
            </Link>
          ) : (
            <span className="btn btn-ghost btn-sm" style={{ opacity: 0.4, pointerEvents: 'none' }}>
              Previous
            </span>
          )}
          {hasNext ? (
            <Link href={nextHref} className="btn btn-ghost btn-sm">
              Next
            </Link>
          ) : (
            <span className="btn btn-ghost btn-sm" style={{ opacity: 0.4, pointerEvents: 'none' }}>
              Next
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
