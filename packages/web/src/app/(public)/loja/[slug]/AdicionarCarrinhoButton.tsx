'use client'

import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useCarrinho } from '@/contexts/CarrinhoContext'
import type { Produto } from '@/types/database'

export default function AdicionarCarrinhoButton({ produto }: { produto: Produto }) {
  const { addItem } = useCarrinho()
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string | null>(null)
  const [adicionado, setAdicionado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const tamanhos = produto.tamanhos_disponiveis ?? []

  function handleAdicionar() {
    if (tamanhos.length > 0 && !tamanhoSelecionado) {
      setErro('Selecione um tamanho')
      return
    }
    addItem(produto, 1, tamanhoSelecionado)
    setAdicionado(true)
    setErro(null)
    setTimeout(() => setAdicionado(false), 2500)
  }

  return (
    <div className="space-y-4">
      {tamanhos.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Tamanho</p>
          <div className="flex flex-wrap gap-2">
            {tamanhos.map(t => (
              <button
                key={t}
                onClick={() => { setTamanhoSelecionado(t); setErro(null) }}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  tamanhoSelecionado === t
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-gray-300 text-gray-700 hover:border-primary-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {erro && <p className="text-xs text-red-500 mt-1">{erro}</p>}
        </div>
      )}

      <button
        onClick={handleAdicionar}
        className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
          adicionado
            ? 'bg-green-500 text-white'
            : 'bg-primary-600 hover:bg-primary-700 text-white'
        }`}
      >
        {adicionado ? (
          <>
            <Check size={18} />
            Adicionado ao carrinho!
          </>
        ) : (
          <>
            <ShoppingCart size={18} />
            Adicionar ao carrinho
          </>
        )}
      </button>
    </div>
  )
}
