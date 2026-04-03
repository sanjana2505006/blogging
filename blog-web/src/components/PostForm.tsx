'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PostForm({
  actionUrl,
  mode,
  initialTitle,
  initialBody,
  initialImageUrl
}: {
  actionUrl: string
  mode: 'create' | 'edit'
  initialTitle?: string
  initialBody?: string
  initialImageUrl?: string | null
}) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle ?? '')
  const [body, setBody] = useState(initialBody ?? '')
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(actionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          image_url: imageUrl || null
        })
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.error ?? `Request failed (${res.status})`)
        return
      }

      if (data?.postId) {
        router.push(`/posts/${data.postId}`)
      } else {
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ marginTop: 0 }}>{mode === 'create' ? 'Create Post' : 'Edit Post'}</h2>
      <div style={{ display: 'grid', gap: 6 }}>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" required />
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        <label>Featured Image URL</label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://... (optional)"
        />
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        <label>Body</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your post..." required />
      </div>
      {error ? <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p> : null}
      <button type="submit" disabled={loading}>
        {loading ? 'Working...' : mode === 'create' ? 'Publish' : 'Save Changes'}
      </button>
    </form>
  )
}

