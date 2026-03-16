import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getLojistaPorSlug } from '@/lib/db/lojistas'
import { getProdutosAtivos } from '@/lib/db/produtos'
import { formatCurrency } from '@/lib/utils'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lojista = await getLojistaPorSlug(slug)
  if (!lojista) return {}
  return { title: lojista.nome_loja, description: lojista.descricao ?? `Produtos de ${lojista.nome_loja} no Portal do Esporte.` }
}

export default async function LojistaPerfilPage({ params }: Props) {
  const { slug } = await params
  const [lojista, produtos] = await Promise.all([
    getLojistaPorSlug(slug),
    getProdutosAtivos({ limit: 24 }).catch(() => []),
  ])
  if (!lojista) notFound()

  const produtosLoja = produtos.filter(p => p.lojista?.slug === slug)

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Banner */}
        <div className="bg-primary-600 text-white py-10 px-4">
          <div className="max-w-6xl mx-auto flex items-center gap-5">
            <div className="relative w-20 h-20 flex-shrink-0 rounded-full bg-white/20 overflow-hidden">
              {lojista.logo_url ? (
                <Image src={lojista.logo_url} alt={lojista.nome_loja} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🏪</div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{lojista.nome_loja}</h1>
              {lojista.cidade && (
                <p className="text-primary-100 text-sm mt-1">📍 {lojista.cidade}{lojista.estado ? `, ${lojista.estado}` : ''}</p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {lojista.descricao && (
            <p className="text-gray-600 mb-8 max-w-2xl">{lojista.descricao}</p>
          )}

          <div className="flex items-center gap-4 mb-6">
            {lojista.whatsapp && (
              <a
                href={`https://wa.me/${lojista.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-green-600 hover:underline font-medium"
              >
                💬 WhatsApp
              </a>
            )}
            {lojista.instagram && (
              <a
                href={`https://instagram.com/${lojista.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-pink-600 hover:underline font-medium"
              >
                📸 Instagram
              </a>
            )}
            {lojista.website && (
              <a
                href={lojista.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary-600 hover:underline font-medium"
              >
                🌐 Site
              </a>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-5">Produtos da loja</h2>

          {produtosLoja.length === 0 ? (
            <p className="text-gray-400 text-center py-10">Nenhum produto cadastrado ainda.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {produtosLoja.map(produto => (
                <Link key={produto.id} href={`/loja/${produto.slug}`} className="card hover:shadow-md transition-shadow group">
                  <div className="relative h-44 bg-gray-100">
                    {produto.imagens[0] ? (
                      <Image src={produto.imagens[0]} alt={produto.nome} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-4xl">🏅</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-snug">{produto.nome}</h3>
                    <span className="font-bold text-primary-700 text-sm">{formatCurrency(produto.preco)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
