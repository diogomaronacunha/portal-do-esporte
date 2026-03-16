import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Verificar se já tem lojista cadastrado
  const { data: existing } = await supabase
    .from('lojistas')
    .select('id')
    .eq('usuario_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Você já tem uma loja cadastrada.' }, { status: 409 })
  }

  const body = await request.json()
  const { nome_loja, descricao, cidade, estado, whatsapp, instagram, website } = body

  if (!nome_loja?.trim()) {
    return NextResponse.json({ error: 'Nome da loja é obrigatório' }, { status: 400 })
  }

  const baseSlug = toSlug(nome_loja)
  let slug = baseSlug
  let tentativa = 1

  while (true) {
    const { data: slugExisting } = await supabase.from('lojistas').select('id').eq('slug', slug).single()
    if (!slugExisting) break
    slug = `${baseSlug}-${++tentativa}`
  }

  const { error } = await supabase.from('lojistas').insert({
    usuario_id: user.id,
    nome_loja: nome_loja.trim(),
    slug,
    descricao: descricao?.trim() || null,
    cidade: cidade?.trim() || null,
    estado: estado?.trim().toUpperCase() || 'RS',
    whatsapp: whatsapp?.trim() || null,
    instagram: instagram?.trim() || null,
    website: website?.trim() || null,

    status: 'pendente',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
