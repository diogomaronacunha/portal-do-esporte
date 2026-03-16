import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/requireAdmin'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const { error: dbError } = await supabase!
    .from('lojistas')
    .update({ status: 'aprovado' })
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
