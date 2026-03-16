import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Instagram, Facebook, MapPin, Trophy, Users } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getAtletaPorSlug } from '@/lib/db/atletas'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const atleta = await getAtletaPorSlug(slug)
  if (!atleta) return {}
  return {
    title: atleta.nome,
    description: atleta.bio ?? `${atleta.nome} — atleta amador${atleta.cidade ? ` de ${atleta.cidade}` : ''}`,
  }
}

export default async function AtletaPage({ params }: Props) {
  const { slug } = await params
  const atleta = await getAtletaPorSlug(slug)
  if (!atleta) notFound()

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://portal-do-esporte-phi.vercel.app'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: atleta.nome,
    description: atleta.bio ?? undefined,
    image: atleta.foto_url ?? undefined,
    url: `${BASE_URL}/atletas/${atleta.slug}`,
    address: atleta.cidade
      ? {
          '@type': 'PostalAddress',
          addressLocality: atleta.cidade,
          addressRegion: atleta.estado,
          addressCountry: 'BR',
        }
      : undefined,
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
          <Link href="/atletas" className="hover:text-primary-600">Atletas</Link>
          {' / '}
          <span className="text-gray-700">{atleta.nome}</span>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-12">
          {/* Header do atleta */}
          <div className="card p-6 mb-6">
            <div className="flex gap-5 items-start">
              {atleta.foto_url ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-primary-100">
                  <Image src={atleta.foto_url} alt={atleta.nome} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 text-3xl font-bold ring-4 ring-primary-100">
                  {atleta.nome.charAt(0)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">{atleta.nome}</h1>

                {atleta.esportes?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {atleta.esportes.map((esp) => (
                      <span key={esp} className="inline-block text-xs bg-primary-50 text-primary-700 border border-primary-200 px-2.5 py-0.5 rounded-full font-medium">
                        {esp}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  {atleta.cidade && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {atleta.cidade}, {atleta.estado}
                    </span>
                  )}
                  {atleta.clube_nome && (
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {atleta.clube_nome}
                    </span>
                  )}
                </div>

                <div className="flex gap-3 mt-3">
                  {atleta.instagram_url && (
                    <a
                      href={atleta.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-accent-500 transition-colors"
                    >
                      <Instagram size={16} />
                      Instagram
                    </a>
                  )}
                  {atleta.facebook_url && (
                    <a
                      href={atleta.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
                    >
                      <Facebook size={16} />
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Bio */}
            <div className="md:col-span-2 space-y-6">
              {atleta.bio ? (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Sobre</h2>
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                    <p className="whitespace-pre-line">{atleta.bio}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 italic">Sem biografia cadastrada.</p>
              )}

              {atleta.conquistas && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Trophy size={18} className="text-accent-500" />
                    Conquistas
                  </h2>
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                    <p className="whitespace-pre-line">{atleta.conquistas}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Info lateral */}
            <div className="md:col-span-1">
              <div className="card p-4 space-y-3 text-sm">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Informações</p>

                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Estado</p>
                  <p className="text-gray-800 font-medium">{atleta.estado}</p>
                </div>

                {atleta.cidade && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Cidade</p>
                    <p className="text-gray-800 font-medium">{atleta.cidade}</p>
                  </div>
                )}

                {atleta.clube_nome && (
                  <>
                    <hr className="border-gray-100" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Clube</p>
                      <p className="text-gray-800 font-medium">{atleta.clube_nome}</p>
                    </div>
                  </>
                )}

                {atleta.esportes?.length > 0 && (
                  <>
                    <hr className="border-gray-100" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Modalidades</p>
                      <div className="flex flex-col gap-1">
                        {atleta.esportes.map((esp) => (
                          <span key={esp} className="text-gray-700">{esp}</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
