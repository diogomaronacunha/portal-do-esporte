import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Calendar, Newspaper, User, LogOut, ShoppingBag } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Meu Perfil | Portal do Esporte',
}

export default async function MeuPerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: eventosUsuario }, { data: noticiasCount }, { data: pedidosUsuario }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('eventos')
      .select('id, titulo, status, data_inicio, created_at')
      .eq('criado_por', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('noticias')
      .select('id', { count: 'exact', head: true })
      .eq('autor_id', user.id),
    supabase
      .from('pedidos')
      .select('id, status, total, created_at, pedidos_itens(nome_produto, quantidade, tamanho)')
      .eq('comprador_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const nome = profile?.nome ?? user.email?.split('@')[0] ?? 'Usuário'
  const isAdmin = profile?.role === 'admin'

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-primary-600 text-white py-10 px-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-400 flex items-center justify-center text-2xl font-bold">
              {nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{nome}</h1>
              <p className="text-primary-200 text-sm">{user.email}</p>
              {isAdmin && (
                <span className="mt-1 inline-block bg-accent-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  Administrador
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="card p-5 text-center">
              <Calendar className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{eventosUsuario?.length ?? 0}</p>
              <p className="text-sm text-gray-500">Eventos cadastrados</p>
            </div>
            <div className="card p-5 text-center">
              <Newspaper className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{noticiasCount?.length ?? 0}</p>
              <p className="text-sm text-gray-500">Notícias publicadas</p>
            </div>
            <div className="card p-5 text-center col-span-2 md:col-span-1">
              <User className="w-6 h-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Atleta amador?</p>
              <Link href="/cadastrar-atleta" className="text-primary-600 text-sm hover:underline">
                Cadastrar perfil →
              </Link>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Ações rápidas</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/cadastrar-evento" className="btn-primary text-sm">
                + Cadastrar evento
              </Link>
              <Link href="/cadastrar-atleta" className="px-4 py-2 border border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg text-sm font-medium transition-colors">
                + Cadastrar atleta
              </Link>
              {isAdmin && (
                <Link href="/admin" className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition-colors">
                  Painel Admin
                </Link>
              )}
            </div>
          </div>

          {/* Meus eventos */}
          {eventosUsuario && eventosUsuario.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Meus eventos cadastrados</h2>
              <div className="space-y-3">
                {eventosUsuario.map((evento) => {
                  const statusColorMap: Record<string, string> = {
                    pendente: 'text-yellow-600 bg-yellow-50',
                    aprovado: 'text-green-600 bg-green-50',
                    rejeitado: 'text-red-600 bg-red-50',
                    publicado: 'text-green-600 bg-green-50',
                  }
                  const statusColor = statusColorMap[evento.status] ?? 'text-gray-600 bg-gray-50'

                  return (
                    <div key={evento.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{evento.titulo}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(evento.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR')} · Enviado em {formatDate(evento.created_at)}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor} capitalize flex-shrink-0`}>
                        {evento.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Meus pedidos */}
          {pedidosUsuario && pedidosUsuario.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag size={18} className="text-primary-600" />
                Meus pedidos
              </h2>
              <div className="space-y-3">
                {pedidosUsuario.map((pedido) => {
                  const statusMap: Record<string, { label: string; color: string }> = {
                    aguardando_pagamento: { label: 'Aguardando pagamento', color: 'text-yellow-600 bg-yellow-50' },
                    pago: { label: 'Pago', color: 'text-green-600 bg-green-50' },
                    em_separacao: { label: 'Em separação', color: 'text-blue-600 bg-blue-50' },
                    enviado: { label: 'Enviado', color: 'text-blue-600 bg-blue-50' },
                    entregue: { label: 'Entregue', color: 'text-green-600 bg-green-50' },
                    cancelado: { label: 'Cancelado', color: 'text-red-600 bg-red-50' },
                  }
                  const s = statusMap[pedido.status] ?? { label: pedido.status, color: 'text-gray-600 bg-gray-50' }
                  const itens = (pedido.pedidos_itens as { nome_produto: string; quantidade: number; tamanho: string | null }[]) ?? []

                  return (
                    <div key={pedido.id} className="py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-400">{formatDate(pedido.created_at)} · #{pedido.id.slice(0, 8)}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {itens.slice(0, 2).map((i, idx) => (
                          <span key={idx}>{i.nome_produto}{i.tamanho ? ` (${i.tamanho})` : ''} × {i.quantidade}{idx < Math.min(itens.length, 2) - 1 ? ', ' : ''}</span>
                        ))}
                        {itens.length > 2 && <span className="text-gray-400"> +{itens.length - 2} itens</span>}
                      </p>
                      <p className="font-bold text-primary-700 text-sm mt-1">{formatCurrency(pedido.total)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Logout */}
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
            >
              <LogOut size={16} />
              Sair da conta
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
