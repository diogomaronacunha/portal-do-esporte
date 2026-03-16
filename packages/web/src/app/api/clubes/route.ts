import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'

export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await req.json()
  const { nome, descricao, esporte_slug, cidade, estado, fundado_em, site_url, instagram_url } = body

  if (!nome?.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  }

  let esporteId: string | null = null
  if (esporte_slug) {
    const { data: esporte } = await supabase
      .from('esportes')
      .select('id')
      .eq('slug', esporte_slug)
      .single()
    esporteId = esporte?.id ?? null
  }

  const slug = `${slugify(nome)}-${Date.now().toString(36)}`

  const { error } = await supabase.from('clubes').insert({
    nome: nome.trim(),
    slug,
    descricao: descricao?.trim() || null,
    esporte_id: esporteId,
    cidade: cidade?.trim() || null,
    estado: estado?.trim() || 'RS',
    fundado_em: fundado_em ?? null,
    site_url: site_url?.trim() || null,
    instagram_url: instagram_url?.trim() || null,
    status: 'pendente',
    criado_por: user.id,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
