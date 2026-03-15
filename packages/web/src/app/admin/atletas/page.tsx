import { getAtletasPendentes } from '@/lib/db/atletas'
import { formatDate } from '@/lib/utils'
import { MapPin, Instagram } from 'lucide-react'
import AprovarAtletaButton from './AprovarAtletaButton'

export default async function AdminAtletasPage() {
  let atletas: Awaited<ReturnType<typeof getAtletasPendentes>> = []
  try {
    atletas = await getAtletasPendentes()
  } catch {
    // Banco não configurado
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Atletas Pendentes</h1>
      <p className="text-gray-500 mb-6">Revise e aprove os perfis de atletas cadastrados.</p>

      {atletas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          Nenhum atleta pendente de aprovação.
        </div>
      ) : (
        <div className="space-y-4">
          {atletas.map((atleta) => (
            <div key={atleta.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900">{atleta.nome}</h2>
                  {atleta.esportes?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {atleta.esportes.map((esp) => (
                        <span key={esp} className="badge-green">{esp}</span>
                      ))}
                    </div>
                  )}
                  {atleta.bio && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{atleta.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                    {atleta.cidade && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {atleta.cidade}, {atleta.estado}
                      </span>
                    )}
                    {atleta.clube_nome && <span>Clube: <strong>{atleta.clube_nome}</strong></span>}
                    <span>Enviado em: {formatDate(atleta.created_at)}</span>
                    {atleta.instagram_url && (
                      <a
                        href={atleta.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline flex items-center gap-1"
                      >
                        <Instagram size={11} /> Instagram
                      </a>
                    )}
                  </div>
                  {atleta.conquistas && (
                    <p className="text-xs text-gray-500 mt-1">
                      Conquistas: {atleta.conquistas}
                    </p>
                  )}
                </div>
                <AprovarAtletaButton atletaId={atleta.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
