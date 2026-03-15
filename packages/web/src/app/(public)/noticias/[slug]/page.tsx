import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getNoticiaPorSlug } from '@/lib/db/noticias'
import { formatDate } from '@/lib/utils'

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const noticia = await getNoticiaPorSlug(slug)
    if (!noticia) return { title: 'Notícia não encontrada' }
    return {
      title: noticia.titulo,
      description: noticia.resumo ?? undefined,
      openGraph: {
        title: noticia.titulo,
        description: noticia.resumo ?? undefined,
        images: noticia.imagem_url ? [noticia.imagem_url] : [],
        type: 'article',
      },
    }
  } catch {
    return { title: 'Notícia' }
  }
}

export default async function NoticiaPage({ params }: Props) {
  const { slug } = await params

  let noticia
  try {
    noticia = await getNoticiaPorSlug(slug)
  } catch {
    notFound()
  }

  if (!noticia) notFound()

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Início</Link>
          {' / '}
          <Link href="/noticias" className="hover:text-primary-600">Notícias</Link>
          {noticia.esporte && (
            <>
              {' / '}
              <span>{noticia.esporte.nome}</span>
            </>
          )}
        </nav>

        {/* Header */}
        {noticia.esporte && (
          <span className="badge-green mb-3">{noticia.esporte.nome}</span>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-4 leading-tight">
          {noticia.titulo}
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span>Fonte: <strong>{noticia.fonte_nome}</strong></span>
          {noticia.publicado_at && <span>{formatDate(noticia.publicado_at)}</span>}
        </div>

        {/* Imagem */}
        {noticia.imagem_url && (
          <div className="relative h-72 rounded-xl overflow-hidden mb-8 bg-gray-100">
            <Image
              src={noticia.imagem_url}
              alt={noticia.titulo}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Resumo */}
        {noticia.resumo && (
          <p className="text-lg text-gray-600 font-medium mb-6 leading-relaxed border-l-4 border-primary-400 pl-4">
            {noticia.resumo}
          </p>
        )}

        {/* Conteúdo */}
        {noticia.conteudo ? (
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
          />
        ) : (
          <p className="text-gray-500">
            Conteúdo completo disponível na fonte original.
          </p>
        )}

        {/* Link para fonte original */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            Esta notícia foi agregada de <strong>{noticia.fonte_nome}</strong>.
          </p>
          <a
            href={noticia.fonte_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline text-sm font-medium"
          >
            Ler notícia completa no site original →
          </a>
        </div>

        <div className="mt-8">
          <Link href="/noticias" className="text-primary-600 hover:underline text-sm">
            ← Voltar para notícias
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
