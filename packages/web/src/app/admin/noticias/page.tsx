import { getNoticiasPendentes } from '@/lib/db/noticias'
import { formatDate } from '@/lib/utils'
import AprovarButton from './AprovarButton'

export default async function AdminNoticiasPage() {
  let noticias: Awaited<ReturnType<typeof getNoticiasPendentes>> = []
  try {
    noticias = await getNoticiasPendentes()
  } catch {
    // Banco não configurado
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Notícias Pendentes</h1>
      <p className="text-gray-500 mb-6">Revise e aprove as notícias agregadas pelas automações.</p>

      {noticias.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          Nenhuma notícia pendente de aprovação.
        </div>
      ) : (
        <div className="space-y-4">
          {noticias.map((noticia) => (
            <div key={noticia.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {noticia.esporte && (
                    <span className="badge-green mb-2">{noticia.esporte.nome}</span>
                  )}
                  <h2 className="font-semibold text-gray-900 mt-1">{noticia.titulo}</h2>
                  {noticia.resumo && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{noticia.resumo}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>Fonte: <strong>{noticia.fonte_nome}</strong></span>
                    <span>{formatDate(noticia.created_at)}</span>
                    <a
                      href={noticia.fonte_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      Ver original →
                    </a>
                  </div>
                </div>
                <AprovarButton noticiaId={noticia.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
