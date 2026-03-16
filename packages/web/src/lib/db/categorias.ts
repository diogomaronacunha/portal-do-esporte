import { createClient } from '@/lib/supabase/server'
import type { CategoriaProduto } from '@/types/database'

export async function getCategoriasAtivas(): Promise<CategoriaProduto[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categorias_produto')
    .select('*')
    .eq('ativo', true)
    .order('nome', { ascending: true })

  if (error) throw new Error(`Erro ao buscar categorias: ${error.message}`)
  return data ?? []
}
