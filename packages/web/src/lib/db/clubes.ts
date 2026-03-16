import { createClient } from '@/lib/supabase/server'
import type { Clube } from '@/types/database'

export async function getClubesAprovados(limit = 40): Promise<Clube[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clubes')
    .select('*, esporte:esportes(id, nome, slug)')
    .eq('status', 'aprovado')
    .order('nome', { ascending: true })
    .limit(limit)

  if (error) throw new Error(`Erro ao buscar clubes: ${error.message}`)
  return data ?? []
}

export async function getClubesPendentes(): Promise<Clube[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clubes')
    .select('*, esporte:esportes(id, nome, slug)')
    .eq('status', 'pendente')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Erro ao buscar clubes pendentes: ${error.message}`)
  return data ?? []
}
