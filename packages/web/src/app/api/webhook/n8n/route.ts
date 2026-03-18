import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { slugify } from '@/lib/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>

// Endpoint recebe dados do n8n (scraping de notícias ou eventos via WhatsApp/email)
// Usa service_role key para bypass de RLS (operação confiável)

interface NoticiaPayload {
  type: 'noticia'
  titulo: string
  resumo?: string
  conteudo?: string
  imagem_url?: string
  fonte_nome: string
  fonte_url: string
  esporte_slug?: string
}

interface EventoPayload {
  type: 'evento'
  titulo: string
  descricao?: string
  data_inicio: string
  data_fim?: string
  hora_inicio?: string
  local_nome: string
  local_cidade?: string
  organizador_nome: string
  organizador_contato?: string
  esporte_slug?: string
  gratuito?: boolean
  url_inscricao?: string
}

type Payload = NoticiaPayload | EventoPayload

export async function POST(req: Request) {
  // Validar API key do n8n
  const apiKey = req.headers.get('x-api-key')
  if (apiKey !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let payload: Payload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (payload.type === 'noticia') {
    return handleNoticia(supabase, payload)
  }

  if (payload.type === 'evento') {
    return handleEvento(supabase, payload)
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
}

async function handleNoticia(supabase: AnySupabaseClient, payload: NoticiaPayload) {
  // Evitar duplicatas pela URL original
  const { data: existing } = await supabase
    .from('noticias')
    .select('id')
    .eq('fonte_url', payload.fonte_url)
    .single()

  if (existing) {
    return NextResponse.json({ skipped: true, reason: 'duplicate' })
  }

  // Buscar esporte_id se slug fornecido
  let esporteId: string | null = null
  if (payload.esporte_slug) {
    const { data: esporte } = await supabase
      .from('esportes')
      .select('id')
      .eq('slug', payload.esporte_slug)
      .single()
    esporteId = esporte?.id ?? null
  }

  const slug = slugify(payload.titulo) + '-' + Date.now()

  const { error } = await supabase.from('noticias').insert({
    titulo: payload.titulo,
    slug,
    resumo: payload.resumo ?? null,
    conteudo: payload.conteudo ?? null,
    imagem_url: payload.imagem_url ?? null,
    fonte_nome: payload.fonte_nome,
    fonte_url: payload.fonte_url,
    esporte_id: esporteId,
    status: 'publicado',
    publicado_at: new Date().toISOString(),
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, type: 'noticia' })
}

async function handleEvento(supabase: AnySupabaseClient, payload: EventoPayload) {
  let esporteId: string | null = null
  if (payload.esporte_slug) {
    const { data: esporte } = await supabase
      .from('esportes')
      .select('id')
      .eq('slug', payload.esporte_slug)
      .single()
    esporteId = esporte?.id ?? null
  }

  const slug = slugify(payload.titulo) + '-' + Date.now()

  const { error } = await supabase.from('eventos').insert({
    titulo: payload.titulo,
    slug,
    descricao: payload.descricao ?? null,
    data_inicio: payload.data_inicio,
    data_evento: payload.data_inicio, // coluna legada da tabela original (NOT NULL)
    data_fim: payload.data_fim ?? null,
    hora_inicio: payload.hora_inicio ?? null,
    local_nome: payload.local_nome,
    local_cidade: payload.local_cidade ?? 'Porto Alegre',
    local_estado: 'RS',
    esporte_id: esporteId,
    organizador_nome: payload.organizador_nome,
    organizador_contato: payload.organizador_contato ?? null,
    gratuito: payload.gratuito ?? true,
    url_inscricao: payload.url_inscricao ?? null,
    status: 'pendente',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, type: 'evento' })
}
