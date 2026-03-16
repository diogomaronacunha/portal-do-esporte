import { createClient } from '@/lib/supabase/server'
import type { Produto } from '@/types/database'

const PRODUTO_SELECT = '*, lojista:lojistas(id,nome_loja,slug,whatsapp), categoria:categorias_produto(id,nome,slug), esporte:esportes(id,nome,slug)'

type ProdutosOptions = {
  categoriaSlug?: string
  esporteSlug?: string
  q?: string
  lojistaId?: string
  limit?: number
  offset?: number
}

export async function getProdutosAtivos(options: ProdutosOptions = {}): Promise<Produto[]> {
  const { categoriaSlug, esporteSlug, q, lojistaId, limit = 24, offset = 0 } = options
  const supabase = await createClient()

  let query = supabase
    .from('produtos')
    .select(PRODUTO_SELECT)
    .eq('status', 'ativo')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (q) query = query.ilike('nome', `%${q}%`)
  if (lojistaId) query = query.eq('lojista_id', lojistaId)
  if (categoriaSlug) query = query.eq('categorias_produto.slug', categoriaSlug)
  if (esporteSlug) query = query.eq('esportes.slug', esporteSlug)

  const { data, error } = await query
  if (error) throw new Error(`Erro ao buscar produtos: ${error.message}`)
  return data ?? []
}

export async function countProdutosAtivos(options: Omit<ProdutosOptions, 'limit' | 'offset'> = {}): Promise<number> {
  const { q, lojistaId } = options
  const supabase = await createClient()

  let query = supabase
    .from('produtos')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'ativo')

  if (q) query = query.ilike('nome', `%${q}%`)
  if (lojistaId) query = query.eq('lojista_id', lojistaId)

  const { count } = await query
  return count ?? 0
}

export async function getProdutoPorSlug(slug: string): Promise<Produto | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('produtos')
    .select(PRODUTO_SELECT)
    .eq('slug', slug)
    .eq('status', 'ativo')
    .single()

  if (error) return null
  return data
}

export async function getProdutosPendentes(): Promise<Produto[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('produtos')
    .select(PRODUTO_SELECT)
    .eq('status', 'pendente')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Erro ao buscar produtos pendentes: ${error.message}`)
  return data ?? []
}

export async function getProdutosDoLojista(lojistaId: string): Promise<Produto[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('produtos')
    .select(PRODUTO_SELECT)
    .eq('lojista_id', lojistaId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Erro ao buscar produtos do lojista: ${error.message}`)
  return data ?? []
}
