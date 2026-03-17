import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/requireAdmin'
import { createAdminClient } from '@/lib/supabase/admin'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('eventos')
    .update({
      status: 'aprovado',
      aprovado_por: auth.userId,
      aprovado_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
