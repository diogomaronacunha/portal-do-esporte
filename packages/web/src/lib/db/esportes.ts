import { createClient } from '@/lib/supabase/server'
import type { Esporte } from '@/types/database'

export async function getEsportesAtivos(): Promise<Esporte[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('esportes')
    .select('*')
    .eq('ativo', true)
    .order('nome')

  if (error) throw new Error(`Erro ao buscar esportes: ${error.message}`)
  return data ?? []
}
