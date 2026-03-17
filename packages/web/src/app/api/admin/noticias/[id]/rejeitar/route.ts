import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { error } = await createAdminClient()
    .from('noticias')
    .update({ status: 'rejeitado' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
