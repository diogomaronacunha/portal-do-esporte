import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type Params = { params: Promise<{ id: string }> }

function extractContent(html: string): { imagem_url: string | null; conteudo: string | null } {
  // og:image — múltiplos padrões
  let imagem_url: string | null = null
  const ogImagePatterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ]
  for (const pattern of ogImagePatterns) {
    const m = html.match(pattern)
    if (m?.[1]?.startsWith('http')) {
      imagem_url = m[1]
      break
    }
  }

  // Conteúdo: encontra âncora e extrai parágrafos a partir dela
  function extractFromAnchor(anchorRegex: RegExp): string | null {
    const m = html.match(anchorRegex)
    if (!m) return null
    const start = html.indexOf(m[0])
    if (start === -1) return null
    const chunk = html.substring(start, start + 25000)
    const paragraphs = (chunk.match(/<p[^>]*>[\s\S]*?<\/p>/gi) ?? [])
      .map(p => p.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(p => p.length > 40)
    if (paragraphs.length === 0) return null
    return '<p>' + paragraphs.slice(0, 40).join('</p>\n<p>') + '</p>'
  }

  const anchors = [
    /<article[^>]*>/i,
    /<div[^>]+class=["'][^"']*entry-content[^"']*["']/i,
    /<div[^>]+class=["'][^"']*post-content[^"']*["']/i,
    /<div[^>]+class=["'][^"']*td-post-content[^"']*["']/i,
    /<div[^>]+class=["'][^"']*article-body[^"']*["']/i,
    /<div[^>]+class=["'][^"']*materia-conteudo[^"']*["']/i,
    /<div[^>]+class=["'][^"']*conteudo[^"']*["']/i,
    /<div[^>]+class=["'][^"']*content[^"']*["']/i,
    /<main[^>]*>/i,
  ]

  let conteudo: string | null = null
  for (const anchor of anchors) {
    const extracted = extractFromAnchor(anchor)
    if (extracted && extracted.length > 200) {
      conteudo = extracted
      break
    }
  }

  // Fallback: todos os <p> com texto significativo
  if (!conteudo) {
    const allP = (html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) ?? [])
      .map(p => p.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(p => p.length > 60)
    if (allP.length >= 2) {
      conteudo = '<p>' + allP.slice(0, 30).join('</p>\n<p>') + '</p>'
    }
  }

  return { imagem_url, conteudo }
}

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Busca a notícia para obter a URL original
  const { data: noticia, error: fetchError } = await supabase
    .from('noticias')
    .select('id, fonte_url, imagem_url')
    .eq('id', id)
    .single()

  if (fetchError || !noticia) {
    return NextResponse.json({ error: 'Notícia não encontrada' }, { status: 404 })
  }

  // Busca o HTML do artigo original
  let html: string
  try {
    const res = await fetch(noticia.fonte_url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortalDoEsporte/1.0)' },
      signal: AbortSignal.timeout(15000),
    })
    html = await res.text()
  } catch {
    return NextResponse.json({ error: 'Falha ao buscar artigo original' }, { status: 502 })
  }

  const { imagem_url, conteudo } = extractContent(html)

  const updates: Record<string, string | null> = {}
  if (imagem_url && !noticia.imagem_url) updates.imagem_url = imagem_url
  if (conteudo) updates.conteudo = conteudo

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: true, updated: false, reason: 'Nada novo extraído' })
  }

  const { error: updateError } = await supabase
    .from('noticias')
    .update(updates)
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, updated: true, fields: Object.keys(updates) })
}
