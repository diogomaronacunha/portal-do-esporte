import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/requireAdmin'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { error } = await auth.supabase
    .from('clubes')
    .update({ status: 'rejeitado' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
