import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { generateGeminiSummary } from '@/lib/summarize'
import type { Role } from '@/lib/roles'

function isAllowedRole(role: Role | null) {
  return role === 'author' || role === 'admin'
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: roleRow, error: roleError } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 })

  const role = roleRow?.role as Role | null
  if (!isAllowedRole(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const title = String(payload?.title ?? '').trim()
  const body = String(payload?.body ?? '').trim()
  const image_url = payload?.image_url ? String(payload.image_url).trim() : null

  if (title.length < 3) return NextResponse.json({ error: 'Title must be at least 3 characters.' }, { status: 400 })
  if (body.length < 10) return NextResponse.json({ error: 'Body must be at least 10 characters.' }, { status: 400 })

  const { data: insertedPost, error: insertError } = await supabase
    .from('posts')
    .insert({
      title,
      body,
      image_url,
      author_id: user.id,
      summary: null
    })
    .select('id,title,body,image_url,author_id,summary,created_at')
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  try {
    const summary = await generateGeminiSummary(title, body)
    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .update({ summary })
      .eq('id', insertedPost.id)
      .select('id,title,summary')
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ postId: insertedPost.id, post: updatedPost })
  } catch (err: any) {
    // If Gemini fails (e.g., API key missing), still create the post to not block authors.
    // The README should explain required environment variables for production.
    const summary = `Summary generation failed: ${err?.message ?? 'Unknown error'}`
    await supabase.from('posts').update({ summary }).eq('id', insertedPost.id)
    return NextResponse.json({ postId: insertedPost.id, post: { id: insertedPost.id, summary } })
  }
}

