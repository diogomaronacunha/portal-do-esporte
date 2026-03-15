import { getEventosPendentes } from '@/lib/db/eventos'
import { formatDate } from '@/lib/utils'
import { Calendar, MapPin, ExternalLink } from 'lucide-react'
import AprovarEventoButton from './AprovarEventoButton'

export default async function AdminEventosPage() {
  let eventos: Awaited<ReturnType<typeof getEventosPendentes>> = []
  try {
    eventos = await getEventosPendentes()
  } catch {
    // Banco não configurado
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Eventos Pendentes</h1>
      <p className="text-gray-500 mb-6">Revise e aprove os eventos cadastrados pelos organizadores.</p>

      {eventos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          Nenhum evento pendente de aprovação.
        </div>
      ) : (
        <div className="space-y-4">
          {eventos.map((evento) => {
            const data = new Date(evento.data_inicio + 'T12:00:00')
            return (
              <div key={evento.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {evento.esporte && (
                      <span className="badge-green mb-2">{evento.esporte.nome}</span>
                    )}
                    <h2 className="font-semibold text-gray-900 mt-1">{evento.titulo}</h2>
                    {evento.descricao && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{evento.descricao}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {evento.local_nome} — {evento.local_cidade}
                      </span>
                      <span>Organizado por: <strong>{evento.organizador_nome}</strong></span>
                      {formatDate(evento.created_at) && (
                        <span>Enviado em: {formatDate(evento.created_at)}</span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className={`font-medium ${evento.gratuito ? 'text-primary-600' : 'text-gray-600'}`}>
                        {evento.gratuito ? 'Gratuito' : 'Pago'}
                      </span>
                      {evento.url_inscricao && (
                        <a
                          href={evento.url_inscricao}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline flex items-center gap-1"
                        >
                          Link de inscrição <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                  <AprovarEventoButton eventoId={evento.id} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
