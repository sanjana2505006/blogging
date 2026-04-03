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
    <form onSubmit={onSubmit} className="card card-pad stack-lg">
      <div>
        <p className="page-eyebrow">{mode === 'create' ? 'Compose' : 'Edit'}</p>
        <h1 className="page-title" style={{ fontSize: '1.75rem' }}>
          {mode === 'create' ? 'New post' : 'Edit post'}
        </h1>
      </div>

      <div className="field">
        <label className="label" htmlFor="post-title">
          Title
        </label>
        <input
          id="post-title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A clear, compelling title"
          required
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="post-image">
          Featured image URL
        </label>
        <input
          id="post-image"
          className="input"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://… (optional)"
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="post-body">
          Body
        </label>
        <textarea
          id="post-body"
          className="textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your post…"
          required
          rows={minRows(body)}
        />
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : mode === 'create' ? 'Publish' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

function minRows(text: string) {
  const base = 12
  const extra = Math.min(8, Math.floor(text.split('\n').length / 4))
  return base + extra
}
