import { getLojistasPendentes } from '@/lib/db/lojistas'
import AprovarLojistaButton from './AprovarLojistaButton'

export const revalidate = 0

export default async function AdminLojistasPage() {
  const lojistas = await getLojistasPendentes().catch(() => [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Lojistas Pendentes</h1>

      {lojistas.length === 0 ? (
        <p className="text-gray-400 text-center py-10">Nenhum lojista pendente.</p>
      ) : (
        <div className="space-y-4">
          {lojistas.map(l => (
            <div key={l.id} className="card p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{l.nome_loja}</p>
                {l.cidade && <p className="text-xs text-gray-400">📍 {l.cidade}, {l.estado}</p>}
                {l.descricao && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{l.descricao}</p>}
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  {l.whatsapp && <span>📞 {l.whatsapp}</span>}
                  {l.instagram && <span>📸 {l.instagram}</span>}
                </div>
              </div>
              <div className="flex-shrink-0">
                <AprovarLojistaButton id={l.id} status={l.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
