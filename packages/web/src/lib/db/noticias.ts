import { createClient } from '@/lib/supabase/server'
import type { Noticia } from '@/types/database'

export async function getNoticiasPublicadas(limit = 12, offset = 0): Promise<Noticia[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('noticias')
    .select('*, esporte:esportes(id, nome, slug)')
    .eq('status', 'publicado')
    .order('publicado_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(`Erro ao buscar notícias: ${error.message}`)
  return data ?? []
}

export async function getNoticiaPorSlug(slug: string): Promise<Noticia | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('noticias')
    .select('*, esporte:esportes(id, nome, slug)')
    .eq('slug', slug)
    .eq('status', 'publicado')
    .single()

  if (error) return null
  return data
}

export async function getNoticiasPendentes(): Promise<Noticia[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('noticias')
    .select('*, esporte:esportes(id, nome, slug)')
    .eq('status', 'pendente')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Erro ao buscar notícias pendentes: ${error.message}`)
  return data ?? []
}

export async function getNoticiasPorEsporte(esporteSlug: string, limit = 12): Promise<Noticia[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('noticias')
    .select('*, esporte:esportes!inner(id, nome, slug)')
    .eq('status', 'publicado')
    .eq('esportes.slug', esporteSlug)
    .order('publicado_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Erro ao buscar notícias por esporte: ${error.message}`)
  return data ?? []
}
