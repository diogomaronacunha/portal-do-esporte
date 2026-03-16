import { createClient } from '@/lib/supabase/server'
import type { Lojista } from '@/types/database'

export async function getLojistasAprovados(): Promise<Lojista[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lojistas')
    .select('*')
    .eq('status', 'aprovado')
    .order('nome_loja', { ascending: true })

  if (error) throw new Error(`Erro ao buscar lojistas: ${error.message}`)
  return data ?? []
}

export async function getLojistaPorSlug(slug: string): Promise<Lojista | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lojistas')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'aprovado')
    .single()

  if (error) return null
  return data
}

export async function getLojistaPorUsuario(usuarioId: string): Promise<Lojista | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lojistas')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data ?? null
}

export async function getLojistasPendentes(): Promise<Lojista[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lojistas')
    .select('*')
    .eq('status', 'pendente')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Erro ao buscar lojistas pendentes: ${error.message}`)
  return data ?? []
}
