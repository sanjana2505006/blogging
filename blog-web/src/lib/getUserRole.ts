import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/roles'

export async function getUserRole(): Promise<{ userId: string | null; role: Role | null }> {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return { userId: null, role: null }

  const { data: row, error } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (error) throw error

  const role = row?.role as Role | undefined
  return { userId: user.id, role: role ?? null }
}

