import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const body = await request.json()
  const { prestador_id, titulo, descricao, preco_original, preco_oferta, quantidade_maxima, data_inicio, data_fim, categoria_id, esporte_id, imagem_url } = body

  if (!titulo?.trim()) return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 })
  if (!preco_original || !preco_oferta) return NextResponse.json({ error: 'Preços são obrigatórios.' }, { status: 400 })
  if (preco_oferta >= preco_original) return NextResponse.json({ error: 'Preço de oferta deve ser menor que o original.' }, { status: 400 })

  // Verificar que o prestador pertence ao usuário e está aprovado
  const { data: prestador } = await supabase
    .from('prestadores')
    .select('id, usuario_id, status')
    .eq('id', prestador_id)
    .single()

  if (!prestador || prestador.usuario_id !== user.id) {
    return NextResponse.json({ error: 'Prestador não encontrado.' }, { status: 403 })
  }
  if (prestador.status !== 'aprovado') {
    return NextResponse.json({ error: 'Seu cadastro ainda não foi aprovado.' }, { status: 403 })
  }

  // Gerar slug único
  let slug = slugify(titulo)
  const { count } = await supabase.from('ofertas').select('id', { count: 'exact', head: true }).ilike('slug', `${slug}%`)
  if (count && count > 0) slug = `${slug}-${Date.now()}`

  const { data, error } = await supabase
    .from('ofertas')
    .insert({
      prestador_id,
      titulo: titulo.trim(),
      slug,
      descricao: descricao || null,
      preco_original,
      preco_oferta,
      quantidade_maxima: quantidade_maxima || null,
      data_inicio: data_inicio || new Date().toISOString().split('T')[0],
      data_fim: data_fim || null,
      categoria_id: categoria_id || null,
      esporte_id: esporte_id || null,
      imagem_url: imagem_url || null,
      status: 'pendente',
    })
    .select('id, slug')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data.id, slug: data.slug }, { status: 201 })
}
