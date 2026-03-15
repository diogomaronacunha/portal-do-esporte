import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getNoticiasPublicadas } from '@/lib/db/noticias'
import { getEventosAprovados } from '@/lib/db/eventos'
import { formatDate } from '@/lib/utils'

export const revalidate = 1800 // 30 minutos

export default async function HomePage() {
  const [noticias, eventos] = await Promise.all([
    getNoticiasPublicadas(3).catch(() => []),
    getEventosAprovados(4).catch(() => []),
  ])

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-primary-600 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              O esporte amador gaúcho em um só lugar
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Notícias, eventos, atletas e clubes do Rio Grande do Sul.
              Apoiando o esporte de base desde 2026.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/eventos"
                className="bg-white text-primary-700 hover:bg-primary-50 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Ver Calendário de Eventos
              </Link>
              <Link
                href="/noticias"
                className="border border-white text-white hover:bg-primary-700 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Últimas Notícias
              </Link>
            </div>
          </div>
        </section>

        {/* Últimas Notícias */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Últimas Notícias</h2>
              <Link href="/noticias" className="text-primary-600 hover:underline text-sm font-medium">
                Ver todas →
              </Link>
            </div>

            {noticias.length === 0 ? (
              <p className="text-gray-400 text-center py-10">Nenhuma notícia publicada ainda.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {noticias.map((noticia) => (
                  <article key={noticia.id} className="card hover:shadow-md transition-shadow">
                    {noticia.imagem_url ? (
                      <div className="relative h-40 overflow-hidden">
                        <Image
                          src={noticia.imagem_url}
                          alt={noticia.titulo}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-100 h-40 flex items-center justify-center text-gray-300 text-sm">
                        {noticia.esporte?.nome ?? 'Notícia'}
                      </div>
                    )}
                    <div className="p-4">
                      {noticia.esporte && (
                        <span className="badge-green mb-2">{noticia.esporte.nome}</span>
                      )}
                      <h3 className="font-semibold text-gray-900 mt-2 mb-1 line-clamp-2">
                        <Link href={`/noticias/${noticia.slug}`} className="hover:text-primary-600">
                          {noticia.titulo}
                        </Link>
                      </h3>
                      {noticia.resumo && (
                        <p className="text-gray-500 text-sm line-clamp-2">{noticia.resumo}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-3">
                        {noticia.fonte_nome} · {formatDate(noticia.publicado_at ?? noticia.created_at)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Próximos Eventos */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Próximos Eventos</h2>
              <Link href="/eventos" className="text-primary-600 hover:underline text-sm font-medium">
                Ver calendário →
              </Link>
            </div>

            {eventos.length === 0 ? (
              <p className="text-gray-400 text-center py-10">Nenhum evento cadastrado ainda.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventos.map((evento) => {
                  const data = new Date(evento.data_inicio + 'T12:00:00')
                  return (
                    <div key={evento.id} className="card p-4 flex gap-4">
                      <div className="bg-primary-600 text-white rounded-lg p-3 text-center min-w-[60px] flex-shrink-0">
                        <div className="text-xs font-medium uppercase">
                          {data.toLocaleDateString('pt-BR', { month: 'short' })}
                        </div>
                        <div className="text-2xl font-bold leading-none mt-0.5">
                          {data.getDate()}
                        </div>
                      </div>
                      <div className="min-w-0">
                        {evento.esporte && (
                          <span className="badge-gray mb-1">{evento.esporte.nome}</span>
                        )}
                        <h3 className="font-semibold text-gray-900 truncate">{evento.titulo}</h3>
                        <p className="text-sm text-gray-500">{evento.local_cidade}, {evento.local_estado}</p>
                        {evento.gratuito && (
                          <span className="badge-green mt-1">Gratuito</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Cadastro */}
        <section className="py-12 px-4 bg-primary-600 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Tem um evento esportivo?</h2>
          <p className="text-primary-100 mb-6">
            Divulgue gratuitamente no maior portal do esporte amador gaúcho.
          </p>
          <Link
            href="/cadastrar-evento"
            className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-block"
          >
            Cadastrar Evento
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
