'use client'

import { useCarrinho } from '@/contexts/CarrinhoContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function CarrinhoPage() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCarrinho()

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex flex-col items-center justify-center py-20 text-center px-4">
          <ShoppingBag size={64} className="text-gray-200 mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Carrinho vazio</h1>
          <p className="text-gray-500 mb-6">Você ainda não adicionou nenhum produto.</p>
          <Link href="/loja" className="btn-primary">Ver produtos</Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Carrinho</h1>
            <button
              onClick={clearCart}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Limpar carrinho
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Lista de itens */}
            <div className="md:col-span-2 space-y-4">
              {items.map(item => (
                <div
                  key={`${item.produto.id}::${item.tamanho ?? ''}`}
                  className="card p-4 flex gap-4"
                >
                  <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {item.produto.imagens[0] ? (
                      <Image src={item.produto.imagens[0]} alt={item.produto.nome} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🏅</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400">{item.produto.lojista?.nome_loja}</p>
                    <Link href={`/loja/${item.produto.slug}`} className="font-medium text-gray-900 text-sm line-clamp-2 hover:text-primary-600">
                      {item.produto.nome}
                    </Link>
                    {item.tamanho && (
                      <p className="text-xs text-gray-500 mt-0.5">Tamanho: {item.tamanho}</p>
                    )}
                    <p className="font-bold text-primary-700 mt-1">{formatCurrency(item.produto.preco)}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.produto.id, item.tamanho)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.produto.id, item.tamanho, item.quantidade - 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary-400 transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantidade}</span>
                      <button
                        onClick={() => updateQuantity(item.produto.id, item.tamanho, item.quantidade + 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary-400 transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div>
              <div className="card p-5 sticky top-20">
                <h2 className="font-bold text-gray-900 mb-4">Resumo do pedido</h2>
                <div className="space-y-2 text-sm">
                  {items.map(item => (
                    <div key={`${item.produto.id}::${item.tamanho ?? ''}`} className="flex justify-between text-gray-600">
                      <span className="truncate max-w-[160px]">{item.produto.nome} × {item.quantidade}</span>
                      <span>{formatCurrency(item.produto.preco * item.quantidade)}</span>
                    </div>
                  ))}
                </div>
                <hr className="my-4 border-gray-100" />
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Frete e taxas calculados no checkout.</p>
                <Link
                  href="/loja/checkout"
                  className="btn-primary w-full text-center block mt-4"
                >
                  Finalizar pedido
                </Link>
                <Link href="/loja" className="block text-center text-sm text-primary-600 hover:underline mt-3">
                  Continuar comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
