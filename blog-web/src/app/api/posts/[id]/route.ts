import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/roles'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getBypassUser, isAuthBypassEnabled } from '@/lib/authBypass'

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const bypass = isAuthBypassEnabled()
  const supabase = bypass ? createSupabaseAdminClient() : await createSupabaseServerClient()

  const { id } = await context.params
  let userId: string | null = null
  let role: Role | null = null

  if (bypass) {
    const bypassUser = await getBypassUser()
    userId = bypassUser.id
    role = 'admin'
  } else {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    userId = user.id

    const { data: roleRow, error: roleError } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 })

    role = roleRow?.role as Role | null
  }
  if (!role || (role !== 'author' && role !== 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id,author_id,title,body,image_url')
    .eq('id', id)
    .single()

  if (postError || !post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  const canEdit = role === 'admin' || (role === 'author' && post.author_id === userId)
  if (!canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

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

  const { data: updated, error: updateError } = await supabase
    .from('posts')
    .update({
      title,
      body,
      image_url
    })
    .eq('id', id)
    .select('id,title,summary')
    .single()

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ postId: updated.id, post: updated })
}

