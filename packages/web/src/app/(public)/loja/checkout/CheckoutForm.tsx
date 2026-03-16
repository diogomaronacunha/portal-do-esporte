'use client'

import { useState } from 'react'
import { useCarrinho } from '@/contexts/CarrinhoContext'
import { formatCurrency } from '@/lib/utils'

interface CheckoutFormProps {
  userEmail: string
}

export default function CheckoutForm({ userEmail }: CheckoutFormProps) {
  const { items, total, clearCart } = useCarrinho()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (items.length === 0) return

    setLoading(true)
    setErro(null)

    const form = e.currentTarget
    const getValue = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement)?.value ?? ''

    const endereco = {
      nome: getValue('nome'),
      telefone: getValue('telefone'),
      cep: getValue('cep'),
      logradouro: getValue('logradouro'),
      numero: getValue('numero'),
      complemento: getValue('complemento'),
      bairro: getValue('bairro'),
      cidade: getValue('cidade'),
      estado: getValue('estado'),
    }

    const payload = {
      endereco,
      itens: items.map(i => ({
        produto_id: i.produto.id,
        lojista_id: i.produto.lojista_id,
        nome_produto: i.produto.nome,
        preco_unitario: i.produto.preco,
        quantidade: i.quantidade,
        tamanho: i.tamanho,
      })),
    }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const body = await res.json().catch(() => ({}))

    if (!res.ok) {
      setErro(body.error ?? 'Erro ao processar pedido. Tente novamente.')
      setLoading(false)
      return
    }

    // Redirecionar para MercadoPago
    if (body.init_point) {
      clearCart()
      window.location.href = body.init_point
    } else {
      setErro('Não foi possível iniciar o pagamento.')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        Seu carrinho está vazio. <a href="/loja" className="text-primary-600 hover:underline">Voltar à loja</a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
      {/* Endereço */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Endereço de entrega</h2>

        <div className="card p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
            <input
              name="nome"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
            <input
              name="telefone"
              type="tel"
              required
              placeholder="51999999999"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
              <input
                name="cep"
                required
                placeholder="90000-000"
                maxLength={9}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input
                name="estado"
                defaultValue="RS"
                maxLength={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro *</label>
            <input
              name="logradouro"
              required
              placeholder="Rua, Avenida..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
              <input
                name="numero"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
              <input
                name="complemento"
                placeholder="Apto, Bloco..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
              <input
                name="bairro"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
              <input
                name="cidade"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">E-mail para confirmação: <strong>{userEmail}</strong></p>
        </div>
      </div>

      {/* Resumo */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Resumo do pedido</h2>
        <div className="card p-5 sticky top-20 space-y-4">
          <div className="space-y-2">
            {items.map(item => (
              <div key={`${item.produto.id}::${item.tamanho ?? ''}`} className="flex justify-between text-sm text-gray-600">
                <span className="truncate max-w-[200px]">
                  {item.produto.nome}
                  {item.tamanho ? ` (${item.tamanho})` : ''}
                  {' '}× {item.quantidade}
                </span>
                <span className="font-medium">{formatCurrency(item.produto.preco * item.quantidade)}</span>
              </div>
            ))}
          </div>
          <hr className="border-gray-100" />
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <p className="text-xs text-gray-400">Frete a combinar com cada lojista.</p>

          {erro && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{erro}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processando...
              </>
            ) : (
              '💳 Pagar com MercadoPago'
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Pagamento seguro via MercadoPago. Pix, cartão e boleto.
          </p>
        </div>
      </div>
    </form>
  )
}
