import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Buscar' }

type Props = { searchParams: Promise<{ q?: string }> }

export default async function BuscarPage({ searchParams }: Props) {
  const { q } = await searchParams
  if (!q?.trim()) redirect('/')

  const termo = q.trim()
  const supabase = await createClient()

  const [{ data: noticias }, { data: eventos }, { data: produtos }, { data: atletas }, { data: ofertas }] = await Promise.all([
    supabase
      .from('noticias')
      .select('id, titulo, slug, imagem_url, fonte_nome, publicado_at, esporte:esportes(nome)')
      .eq('status', 'publicado')
      .ilike('titulo', `%${termo}%`)
      .limit(5),
    supabase
      .from('eventos')
      .select('id, titulo, slug, data_inicio, local_cidade, local_estado, esporte:esportes(nome)')
      .eq('status', 'aprovado')
      .ilike('titulo', `%${termo}%`)
      .limit(5),
    supabase
      .from('produtos')
      .select('id, nome, slug, preco, imagens, lojista:lojistas(nome_loja)')
      .eq('status', 'ativo')
      .ilike('nome', `%${termo}%`)
      .limit(4),
    supabase
      .from('atletas')
      .select('id, nome, slug, foto_url, cidade, estado')
      .eq('status', 'aprovado')
      .ilike('nome', `%${termo}%`)
      .limit(4),
    supabase
      .from('ofertas')
      .select('id, titulo, slug, preco_oferta, preco_original, categoria:categorias_oferta(nome,icone)')
      .eq('status', 'ativa')
      .ilike('titulo', `%${termo}%`)
      .limit(4),
  ])

  const total = (noticias?.length ?? 0) + (eventos?.length ?? 0) + (produtos?.length ?? 0) + (atletas?.length ?? 0) + (ofertas?.length ?? 0)

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Resultados para <span className="text-primary-600">&ldquo;{termo}&rdquo;</span>
          </h1>
          <p className="text-sm text-gray-400 mb-8">{total} resultado{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>

          {total === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium">Nenhum resultado encontrado.</p>
              <p className="text-sm mt-2">Tente outros termos de busca.</p>
            </div>
          )}

          {/* Notícias */}
          {!!noticias?.length && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">📰 Notícias</h2>
                <Link href={`/noticias?q=${encodeURIComponent(termo)}`} className="text-sm text-primary-600 hover:underline">Ver todas →</Link>
              </div>
              <div className="space-y-3">
                {noticias.map(n => (
                  <Link key={n.id} href={`/noticias/${n.slug}`} className="card p-4 flex gap-4 hover:shadow-md transition-shadow">
                    {n.imagem_url && (
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <Image src={n.imagem_url} alt={n.titulo} fill className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 line-clamp-2">{n.titulo}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.fonte_nome} · {formatDate(n.publicado_at ?? '')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Eventos */}
          {!!eventos?.length && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">📅 Eventos</h2>
                <Link href={`/eventos?q=${encodeURIComponent(termo)}`} className="text-sm text-primary-600 hover:underline">Ver todos →</Link>
              </div>
              <div className="space-y-3">
                {eventos.map(e => {
                  const data = new Date(e.data_inicio + 'T12:00:00')
                  return (
                    <div key={e.id} className="card p-4 flex gap-4">
                      <div className="bg-primary-600 text-white rounded-xl p-2 text-center min-w-[52px] flex-shrink-0">
                        <div className="text-xs font-medium uppercase">{data.toLocaleDateString('pt-BR', { month: 'short' })}</div>
                        <div className="text-xl font-bold leading-none">{data.getDate()}</div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{e.titulo}</p>
                        <p className="text-xs text-gray-400">{e.local_cidade}, {e.local_estado}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Produtos */}
          {!!produtos?.length && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">🛒 Produtos</h2>
                <Link href={`/loja?q=${encodeURIComponent(termo)}`} className="text-sm text-primary-600 hover:underline">Ver todos →</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {produtos.map((p: any) => (
                  <Link key={p.id} href={`/loja/${p.slug}`} className="card hover:shadow-md transition-shadow group">
                    <div className="relative h-28 bg-gray-100">
                      {p.imagens?.[0] ? (
                        <Image src={p.imagens[0]} alt={p.nome} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-2xl">🏅</div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-400">{Array.isArray(p.lojista) ? p.lojista[0]?.nome_loja : p.lojista?.nome_loja}</p>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{p.nome}</p>
                      <p className="text-sm font-bold text-primary-700 mt-1">{formatCurrency(p.preco)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Atletas */}
          {!!atletas?.length && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">🏅 Atletas</h2>
                <Link href={`/atletas?q=${encodeURIComponent(termo)}`} className="text-sm text-primary-600 hover:underline">Ver todos →</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {atletas.map((a: { id: string; nome: string; slug: string; foto_url: string | null; cidade: string | null; estado: string }) => (
                  <Link key={a.id} href={`/atletas/${a.slug}`} className="card p-4 text-center hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-full bg-gray-100 mx-auto mb-2 overflow-hidden relative">
                      {a.foto_url ? (
                        <Image src={a.foto_url} alt={a.nome} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                      )}
                    </div>
                    <p className="font-medium text-sm text-gray-900">{a.nome}</p>
                    {a.cidade && <p className="text-xs text-gray-400">{a.cidade}</p>}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Ofertas */}
          {!!ofertas?.length && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">🏷️ Ofertas</h2>
                <Link href={`/ofertas?q=${encodeURIComponent(termo)}`} className="text-sm text-accent-600 hover:underline">Ver todas →</Link>
              </div>
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {ofertas.map((o: any) => {
                  const desconto = Math.round((1 - o.preco_oferta / o.preco_original) * 100)
                  const cat = Array.isArray(o.categoria) ? o.categoria[0] : o.categoria
                  return (
                    <Link key={o.id} href={`/ofertas/${o.slug}`} className="card p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
                      <div>
                        <p className="text-xs text-gray-400">{cat?.icone} {cat?.nome}</p>
                        <p className="font-medium text-gray-900">{o.titulo}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-accent-600">{formatCurrency(o.preco_oferta)}</p>
                        <span className="text-xs bg-accent-500 text-white px-2 py-0.5 rounded-full">-{desconto}%</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
