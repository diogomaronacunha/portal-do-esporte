import { createClient } from '@/lib/supabase/server'
import type { Evento } from '@/types/database'

export async function getEventosAprovados(
  limit = 20,
  options: { q?: string; esporteSlug?: string } = {}
): Promise<Evento[]> {
  const supabase = await createClient()
  const hoje = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('eventos')
    .select('*, esporte:esportes(id, nome, slug)')
    .eq('status', 'aprovado')
    .gte('data_inicio', hoje)
    .order('data_inicio', { ascending: true })
    .limit(limit)

  if (options.q) {
    query = query.ilike('titulo', `%${options.q}%`)
  }
  if (options.esporteSlug) {
    query = query.eq('esportes.slug', options.esporteSlug)
  }

  const { data, error } = await query
  if (error) throw new Error(`Erro ao buscar eventos: ${error.message}`)
  return data ?? []
}

export async function getEventoPorId(id: string): Promise<Evento | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('eventos')
    .select('*, esporte:esportes(id, nome, slug)')
    .eq('id', id)
    .eq('status', 'aprovado')
    .single()

  if (error) return null
  return data
}

export async function getEventoPorSlug(slug: string): Promise<Evento | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('eventos')
    .select('*, esporte:esportes(id, nome, slug)')
    .eq('slug', slug)
    .eq('status', 'aprovado')
    .single()
  return data ?? null
}

export async function getEventosPendentes(): Promise<Evento[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('eventos')
    .select('*, esporte:esportes(id, nome, slug)')
    .eq('status', 'pendente')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Erro ao buscar eventos pendentes: ${error.message}`)
  return data ?? []
}
