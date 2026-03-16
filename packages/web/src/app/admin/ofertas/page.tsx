import { getOfertasPendentes } from '@/lib/db/ofertas'
import { formatCurrency } from '@/lib/utils'
import AprovarOfertaButton from './AprovarOfertaButton'

export const revalidate = 0

export default async function AdminOfertasPage() {
  const ofertas = await getOfertasPendentes().catch(() => [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ofertas Pendentes</h1>
      {ofertas.length === 0 ? (
        <p className="text-gray-400 text-center py-10">Nenhuma oferta pendente.</p>
      ) : (
        <div className="space-y-4">
          {ofertas.map(o => (
            <div key={o.id} className="card p-4 flex items-center gap-4 justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{o.titulo}</p>
                <p className="text-xs text-gray-400">{o.prestador?.nome_empresa} · {o.categoria?.nome}</p>
                <p className="text-sm text-accent-600 font-bold mt-0.5">
                  {formatCurrency(o.preco_oferta)}{' '}
                  <span className="text-gray-400 line-through font-normal">{formatCurrency(o.preco_original)}</span>
                </p>
              </div>
              <AprovarOfertaButton id={o.id} status={o.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
