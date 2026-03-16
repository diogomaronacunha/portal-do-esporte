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

  // Verificar se usuário tem lojista aprovado
  const { data: lojista } = await supabase
    .from('lojistas')
    .select('id, status')
    .eq('usuario_id', user.id)
    .single()

  if (!lojista) {
    return NextResponse.json({ error: 'Você precisa ter uma loja cadastrada.' }, { status: 403 })
  }

  if (lojista.status !== 'aprovado') {
    return NextResponse.json({ error: 'Sua loja ainda está pendente de aprovação.' }, { status: 403 })
  }

  const body = await request.json()
  const { nome, descricao, preco, preco_original, categoria_id, esporte_id, tamanhos_disponiveis, imagens } = body

  if (!nome?.trim()) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
  if (!preco || isNaN(Number(preco))) return NextResponse.json({ error: 'Preço inválido' }, { status: 400 })

  const baseSlug = toSlug(nome)
  let slug = baseSlug
  let tentativa = 1

  while (true) {
    const { data: slugExisting } = await supabase.from('produtos').select('id').eq('slug', slug).single()
    if (!slugExisting) break
    slug = `${baseSlug}-${++tentativa}`
  }

  const { error } = await supabase.from('produtos').insert({
    lojista_id: lojista.id,
    nome: nome.trim(),
    slug,
    descricao: descricao?.trim() || null,
    preco: Number(preco),
    preco_original: preco_original ? Number(preco_original) : null,
    categoria_id: categoria_id || null,
    esporte_id: esporte_id || null,
    tamanhos_disponiveis: tamanhos_disponiveis ?? [],
    imagens: imagens ?? [],
    status: 'pendente',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
