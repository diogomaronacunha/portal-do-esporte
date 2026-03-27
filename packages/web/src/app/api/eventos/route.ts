import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'
import { notificarAdmin } from '@/lib/email'

export async function POST(req: Request) {
  const supabase = await createClient()

  // Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const titulo = body.titulo as string
  if (!titulo?.trim()) {
    return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
  }

  const slug = slugify(titulo) + '-' + Date.now()

  const { data, error } = await supabase.from('eventos').insert({
    titulo: titulo.trim(),
    slug,
    descricao: body.descricao as string | null,
    data_inicio: body.data_inicio as string,
    data_evento: body.data_inicio as string, // coluna legada NOT NULL
    data_fim: body.data_fim as string | null,
    hora_inicio: body.hora_inicio as string | null,
    local_nome: body.local_nome as string,
    local_endereco: body.local_endereco as string | null,
    local_cidade: (body.local_cidade as string) || 'Porto Alegre',
    local_estado: 'RS',
    esporte_id: body.esporte_id as string | null,
    organizador_nome: body.organizador_nome as string,
    organizador_contato: body.organizador_contato as string | null,
    gratuito: body.gratuito as boolean ?? true,
    url_inscricao: body.url_inscricao as string | null,
    criado_por: user.id,
    status: 'pendente',
  }).select('id').single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  void notificarAdmin('evento', titulo.trim())

  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}
