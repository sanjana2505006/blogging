import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export function isAuthBypassEnabled() {
  return process.env.AUTH_BYPASS === 'true'
}

export async function getBypassUser() {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('users')
    .select('id,email,role')
    .order('email', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('No user exists in public.users. Create one user first.')
  return data
}

