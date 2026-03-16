import { getPrestadoresPendentes } from '@/lib/db/prestadores'
import AprovarPrestadorButton from './AprovarPrestadorButton'

export const revalidate = 0

export default async function AdminPrestadoresPage() {
  const prestadores = await getPrestadoresPendentes().catch(() => [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Prestadores Pendentes</h1>
      {prestadores.length === 0 ? (
        <p className="text-gray-400 text-center py-10">Nenhum prestador pendente.</p>
      ) : (
        <div className="space-y-4">
          {prestadores.map(p => (
            <div key={p.id} className="card p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{p.nome_empresa}</p>
                {p.cidade && <p className="text-xs text-gray-400">📍 {p.cidade}, {p.estado}</p>}
                {p.descricao && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.descricao}</p>}
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  {p.whatsapp && <span>📞 {p.whatsapp}</span>}
                  {p.instagram && <span>📸 {p.instagram}</span>}
                </div>
              </div>
              <AprovarPrestadorButton id={p.id} status={p.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
