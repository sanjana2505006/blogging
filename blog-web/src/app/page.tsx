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
      <div>
        <h1 style={{ marginTop: 0 }}>Blog Web</h1>
        <p style={{ color: '#b91c1c' }}>Failed to load posts: {error.message}</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <h1 style={{ marginTop: 0 }}>Blog posts</h1>

      {posts && posts.length > 0 ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {posts.map((p: any) => (
            <article
              key={p.id}
              style={{ background: 'white', border: '1px solid #e5e7eb', padding: 14, borderRadius: 12 }}
            >
              <h2 style={{ margin: '0 0 6px 0' }}>
                <Link href={`/posts/${p.id}`}>{p.title}</Link>
              </h2>
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt=""
                  style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 10 }}
                />
              ) : null}
              <p style={{ marginTop: 10 }}>{p.summary ?? 'No summary yet.'}</p>
              <p style={{ margin: '10px 0 0 0', color: '#6b7280', fontSize: 13 }}>
                Author:{' '}
                {Array.isArray(p.users) ? p.users?.[0]?.name ?? 'Unknown' : p.users?.name ?? 'Unknown'}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p>No posts yet.</p>
      )}
    </div>
  )
}

