import { NextResponse } from 'next/server'
import { createClient } from './server'
import type { SupabaseClient } from '@supabase/supabase-js'

type AdminResult =
  | { supabase: SupabaseClient; userId: string; error: null }
  | { supabase: null; userId: null; error: NextResponse }

export async function requireAdmin(): Promise<AdminResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { supabase: null, userId: null, error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { supabase: null, userId: null, error: NextResponse.json({ error: 'Sem permissão' }, { status: 403 }) }
  }

  return { supabase: supabase as unknown as SupabaseClient, userId: user.id, error: null }
}
