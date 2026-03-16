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

  // Resolver slugs em IDs antes de filtrar (filtrar diretamente em tabelas embutidas não funciona no PostgREST)
  const [categoriaId, esporteId] = await Promise.all([
    categoriaSlug
      ? supabase.from('categorias_produto').select('id').eq('slug', categoriaSlug).single().then(r => r.data?.id ?? null)
      : Promise.resolve(null),
    esporteSlug
      ? supabase.from('esportes').select('id').eq('slug', esporteSlug).single().then(r => r.data?.id ?? null)
      : Promise.resolve(null),
  ])

  let query = supabase
    .from('produtos')
    .select(PRODUTO_SELECT)
    .eq('status', 'ativo')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (q) query = query.ilike('nome', `%${q}%`)
  if (lojistaId) query = query.eq('lojista_id', lojistaId)
  if (categoriaId) query = query.eq('categoria_id', categoriaId)
  if (esporteId) query = query.eq('esporte_id', esporteId)

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
