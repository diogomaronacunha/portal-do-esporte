import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AdicionarCarrinhoButton from './AdicionarCarrinhoButton'
import { getProdutoPorSlug, getProdutosAtivos } from '@/lib/db/produtos'
import { formatCurrency } from '@/lib/utils'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const produto = await getProdutoPorSlug(slug)
  if (!produto) return {}
  return {
    title: produto.nome,
    description: produto.descricao ?? `Compre ${produto.nome} no Portal do Esporte.`,
  }
}

export default async function ProdutoPage({ params }: Props) {
  const { slug } = await params
  const produto = await getProdutoPorSlug(slug)
  if (!produto) notFound()

  const desconto =
    produto.preco_original && produto.preco_original > produto.preco
      ? Math.round((1 - produto.preco / produto.preco_original) * 100)
      : null

  const relacionados = await getProdutosAtivos({
    categoriaSlug: produto.categoria?.slug,
    limit: 4,
  }).catch(() => [])

  const imagens = produto.imagens.length > 0 ? produto.imagens : []

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-4 py-3 text-sm text-gray-400">
          <Link href="/loja" className="hover:text-primary-600">Loja</Link>
          {produto.categoria && (
            <>
              {' / '}
              <Link href={`/loja?categoria=${produto.categoria.slug}`} className="hover:text-primary-600">
                {produto.categoria.nome}
              </Link>
            </>
          )}
          {' / '}
          <span className="text-gray-700">{produto.nome}</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-12">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Imagens */}
            <div>
              {imagens.length > 0 ? (
                <div className="relative h-80 md:h-[480px] bg-gray-100 rounded-2xl overflow-hidden">
                  <Image
                    src={imagens[0]}
                    alt={produto.nome}
                    fill
                    className="object-contain"
                    priority
                  />
                  {desconto && (
                    <span className="absolute top-4 left-4 bg-accent-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      -{desconto}%
                    </span>
                  )}
                </div>
              ) : (
                <div className="h-80 md:h-[480px] bg-gradient-to-br from-accent-100 to-primary-100 rounded-2xl flex items-center justify-center">
                  <span className="text-7xl">🏅</span>
                </div>
              )}
              {imagens.length > 1 && (
                <div className="flex gap-2 mt-3">
                  {imagens.slice(1).map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <Image src={img} alt={`${produto.nome} ${i + 2}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-5">
              {produto.lojista && (
                <Link href={`/lojistas/${produto.lojista.slug}`} className="text-sm text-primary-600 hover:underline font-medium">
                  {produto.lojista.nome_loja}
                </Link>
              )}

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">{produto.nome}</h1>

              {produto.esporte && (
                <span className="self-start text-xs bg-primary-50 text-primary-700 border border-primary-200 px-2.5 py-1 rounded-full font-medium">
                  {produto.esporte.nome}
                </span>
              )}

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary-700">{formatCurrency(produto.preco)}</span>
                {produto.preco_original && produto.preco_original > produto.preco && (
                  <span className="text-lg text-gray-400 line-through">{formatCurrency(produto.preco_original)}</span>
                )}
              </div>

              {produto.descricao && (
                <p className="text-gray-600 text-sm leading-relaxed">{produto.descricao}</p>
              )}

              <AdicionarCarrinhoButton produto={produto} />

              {produto.lojista?.whatsapp && (
                <a
                  href={`https://wa.me/${produto.lojista.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Vi o produto "${produto.nome}" no Portal do Esporte e tenho interesse.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:border-green-500 hover:text-green-600 transition-colors"
                >
                  💬 Perguntar via WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Produtos relacionados */}
          {relacionados.filter(p => p.id !== produto.id).length > 0 && (
            <section className="mt-16">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Produtos relacionados</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relacionados
                  .filter(p => p.id !== produto.id)
                  .slice(0, 4)
                  .map(p => (
                    <Link key={p.id} href={`/loja/${p.slug}`} className="card hover:shadow-md transition-shadow group">
                      <div className="relative h-36 bg-gray-100">
                        {p.imagens[0] ? (
                          <Image src={p.imagens[0]} alt={p.nome} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="h-full flex items-center justify-center text-3xl">🏅</div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-400 mb-0.5">{p.lojista?.nome_loja}</p>
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{p.nome}</p>
                        <p className="mt-1.5 font-bold text-primary-700 text-sm">{formatCurrency(p.preco)}</p>
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
