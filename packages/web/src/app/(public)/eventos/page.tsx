import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getEventosAprovados } from '@/lib/db/eventos'
import { formatDate } from '@/lib/utils'

export const revalidate = 900 // 15 minutos

export const metadata: Metadata = {
  title: 'Calendário de Eventos',
  description: 'Calendário completo de eventos esportivos no Rio Grande do Sul.',
}

export default async function EventosPage() {
  let eventos: Awaited<ReturnType<typeof getEventosAprovados>> = []
  try {
    eventos = await getEventosAprovados(50)
  } catch {
    // Banco ainda não configurado
  }

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
        <p className="text-gray-500 mb-8">
          Eventos esportivos no Rio Grande do Sul — corridas, campeonatos, torneios e muito mais.
        </p>

        {eventos.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">Nenhum evento cadastrado ainda.</p>
            <p className="text-sm mt-2 mb-6">
              Tem um evento esportivo? Cadastre gratuitamente.
            </p>
            <Link href="/cadastrar-evento" className="btn-primary inline-block">
              Cadastrar Evento
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {eventos.map((evento) => (
              <div key={evento.id} className="card p-5 flex gap-4 hover:shadow-md transition-shadow">
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
                </div>

                {/* Ação */}
                <div className="flex-shrink-0 flex flex-col justify-center">
                  {evento.url_inscricao ? (
                    <a
                      href={evento.url_inscricao}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm whitespace-nowrap"
                    >
                      Inscrever-se
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400 whitespace-nowrap">
                      {evento.organizador_contato ?? 'Sem inscrição online'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
