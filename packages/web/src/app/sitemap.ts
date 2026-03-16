import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://portaldoesporte.com.br'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Páginas estáticas
  const static_pages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/noticias`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/eventos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/atletas`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ]

  // Notícias publicadas
  const { data: noticias } = await supabase
    .from('noticias')
    .select('slug, publicado_at')
    .eq('status', 'publicado')
    .order('publicado_at', { ascending: false })
    .limit(500)

  const noticia_pages: MetadataRoute.Sitemap = (noticias ?? []).map((n) => ({
    url: `${BASE_URL}/noticias/${n.slug}`,
    lastModified: n.publicado_at ? new Date(n.publicado_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...static_pages, ...noticia_pages]
}
