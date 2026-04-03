import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  let payload: any
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = String(payload?.name ?? '').trim()
  const email = String(payload?.email ?? '').trim().toLowerCase()
  const password = String(payload?.password ?? '')

  if (name.length < 2) return NextResponse.json({ error: 'Name must be at least 2 characters.' }, { status: 400 })
  if (!email.includes('@')) return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })

  try {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ userId: data.user?.id, email })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create user' }, { status: 500 })
  }
}

