import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getEventoPorSlug } from '@/lib/db/eventos'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const evento = await getEventoPorSlug(slug)
  if (!evento) return {}
  return {
    title: evento.titulo,
    description: evento.descricao ?? `${evento.titulo} — ${evento.local_cidade}, ${evento.local_estado}`,
  }
}

export default async function EventoPage({ params }: Props) {
  const { slug } = await params
  const evento = await getEventoPorSlug(slug)
  if (!evento) notFound()

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://portal-do-esporte-phi.vercel.app'
  const dataInicio = new Date(evento.data_inicio + 'T12:00:00')
  const dataFim = evento.data_fim ? new Date(evento.data_fim + 'T12:00:00') : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: evento.titulo,
    description: evento.descricao ?? undefined,
    startDate: evento.data_inicio,
    endDate: evento.data_fim ?? undefined,
    location: {
      '@type': 'Place',
      name: evento.local_nome,
      address: {
        '@type': 'PostalAddress',
        streetAddress: evento.local_endereco ?? undefined,
        addressLocality: evento.local_cidade,
        addressRegion: evento.local_estado,
        addressCountry: 'BR',
      },
    },
    organizer: { '@type': 'Organization', name: evento.organizador_nome },
    url: `${BASE_URL}/eventos/${evento.slug}`,
    isAccessibleForFree: evento.gratuito,
  }

  const fmtData = (d: Date) =>
    d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-3xl mx-auto px-4 py-3 text-sm text-gray-400">
          <Link href="/" className="hover:text-primary-600">Início</Link>
          {' / '}
          <Link href="/eventos" className="hover:text-primary-600">Eventos</Link>
          {' / '}
          <span className="text-gray-700">{evento.titulo}</span>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-12">
          {/* Header do evento */}
          <div className="flex gap-5 items-start mb-6">
            <div className="bg-primary-600 text-white rounded-2xl p-4 text-center min-w-[70px] flex-shrink-0 shadow-md">
              <div className="text-xs font-semibold uppercase tracking-wide">
                {dataInicio.toLocaleDateString('pt-BR', { month: 'short' })}
              </div>
              <div className="text-3xl font-bold leading-none mt-0.5">{dataInicio.getDate()}</div>
            </div>
            <div>
              {evento.esporte && (
                <span className="inline-block text-xs bg-primary-50 text-primary-700 border border-primary-200 px-2.5 py-0.5 rounded-full font-medium mb-2">
                  {evento.esporte.nome}
                </span>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">{evento.titulo}</h1>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Info lateral */}
            <div className="md:col-span-1 space-y-4">
              <div className="card p-4 space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Data</p>
                  <p className="text-gray-800 font-medium">{fmtData(dataInicio)}</p>
                  {dataFim && dataFim.toDateString() !== dataInicio.toDateString() && (
                    <p className="text-gray-500">até {fmtData(dataFim)}</p>
                  )}
                  {evento.hora_inicio && (
                    <p className="text-gray-500 mt-0.5">
                      🕐 {evento.hora_inicio}{evento.hora_fim ? ` – ${evento.hora_fim}` : ''}
                    </p>
                  )}
                </div>

                <hr className="border-gray-100" />

                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Local</p>
                  <p className="text-gray-800 font-medium">{evento.local_nome}</p>
                  {evento.local_endereco && <p className="text-gray-500">{evento.local_endereco}</p>}
                  <p className="text-gray-500">{evento.local_cidade}, {evento.local_estado}</p>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Organização</p>
                  <p className="text-gray-800">{evento.organizador_nome}</p>
                  {evento.organizador_contato && (
                    <p className="text-gray-500">{evento.organizador_contato}</p>
                  )}
                </div>

                {evento.gratuito && (
                  <>
                    <hr className="border-gray-100" />
                    <span className="inline-block text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">
                      ✓ Evento gratuito
                    </span>
                  </>
                )}
              </div>

              {evento.url_inscricao && (
                <a
                  href={evento.url_inscricao}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary block text-center"
                >
                  Inscrever-se →
                </a>
              )}
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              {evento.descricao ? (
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  <p className="whitespace-pre-line">{evento.descricao}</p>
                </div>
              ) : (
                <p className="text-gray-400 italic">Sem descrição detalhada.</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
