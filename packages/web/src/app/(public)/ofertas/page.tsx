import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Paginacao from '@/components/Paginacao'
import { getOfertasAtivas, getCategoriasOferta } from '@/lib/db/ofertas'
import { formatCurrency } from '@/lib/utils'

export const revalidate = 900

export const metadata: Metadata = {
  title: 'Ofertas Esportivas',
  description: 'Compras coletivas e ofertas exclusivas em serviços esportivos do Rio Grande do Sul.',
}

const POR_PAGINA = 20

type Props = { searchParams: Promise<{ q?: string; categoria?: string; pagina?: string }> }

export default async function OfertasPage({ searchParams }: Props) {
  const { q, categoria, pagina: paginaStr } = await searchParams
  const paginaAtual = Math.max(1, parseInt(paginaStr ?? '1', 10))
  const offset = (paginaAtual - 1) * POR_PAGINA

  const [ofertas, categorias] = await Promise.all([
    getOfertasAtivas({ q, categoriaSlug: categoria, limit: POR_PAGINA, offset }).catch(() => []),
    getCategoriasOferta().catch(() => []),
  ])

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="bg-accent-600 text-white py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">🏷️ Compras Coletivas</h1>
            <p className="text-accent-100">Ofertas exclusivas em serviços esportivos do Rio Grande do Sul.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Busca */}
          <form method="GET" className="mb-6">
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar ofertas..."
              className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
            />
          </form>

          {/* Filtro categorias */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href="/ofertas"
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${!categoria ? 'bg-accent-500 text-white border-accent-500' : 'border-gray-300 text-gray-600 hover:border-accent-400'}`}
            >
              Todas
            </Link>
            {categorias.map(cat => (
              <Link
                key={cat.slug}
                href={`/ofertas?${new URLSearchParams({ ...(q ? { q } : {}), categoria: cat.slug }).toString()}`}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  categoria === cat.slug
                    ? 'bg-accent-500 text-white border-accent-500'
                    : 'border-gray-300 text-gray-600 hover:border-accent-400'
                }`}
              >
                {cat.icone} {cat.nome}
              </Link>
            ))}
          </div>

          {ofertas.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium">Nenhuma oferta disponível no momento.</p>
              {(q || categoria) && (
                <p className="text-sm mt-2">
                  <Link href="/ofertas" className="text-accent-600 hover:underline">Remover filtros</Link>
                </p>
              )}
              <p className="text-sm mt-4">
                Oferece serviços esportivos?{' '}
                <Link href="/cadastrar-prestador" className="text-accent-600 hover:underline">
                  Publique uma oferta
                </Link>
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ofertas.map(oferta => {
                  const desconto = Math.round((1 - oferta.preco_oferta / oferta.preco_original) * 100)
                  const esgotada = oferta.quantidade_maxima !== null && oferta.quantidade_vendida >= oferta.quantidade_maxima
                  const restam = oferta.quantidade_maxima !== null ? oferta.quantidade_maxima - oferta.quantidade_vendida : null
                  const venceEm = oferta.data_fim ? Math.ceil((new Date(oferta.data_fim).getTime() - Date.now()) / 86400000) : null

                  return (
                    <Link
                      key={oferta.id}
                      href={`/ofertas/${oferta.slug}`}
                      className={`card hover:shadow-lg transition-shadow group ${esgotada ? 'opacity-60 pointer-events-none' : ''}`}
                    >
                      <div className="relative h-48 bg-gradient-to-br from-accent-100 to-primary-100 overflow-hidden">
                        {oferta.imagem_url ? (
                          <Image src={oferta.imagem_url} alt={oferta.titulo} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="h-full flex items-center justify-center text-5xl">
                            {oferta.categoria?.icone ?? '🏷️'}
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-accent-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                          -{desconto}%
                        </span>
                        {esgotada && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">Esgotada</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-400 mb-1">{oferta.prestador?.nome_empresa} · {oferta.categoria?.nome}</p>
                        <h2 className="font-semibold text-gray-900 line-clamp-2 leading-snug">{oferta.titulo}</h2>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-xl font-bold text-accent-600">{formatCurrency(oferta.preco_oferta)}</span>
                          <span className="text-sm text-gray-400 line-through">{formatCurrency(oferta.preco_original)}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                          {restam !== null && !esgotada && (
                            <span className="text-orange-500 font-medium">⚡ {restam} restantes</span>
                          )}
                          {venceEm !== null && venceEm <= 7 && !esgotada && (
                            <span className="text-red-500 font-medium">⏳ {venceEm}d restantes</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
              <Suspense>
                <Paginacao total={ofertas.length} porPagina={POR_PAGINA} paginaAtual={paginaAtual} />
              </Suspense>
            </>
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-200 py-8 px-4 text-center">
          <p className="text-gray-600 mb-2">Oferece serviços esportivos no RS?</p>
          <Link href="/cadastrar-prestador" className="inline-block px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-colors">
            Publicar uma oferta
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
