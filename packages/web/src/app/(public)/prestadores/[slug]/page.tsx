import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Globe, Instagram, Phone, Tag } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('prestadores').select('nome_empresa, descricao').eq('slug', slug).single()
  if (!data) return {}
  return { title: data.nome_empresa, description: data.descricao ?? undefined }
}

export default async function PrestadorPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: prestador } = await supabase
    .from('prestadores')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'aprovado')
    .single()

  if (!prestador) notFound()

  // Ofertas ativas do prestador
  const { data: ofertas } = await supabase
    .from('ofertas')
    .select('id, titulo, slug, preco_oferta, preco_original, quantidade_maxima, quantidade_vendida, data_fim, categoria:categorias_oferta(nome, icone)')
    .eq('prestador_id', prestador.id)
    .eq('status', 'ativa')
    .or('data_fim.is.null,data_fim.gte.' + new Date().toISOString())
    .order('created_at', { ascending: false })

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://portal-do-esporte-phi.vercel.app'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: prestador.nome_empresa,
    description: prestador.descricao ?? undefined,
    image: prestador.logo_url ?? undefined,
    url: `${BASE_URL}/prestadores/${prestador.slug}`,
    telephone: prestador.whatsapp ?? undefined,
    sameAs: [prestador.instagram, prestador.website].filter(Boolean),
    address: {
      '@type': 'PostalAddress',
      addressLocality: prestador.cidade ?? undefined,
      addressRegion: prestador.estado,
      addressCountry: 'BR',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-3xl mx-auto px-4 py-3 text-sm text-gray-400">
          <Link href="/" className="hover:text-primary-600">Início</Link>
          {' / '}
          <Link href="/prestadores" className="hover:text-primary-600">Prestadores</Link>
          {' / '}
          <span className="text-gray-700">{prestador.nome_empresa}</span>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-12">
          {/* Header */}
          <div className="card p-6 mb-6">
            <div className="flex gap-5 items-start">
              {prestador.logo_url ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                  <Image src={prestador.logo_url} alt={prestador.nome_empresa} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center flex-shrink-0 text-3xl">
                  🏋️
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">{prestador.nome_empresa}</h1>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  {prestador.cidade && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {prestador.cidade}, {prestador.estado}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mt-3">
                  {prestador.whatsapp && (
                    <a
                      href={`https://wa.me/55${prestador.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Phone size={14} />
                      WhatsApp
                    </a>
                  )}
                  {prestador.instagram && (
                    <a
                      href={prestador.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-accent-500 transition-colors"
                    >
                      <Instagram size={16} />
                      Instagram
                    </a>
                  )}
                  {prestador.website && (
                    <a
                      href={prestador.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
                    >
                      <Globe size={16} />
                      Site
                    </a>
                  )}
                </div>
              </div>
            </div>

            {prestador.descricao && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{prestador.descricao}</p>
              </div>
            )}
          </div>

          {/* Ofertas ativas */}
          {ofertas && ofertas.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag size={18} className="text-accent-500" />
                Ofertas disponíveis
              </h2>
              <div className="space-y-3">
                {ofertas.map(o => {
                  const desconto = Math.round((1 - o.preco_oferta / o.preco_original) * 100)
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const cat = Array.isArray(o.categoria) ? (o.categoria as any[])[0] : o.categoria
                  const vendas = o.quantidade_vendida ?? 0
                  const max = o.quantidade_maxima
                  const restam = max ? max - vendas : null

                  return (
                    <Link key={o.id} href={`/ofertas/${o.slug}`} className="card p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
                      <div className="min-w-0">
                        {cat && <p className="text-xs text-gray-400 mb-0.5">{cat.icone} {cat.nome}</p>}
                        <p className="font-medium text-gray-900">{o.titulo}</p>
                        {restam !== null && restam <= 10 && (
                          <p className="text-xs text-orange-500 mt-0.5">⚡ {restam} vagas restantes</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-accent-600">{formatCurrency(o.preco_oferta)}</p>
                        <span className="text-xs bg-accent-500 text-white px-2 py-0.5 rounded-full">-{desconto}%</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
