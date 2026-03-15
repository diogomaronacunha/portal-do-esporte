import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'

export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await req.json()
  const { nome, bio, cidade, estado, clube_nome, conquistas, instagram_url, facebook_url, esportes } = body

  if (!nome?.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 })
  }
  if (!esportes?.length) {
    return NextResponse.json({ error: 'Selecione pelo menos um esporte.' }, { status: 400 })
  }

  const baseSlug = slugify(nome)
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  const { error } = await supabase.from('atletas').insert({
    nome: nome.trim(),
    slug,
    bio: bio?.trim() || null,
    cidade: cidade?.trim() || null,
    estado: estado?.trim() || 'RS',
    clube_nome: clube_nome?.trim() || null,
    conquistas: conquistas?.trim() || null,
    instagram_url: instagram_url?.trim() || null,
    facebook_url: facebook_url?.trim() || null,
    esportes,
    status: 'pendente',
    criado_por: user.id,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
