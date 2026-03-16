import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { getPrestadorPorUsuario } from '@/lib/db/prestadores'
import { formatCurrency } from '@/lib/utils'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Meu Espaço — Prestador' }

export default async function MeuEspacoPage({
  searchParams,
}: {
  searchParams: Promise<{ nova?: string }>
}) {
  const { nova } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/meu-espaco')

  const prestador = await getPrestadorPorUsuario(user.id).catch(() => null)

  if (!prestador) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">🏢</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Você não tem um espaço cadastrado</h1>
            <p className="text-gray-500 mb-6">
              Cadastre seu negócio esportivo para publicar ofertas e promoções no portal.
            </p>
            <Link href="/cadastrar-prestador" className="btn-primary inline-block">
              Cadastrar meu negócio
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (prestador.status === 'pendente') {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Cadastro em análise</h1>
            <p className="text-gray-500">
              Seu cadastro está sendo analisado pela equipe do Portal do Esporte.
              Em breve você poderá publicar ofertas.
            </p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (prestador.status === 'rejeitado') {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Cadastro não aprovado</h1>
            <p className="text-gray-500 mb-6">
              Seu cadastro não foi aprovado. Entre em contato com a equipe do portal para mais informações.
            </p>
            <Link href="/" className="btn-primary inline-block">Ir para o início</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Ofertas do prestador
  const { data: ofertas } = await supabase
    .from('ofertas')
    .select('id, titulo, slug, status, preco_oferta, quantidade_maxima, quantidade_vendida, data_fim, created_at')
    .eq('prestador_id', prestador.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const statusLabel: Record<string, string> = {
    pendente: '⏳ Aguardando aprovação',
    ativa: '✅ Ativa',
    encerrada: '🔒 Encerrada',
    rejeitada: '❌ Rejeitada',
  }

  const statusColor: Record<string, string> = {
    pendente: 'text-yellow-600 bg-yellow-50',
    ativa: 'text-green-600 bg-green-50',
    encerrada: 'text-gray-500 bg-gray-50',
    rejeitada: 'text-red-600 bg-red-50',
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="bg-primary-600 text-white py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-primary-200 text-sm mb-1">Painel do Prestador</p>
            <h1 className="text-2xl font-bold">{prestador.nome_empresa}</h1>
            {prestador.cidade && (
              <p className="text-primary-100 text-sm mt-1">{prestador.cidade}, {prestador.estado}</p>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {nova === '1' && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6 text-sm font-medium">
              ✅ Oferta enviada para análise! Você será notificado quando for aprovada.
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Minhas Ofertas</h2>
            <Link href="/meu-espaco/nova-oferta" className="btn-primary text-sm">
              + Nova oferta
            </Link>
          </div>

          {!ofertas?.length ? (
            <div className="card p-10 text-center">
              <p className="text-gray-400 mb-4">Você ainda não publicou nenhuma oferta.</p>
              <Link href="/meu-espaco/nova-oferta" className="btn-primary inline-block">
                Publicar minha primeira oferta
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {ofertas.map((oferta) => {
                const vendas = oferta.quantidade_vendida ?? 0
                const max = oferta.quantidade_maxima
                return (
                  <div key={oferta.id} className="card p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900">{oferta.titulo}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[oferta.status] ?? 'text-gray-500 bg-gray-50'}`}>
                          {statusLabel[oferta.status] ?? oferta.status}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-gray-400">
                        <span>Preço: {formatCurrency(oferta.preco_oferta)}</span>
                        <span>{vendas} venda{vendas !== 1 ? 's' : ''}{max ? ` / ${max}` : ''}</span>
                        {oferta.data_fim && (
                          <span>Até {new Date(oferta.data_fim + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                    {oferta.status === 'ativa' && (
                      <Link href={`/ofertas/${oferta.slug}`} className="text-xs text-primary-600 hover:underline flex-shrink-0">
                        Ver →
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
