import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Globe, Instagram, Calendar } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getClubePorSlug } from '@/lib/db/clubes'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const clube = await getClubePorSlug(slug)
  if (!clube) return {}
  return {
    title: clube.nome,
    description: clube.descricao ?? `${clube.nome} — clube esportivo${clube.cidade ? ` de ${clube.cidade}` : ''}`,
  }
}

export default async function ClubePage({ params }: Props) {
  const { slug } = await params
  const clube = await getClubePorSlug(slug)
  if (!clube) notFound()

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://portal-do-esporte-phi.vercel.app'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: clube.nome,
    description: clube.descricao ?? undefined,
    logo: clube.logo_url ?? undefined,
    url: `${BASE_URL}/clubes/${clube.slug}`,
    foundingDate: clube.fundado_em?.toString(),
    address: {
      '@type': 'PostalAddress',
      addressLocality: clube.cidade ?? undefined,
      addressRegion: clube.estado,
      addressCountry: 'BR',
    },
    sameAs: [clube.site_url, clube.instagram_url].filter(Boolean),
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
          <Link href="/clubes" className="hover:text-primary-600">Clubes</Link>
          {' / '}
          <span className="text-gray-700">{clube.nome}</span>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-12">
          {/* Header do clube */}
          <div className="card p-6 mb-6">
            <div className="flex gap-5 items-start">
              {clube.logo_url ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                  <Image src={clube.logo_url} alt={clube.nome} fill className="object-contain p-1.5" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 text-3xl font-bold">
                  {clube.nome.charAt(0)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                {clube.esporte && (
                  <span className="inline-block text-xs bg-primary-50 text-primary-700 border border-primary-200 px-2.5 py-0.5 rounded-full font-medium mb-2">
                    {clube.esporte.nome}
                  </span>
                )}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">{clube.nome}</h1>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  {clube.cidade && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {clube.cidade}, {clube.estado}
                    </span>
                  )}
                  {clube.fundado_em && (
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Fundado em {clube.fundado_em}
                    </span>
                  )}
                </div>

                <div className="flex gap-3 mt-3">
                  {clube.site_url && (
                    <a
                      href={clube.site_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
                    >
                      <Globe size={16} />
                      Site oficial
                    </a>
                  )}
                  {clube.instagram_url && (
                    <a
                      href={clube.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-accent-500 transition-colors"
                    >
                      <Instagram size={16} />
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Descrição */}
          {clube.descricao ? (
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
              <p className="whitespace-pre-line">{clube.descricao}</p>
            </div>
          ) : (
            <p className="text-gray-400 italic">Sem descrição cadastrada.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
