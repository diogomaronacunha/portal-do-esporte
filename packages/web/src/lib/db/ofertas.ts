import { createClient } from '@/lib/supabase/server'

const OFERTA_SELECT = '*, prestador:prestadores(id,nome_empresa,slug,whatsapp), categoria:categorias_oferta(id,nome,slug), esporte:esportes(id,nome,slug)'

export interface Oferta {
  id: string
  prestador_id: string
  categoria_id: string | null
  esporte_id: string | null
  titulo: string
  slug: string
  descricao: string | null
  imagem_url: string | null
  preco_original: number
  preco_oferta: number
  quantidade_maxima: number | null
  quantidade_vendida: number
  data_inicio: string
  data_fim: string | null
  status: 'pendente' | 'ativa' | 'encerrada' | 'rejeitada'
  created_at: string
  prestador?: { id: string; nome_empresa: string; slug: string; whatsapp: string | null }
  categoria?: { id: string; nome: string; slug: string; icone?: string | null } | null
  esporte?: { id: string; nome: string; slug: string } | null
}

export interface CategoriasOferta {
  id: string
  nome: string
  slug: string
  icone: string | null
}

export async function getOfertasAtivas(options: { categoriaSlug?: string; q?: string; limit?: number; offset?: number } = {}): Promise<Oferta[]> {
  const { categoriaSlug, q, limit = 20, offset = 0 } = options
  const supabase = await createClient()

  const categoriaId = categoriaSlug
    ? await supabase.from('categorias_oferta').select('id').eq('slug', categoriaSlug).single().then(r => r.data?.id ?? null)
    : null

  let query = supabase
    .from('ofertas')
    .select(OFERTA_SELECT)
    .eq('status', 'ativa')
    .or('data_fim.is.null,data_fim.gte.' + new Date().toISOString())
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (q) query = query.ilike('titulo', `%${q}%`)
  if (categoriaId) query = query.eq('categoria_id', categoriaId)

  const { data, error } = await query
  if (error) throw new Error(`Erro ao buscar ofertas: ${error.message}`)
  return data ?? []
}

export async function getOfertaPorSlug(slug: string): Promise<Oferta | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ofertas')
    .select(OFERTA_SELECT)
    .eq('slug', slug)
    .eq('status', 'ativa')
    .single()
  return data ?? null
}

export async function getOfertasPendentes(): Promise<Oferta[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ofertas')
    .select(OFERTA_SELECT)
    .eq('status', 'pendente')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getCategoriasOferta(): Promise<CategoriasOferta[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('categorias_oferta').select('id,nome,slug,icone').eq('ativo', true).order('nome')
  return data ?? []
}
