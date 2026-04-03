'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CommentForm({
  postId,
  userEmail
}: {
  postId: string
  userEmail: string | null
}) {
  const router = useRouter()
  const [commentText, setCommentText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, comment_text: commentText })
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? `Request failed (${res.status})`)
        return
      }

      setCommentText('')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (!userEmail) {
    return (
      <div className="card" style={{ padding: '1rem 1.25rem', background: 'var(--bg-subtle)', borderStyle: 'dashed' }}>
        <p className="muted" style={{ margin: 0, fontSize: '0.9375rem' }}>
          <a href="/login">Log in</a> to join the conversation.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      <label className="label" htmlFor="comment">
        Add a comment
      </label>
      <textarea
        id="comment"
        className="textarea"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Share your thoughts…"
        required
        minLength={2}
        rows={4}
      />
      {error ? <p className="error-text">{error}</p> : null}
      <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !commentText.trim()} style={{ alignSelf: 'flex-start' }}>
        {loading ? 'Posting…' : 'Post comment'}
      </button>
    </form>
  )
}
