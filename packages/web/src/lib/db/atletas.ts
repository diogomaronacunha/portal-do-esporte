import { createClient } from '@/lib/supabase/server'
import type { Atleta } from '@/types/database'

export async function getAtletasAprovados(limit = 20, offset = 0): Promise<Atleta[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('atletas')
    .select('*')
    .eq('status', 'aprovado')
    .order('nome', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(`Erro ao buscar atletas: ${error.message}`)
  return data ?? []
}

export async function getAtletaPorSlug(slug: string): Promise<Atleta | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('atletas')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'aprovado')
    .single()

  if (error) return null
  return data
}

export async function getAtletasPendentes(): Promise<Atleta[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('atletas')
    .select('*')
    .eq('status', 'pendente')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Erro ao buscar atletas pendentes: ${error.message}`)
  return data ?? []
}
