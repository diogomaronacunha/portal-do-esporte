import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { getLojistaPorUsuario } from '@/lib/db/lojistas'
import { getProdutosDoLojista } from '@/lib/db/produtos'
import { formatCurrency } from '@/lib/utils'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Minha Loja' }

export default async function MinhaLojaPage({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string }>
}) {
  const { novo } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/minha-loja')

  const lojista = await getLojistaPorUsuario(user.id).catch(() => null)

  // Pedidos recebidos pela loja (via itens que referenciam lojista_id)
  const pedidosRecebidos = lojista
    ? await supabase
        .from('pedidos_itens')
        .select('pedido_id, nome_produto, quantidade, tamanho, preco_unitario, pedido:pedidos(id, status, created_at, endereco_entrega)')
        .eq('lojista_id', lojista.id)
        .order('pedido_id', { ascending: false })
        .limit(20)
        .then(r => r.data ?? [])
    : []

  if (!lojista) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex flex-col items-center justify-center py-20 px-4 text-center">
          <p className="text-lg font-medium text-gray-700 mb-4">Você ainda não tem uma loja cadastrada.</p>
          <Link href="/cadastrar-lojista" className="btn-primary">Cadastrar minha loja</Link>
        </main>
        <Footer />
      </>
    )
  }

  const produtos = await getProdutosDoLojista(lojista.id).catch(() => [])

  const statusBadge = {
    pendente: 'bg-yellow-100 text-yellow-700',
    aprovado: 'bg-green-100 text-green-700',
    rejeitado: 'bg-red-100 text-red-700',
    suspenso: 'bg-gray-100 text-gray-500',
  } as const

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {novo && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-6">
              ✓ Loja cadastrada com sucesso! Nossa equipe irá analisar em breve.
            </div>
          )}

          {/* Header da loja */}
          <div className="card p-5 flex items-center gap-4 mb-6">
            <div className="relative w-16 h-16 flex-shrink-0 rounded-full bg-gray-100 overflow-hidden">
              {lojista.logo_url ? (
                <Image src={lojista.logo_url} alt={lojista.nome_loja} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{lojista.nome_loja}</h1>
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${statusBadge[lojista.status as keyof typeof statusBadge] ?? ''}`}>
                {lojista.status}
              </span>
            </div>
            {lojista.status === 'aprovado' && (
              <Link href={`/lojistas/${lojista.slug}`} className="text-sm text-primary-600 hover:underline">
                Ver página pública →
              </Link>
            )}
          </div>

          {lojista.status !== 'aprovado' && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm px-4 py-3 rounded-xl mb-6">
              Sua loja está {lojista.status === 'pendente' ? 'aguardando aprovação' : 'suspensa'}. Você poderá adicionar produtos após a aprovação.
            </div>
          )}

          {/* Produtos */}
          {lojista.status === 'aprovado' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Meus produtos ({produtos.length})</h2>
                <Link href="/minha-loja/novo-produto" className="btn-primary text-sm">
                  + Novo produto
                </Link>
              </div>

              {produtos.length === 0 ? (
                <div className="card p-10 text-center text-gray-400">
                  <p className="mb-3">Você ainda não tem produtos cadastrados.</p>
                  <Link href="/minha-loja/novo-produto" className="text-primary-600 hover:underline text-sm">
                    Adicionar primeiro produto
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {produtos.map(p => {
                    const statusP = {
                      pendente: 'bg-yellow-100 text-yellow-700',
                      ativo: 'bg-green-100 text-green-700',
                      rejeitado: 'bg-red-100 text-red-700',
                      pausado: 'bg-gray-100 text-gray-500',
                    } as const
                    return (
                      <div key={p.id} className="card overflow-hidden">
                        <div className="relative h-32 bg-gray-100">
                          {p.imagens[0] ? (
                            <Image src={p.imagens[0]} alt={p.nome} fill className="object-cover" />
                          ) : (
                            <div className="h-full flex items-center justify-center text-3xl">🏅</div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-sm text-gray-900 line-clamp-2">{p.nome}</p>
                          <p className="font-bold text-primary-700 text-sm mt-1">{formatCurrency(p.preco)}</p>
                          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1.5 ${statusP[p.status as keyof typeof statusP] ?? ''}`}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
          {/* Pedidos recebidos */}
          {lojista.status === 'aprovado' && pedidosRecebidos.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pedidos recebidos</h2>
              <div className="space-y-3">
                {pedidosRecebidos.map((item, idx) => {
                  const pedido = (Array.isArray(item.pedido) ? item.pedido[0] : item.pedido) as { id: string; status: string; created_at: string; endereco_entrega: Record<string, string> } | null
                  const statusMap: Record<string, { label: string; color: string }> = {
                    aguardando_pagamento: { label: 'Aguardando pag.', color: 'text-yellow-600 bg-yellow-50' },
                    pago: { label: 'Pago ✓', color: 'text-green-600 bg-green-50' },
                    em_separacao: { label: 'Em separação', color: 'text-blue-600 bg-blue-50' },
                    enviado: { label: 'Enviado', color: 'text-blue-600 bg-blue-50' },
                    entregue: { label: 'Entregue', color: 'text-green-600 bg-green-50' },
                    cancelado: { label: 'Cancelado', color: 'text-red-600 bg-red-50' },
                  }
                  const s = pedido ? (statusMap[pedido.status] ?? { label: pedido.status, color: 'text-gray-600 bg-gray-50' }) : null
                  const endereco = pedido?.endereco_entrega ?? {}

                  return (
                    <div key={idx} className="card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-900">
                            {item.nome_produto}{item.tamanho ? ` (${item.tamanho})` : ''} × {item.quantidade}
                          </p>
                          <p className="font-bold text-primary-700 text-sm">{formatCurrency(item.preco_unitario * item.quantidade)}</p>
                          {endereco.nome && (
                            <p className="text-xs text-gray-400 mt-1">
                              📦 {endereco.nome} — {endereco.logradouro}, {endereco.numero}, {endereco.cidade}/{endereco.estado}
                            </p>
                          )}
                          {endereco.telefone && (
                            <p className="text-xs text-gray-400">📞 {endereco.telefone}</p>
                          )}
                        </div>
                        {s && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${s.color}`}>
                            {s.label}
                          </span>
                        )}
                      </div>
                      {pedido && (
                        <p className="text-xs text-gray-300 mt-2">#{pedido.id.slice(0, 8)} · {new Date(pedido.created_at).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
