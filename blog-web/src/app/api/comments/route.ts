import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/roles'

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: roleRow, error: roleError } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 })

  const role = roleRow?.role as Role | null
  if (!role || !['viewer', 'author', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const post_id = String(payload?.post_id ?? '').trim()
  const comment_text = String(payload?.comment_text ?? '').trim()

  if (!post_id) return NextResponse.json({ error: 'post_id is required.' }, { status: 400 })
  if (comment_text.length < 2) return NextResponse.json({ error: 'Comment must be at least 2 characters.' }, { status: 400 })

  const { data: inserted, error } = await supabase
    .from('comments')
    .insert({ post_id, user_id: user.id, comment_text })
    .select('id,post_id,user_id,comment_text')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ commentId: inserted.id })
}

