import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getNoticiasPublicadas } from '@/lib/db/noticias'
import { formatDate } from '@/lib/utils'

export const revalidate = 1800 // 30 minutos

export const metadata: Metadata = {
  title: 'Notícias',
  description: 'Últimas notícias do esporte amador gaúcho agregadas das federações do Rio Grande do Sul.',
}

export default async function NoticiasPage() {
  let noticias: Awaited<ReturnType<typeof getNoticiasPublicadas>> = []
  try {
    noticias = await getNoticiasPublicadas(24)
  } catch {
    // Banco ainda não configurado — exibe estado vazio
  }

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notícias</h1>
        <p className="text-gray-500 mb-8">
          Notícias agregadas das federações esportivas do Rio Grande do Sul.
        </p>

        {noticias.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">Nenhuma notícia publicada ainda.</p>
            <p className="text-sm mt-2">
              Em breve você encontrará aqui as últimas notícias das federações gaúchas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticias.map((noticia) => (
              <article key={noticia.id} className="card hover:shadow-md transition-shadow">
                {noticia.imagem_url ? (
                  <div className="relative h-44 bg-gray-100">
                    <Image
                      src={noticia.imagem_url}
                      alt={noticia.titulo}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <span className="text-primary-600 text-4xl">⚽</span>
                  </div>
                )}
                <div className="p-4">
                  {noticia.esporte && (
                    <span className="badge-green mb-2">{noticia.esporte.nome}</span>
                  )}
                  <h2 className="font-semibold text-gray-900 mt-2 mb-1 line-clamp-2 leading-snug">
                    <Link
                      href={`/noticias/${noticia.slug}`}
                      className="hover:text-primary-600 transition-colors"
                    >
                      {noticia.titulo}
                    </Link>
                  </h2>
                  {noticia.resumo && (
                    <p className="text-gray-500 text-sm line-clamp-2">{noticia.resumo}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                    <span>{noticia.fonte_nome}</span>
                    {noticia.publicado_at && <span>{formatDate(noticia.publicado_at)}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
