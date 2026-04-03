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
      <p style={{ marginTop: 0 }}>
        <a href="/login">Login</a> to comment.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
      <h3 style={{ marginBottom: 0 }}>Add a comment</h3>
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Write your comment..."
        required
        minLength={2}
      />
      {error ? <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p> : null}
      <button type="submit" disabled={loading || !commentText.trim()}>
        {loading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  )
}

