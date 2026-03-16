import Image from 'next/image'
import { getProdutosPendentes } from '@/lib/db/produtos'
import { formatCurrency } from '@/lib/utils'
import AprovarProdutoButton from './AprovarProdutoButton'

export const revalidate = 0

export default async function AdminProdutosPage() {
  const produtos = await getProdutosPendentes().catch(() => [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Produtos Pendentes</h1>

      {produtos.length === 0 ? (
        <p className="text-gray-400 text-center py-10">Nenhum produto pendente.</p>
      ) : (
        <div className="space-y-4">
          {produtos.map(p => (
            <div key={p.id} className="card p-4 flex items-center gap-4">
              <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                {p.imagens[0] ? (
                  <Image src={p.imagens[0]} alt={p.nome} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🏅</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{p.nome}</p>
                <p className="text-xs text-gray-400">{p.lojista?.nome_loja}</p>
                <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                  <span>{formatCurrency(p.preco)}</span>
                  {p.categoria && <span>• {p.categoria.nome}</span>}
                  {p.esporte && <span>• {p.esporte.nome}</span>}
                </div>
              </div>
              <div className="flex-shrink-0">
                <AprovarProdutoButton id={p.id} status={p.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
