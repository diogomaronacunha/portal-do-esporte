import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FiltrosBusca from '@/components/FiltrosBusca'
import { getEventosAprovados } from '@/lib/db/eventos'
import { getEsportesAtivos } from '@/lib/db/esportes'
import { formatDate } from '@/lib/utils'

export const revalidate = 900

export const metadata: Metadata = {
  title: 'Calendário de Eventos',
  description: 'Calendário completo de eventos esportivos no Rio Grande do Sul.',
}

type Props = { searchParams: Promise<{ q?: string; esporte?: string }> }

export default async function EventosPage({ searchParams }: Props) {
  const { q, esporte } = await searchParams

  const [eventos, esportes] = await Promise.all([
    getEventosAprovados(50, { q, esporteSlug: esporte }).catch(() => []),
    getEsportesAtivos().catch(() => []),
  ])

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Calendário de Eventos</h1>
          <Link href="/cadastrar-evento" className="btn-primary text-sm">
            + Cadastrar Evento
          </Link>
        </div>
        <p className="text-gray-500 mb-6">
          Eventos esportivos no Rio Grande do Sul — corridas, campeonatos, torneios e muito mais.
        </p>

        <Suspense>
          <FiltrosBusca esportes={esportes} placeholder="Buscar eventos..." />
        </Suspense>

        {eventos.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">Nenhum evento encontrado.</p>
            {(q || esporte) ? (
              <p className="text-sm mt-2">
                Tente outros termos ou{' '}
                <Link href="/eventos" className="text-primary-600 hover:underline">
                  remova os filtros
                </Link>
                .
              </p>
            ) : (
              <>
                <p className="text-sm mt-2 mb-6">Tem um evento esportivo? Cadastre gratuitamente.</p>
                <Link href="/cadastrar-evento" className="btn-primary inline-block">
                  Cadastrar Evento
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {eventos.map((evento) => (
              <Link key={evento.id} href={`/eventos/${evento.slug}`} className="card p-5 flex gap-4 hover:shadow-md transition-shadow block">
                {/* Data */}
                <div className="bg-primary-600 text-white rounded-xl p-3 text-center min-w-[64px] flex-shrink-0">
                  <div className="text-xs font-medium uppercase">
                    {new Date(evento.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                  </div>
                  <div className="text-2xl font-bold leading-none mt-0.5">
                    {new Date(evento.data_inicio + 'T12:00:00').getDate()}
                  </div>
                </div>

                {/* Detalhes */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-1">
                    {evento.esporte && (
                      <span className="badge-green">{evento.esporte.nome}</span>
                    )}
                    {evento.gratuito && (
                      <span className="badge bg-green-100 text-green-800">Gratuito</span>
                    )}
                  </div>
                  <h2 className="font-semibold text-gray-900 text-lg leading-snug">
                    {evento.titulo}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    📍 {evento.local_nome} — {evento.local_cidade}, {evento.local_estado}
                  </p>
                  {evento.hora_inicio && (
                    <p className="text-gray-400 text-sm">🕐 {evento.hora_inicio}</p>
                  )}
                  {evento.descricao && (
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{evento.descricao}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-2">{formatDate(evento.data_inicio)}</p>
                </div>

                {/* Ação */}
                <div className="flex-shrink-0 flex flex-col justify-center">
                  <span className="text-sm text-primary-600 whitespace-nowrap">Ver detalhes →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
