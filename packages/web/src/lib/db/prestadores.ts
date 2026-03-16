import { createClient } from '@/lib/supabase/server'

export interface Prestador {
  id: string
  usuario_id: string
  nome_empresa: string
  slug: string
  descricao: string | null
  logo_url: string | null
  cidade: string | null
  estado: string
  whatsapp: string | null
  instagram: string | null
  website: string | null
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'suspenso'
  created_at: string
}

export async function getPrestadorPorUsuario(usuarioId: string): Promise<Prestador | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('prestadores')
    .select('*')
    .eq('usuario_id', usuarioId)
    .single()
  return data ?? null
}

export async function getPrestadoresPendentes(): Promise<Prestador[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('prestadores')
    .select('*')
    .eq('status', 'pendente')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}
