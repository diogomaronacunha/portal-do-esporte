import { getClubesPendentes } from '@/lib/db/clubes'
import { formatDate } from '@/lib/utils'
import { MapPin, Globe, Instagram } from 'lucide-react'
import AprovarClubeButton from './AprovarClubeButton'

export default async function AdminClubesPage() {
  let clubes: Awaited<ReturnType<typeof getClubesPendentes>> = []
  try {
    clubes = await getClubesPendentes()
  } catch {
    // Banco não configurado
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Clubes Pendentes</h1>
      <p className="text-gray-500 mb-6">Revise e aprove os clubes cadastrados.</p>

      {clubes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          Nenhum clube pendente de aprovação.
        </div>
      ) : (
        <div className="space-y-4">
          {clubes.map((clube) => (
            <div key={clube.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900">{clube.nome}</h2>
                  {clube.esporte && (
                    <span className="badge-green mt-1">{clube.esporte.nome}</span>
                  )}
                  {clube.descricao && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{clube.descricao}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                    {clube.cidade && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {clube.cidade}, {clube.estado}
                      </span>
                    )}
                    {clube.fundado_em && <span>Fundado em {clube.fundado_em}</span>}
                    <span>Enviado em: {formatDate(clube.created_at)}</span>
                    {clube.site_url && (
                      <a href={clube.site_url} target="_blank" rel="noopener noreferrer"
                        className="text-primary-600 hover:underline flex items-center gap-1">
                        <Globe size={11} /> Site
                      </a>
                    )}
                    {clube.instagram_url && (
                      <a href={clube.instagram_url} target="_blank" rel="noopener noreferrer"
                        className="text-primary-600 hover:underline flex items-center gap-1">
                        <Instagram size={11} /> Instagram
                      </a>
                    )}
                  </div>
                </div>
                <AprovarClubeButton clubeId={clube.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
