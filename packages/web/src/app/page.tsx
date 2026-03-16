import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getNoticiasPublicadas } from '@/lib/db/noticias'
import { getEventosAprovados } from '@/lib/db/eventos'
import { getProdutosAtivos } from '@/lib/db/produtos'
import { formatDate, formatCurrency } from '@/lib/utils'

export const revalidate = 1800

export default async function HomePage() {
  const [noticias, eventos, produtos] = await Promise.all([
    getNoticiasPublicadas(3).catch(() => []),
    getEventosAprovados(4).catch(() => []),
    getProdutosAtivos({ limit: 4 }).catch(() => []),
  ])

  return (
    <>
      <Header />
      <main>

        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-700 to-primary-500 text-white py-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              O esporte amador gaúcho<br className="hidden md:block" /> em um só lugar
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              Notícias, eventos, atletas, clubes e produtos esportivos do Rio Grande do Sul.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/noticias" className="bg-white text-primary-700 hover:bg-primary-50 font-semibold py-3 px-6 rounded-xl transition-colors">
                📰 Notícias
              </Link>
              <Link href="/eventos" className="bg-white text-primary-700 hover:bg-primary-50 font-semibold py-3 px-6 rounded-xl transition-colors">
                📅 Eventos
              </Link>
              <Link href="/loja" className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                🛒 Loja Esportiva
              </Link>
              <Link href="/ofertas" className="border border-white/50 hover:border-white text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                🏷️ Ofertas
              </Link>
            </div>
          </div>
        </section>

        {/* Três pilares */}
        <section className="py-12 px-4 bg-white">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">📰</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Portal de Notícias</h2>
              <p className="text-sm text-gray-500 mb-4">Cobertura completa do esporte amador gaúcho com feeds das principais federações.</p>
              <Link href="/noticias" className="text-primary-600 text-sm font-medium hover:underline">Ver notícias →</Link>
            </div>
            <div className="rounded-2xl border border-primary-100 bg-primary-50 p-6 text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">🛒</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Loja Esportiva</h2>
              <p className="text-sm text-gray-500 mb-4">Produtos de lojistas esportivos do RS. Chuteiras, roupas, equipamentos e muito mais.</p>
              <Link href="/loja" className="text-primary-600 text-sm font-medium hover:underline">Ver produtos →</Link>
            </div>
            <div className="rounded-2xl border border-accent-100 bg-accent-50 p-6 text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">🏷️</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Compras Coletivas</h2>
              <p className="text-sm text-gray-500 mb-4">Ofertas exclusivas em serviços esportivos: aulas, academias, personal trainer e mais.</p>
              <Link href="/ofertas" className="text-accent-600 text-sm font-medium hover:underline">Ver ofertas →</Link>
            </div>
          </div>
        </section>

        {/* Últimas Notícias */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Últimas Notícias</h2>
              <Link href="/noticias" className="text-primary-600 hover:underline text-sm font-medium">Ver todas →</Link>
            </div>
            {noticias.length === 0 ? (
              <p className="text-gray-400 text-center py-10">Nenhuma notícia publicada ainda.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {noticias.map((noticia) => (
                  <article key={noticia.id} className="card hover:shadow-md transition-shadow">
                    {noticia.imagem_url ? (
                      <div className="relative h-40 overflow-hidden">
                        <Image src={noticia.imagem_url} alt={noticia.titulo} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                      </div>
                    ) : (
                      <div className="bg-gray-100 h-40 flex items-center justify-center text-gray-300 text-sm">
                        {noticia.esporte?.nome ?? 'Notícia'}
                      </div>
                    )}
                    <div className="p-4">
                      {noticia.esporte && <span className="badge-green mb-2">{noticia.esporte.nome}</span>}
                      <h3 className="font-semibold text-gray-900 mt-2 mb-1 line-clamp-2">
                        <Link href={`/noticias/${noticia.slug}`} className="hover:text-primary-600">{noticia.titulo}</Link>
                      </h3>
                      {noticia.resumo && <p className="text-gray-500 text-sm line-clamp-2">{noticia.resumo}</p>}
                      <p className="text-xs text-gray-400 mt-3">{noticia.fonte_nome} · {formatDate(noticia.publicado_at ?? noticia.created_at)}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Produtos em destaque */}
        {produtos.length > 0 && (
          <section className="py-12 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">🛒 Loja Esportiva</h2>
                <Link href="/loja" className="text-primary-600 hover:underline text-sm font-medium">Ver todos →</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {produtos.map(produto => (
                  <Link key={produto.id} href={`/loja/${produto.slug}`} className="card hover:shadow-md transition-shadow group">
                    <div className="relative h-40 bg-gray-100">
                      {produto.imagens[0] ? (
                        <Image src={produto.imagens[0]} alt={produto.nome} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="h-full flex items-center justify-center text-3xl">🏅</div>
                      )}
                      {produto.preco_original && produto.preco_original > produto.preco && (
                        <span className="absolute top-2 left-2 bg-accent-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          -{Math.round((1 - produto.preco / produto.preco_original) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{produto.lojista?.nome_loja}</p>
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-snug">{produto.nome}</h3>
                      <p className="font-bold text-primary-700 mt-1">{formatCurrency(produto.preco)}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href="/cadastrar-lojista" className="text-sm text-gray-400 hover:text-primary-600 transition-colors">
                  Tem uma loja esportiva? <span className="underline">Venda no portal →</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Próximos Eventos */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">📅 Próximos Eventos</h2>
              <Link href="/eventos" className="text-primary-600 hover:underline text-sm font-medium">Ver calendário →</Link>
            </div>
            {eventos.length === 0 ? (
              <p className="text-gray-400 text-center py-10">Nenhum evento cadastrado ainda.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventos.map((evento) => {
                  const data = new Date(evento.data_inicio + 'T12:00:00')
                  return (
                    <div key={evento.id} className="card p-4 flex gap-4">
                      <div className="bg-primary-600 text-white rounded-xl p-3 text-center min-w-[60px] flex-shrink-0">
                        <div className="text-xs font-medium uppercase">{data.toLocaleDateString('pt-BR', { month: 'short' })}</div>
                        <div className="text-2xl font-bold leading-none mt-0.5">{data.getDate()}</div>
                      </div>
                      <div className="min-w-0">
                        {evento.esporte && <span className="badge-gray mb-1">{evento.esporte.nome}</span>}
                        <h3 className="font-semibold text-gray-900 truncate">{evento.titulo}</h3>
                        <p className="text-sm text-gray-500">{evento.local_cidade}, {evento.local_estado}</p>
                        {evento.gratuito && <span className="badge-green mt-1">Gratuito</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTAs finais */}
        <section className="py-14 px-4 bg-primary-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Faça parte do esporte gaúcho</h2>
            <p className="text-primary-100 mb-8">Divulgue seu evento, cadastre seu atleta ou abra sua loja no maior portal esportivo do RS.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/cadastrar-evento" className="bg-white text-primary-700 hover:bg-primary-50 font-semibold py-3 px-6 rounded-xl transition-colors">
                + Cadastrar Evento
              </Link>
              <Link href="/cadastrar-atleta" className="border border-white/50 hover:border-white text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                + Cadastrar Atleta
              </Link>
              <Link href="/cadastrar-lojista" className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                🛒 Abrir minha loja
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
