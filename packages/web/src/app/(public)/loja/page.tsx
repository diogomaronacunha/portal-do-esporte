import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Paginacao from '@/components/Paginacao'
import { getProdutosAtivos, countProdutosAtivos } from '@/lib/db/produtos'
import { getCategoriasAtivas } from '@/lib/db/categorias'
import { formatCurrency } from '@/lib/utils'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Loja Esportiva',
  description: 'Produtos esportivos de lojistas do Rio Grande do Sul.',
}

const POR_PAGINA = 24

type Props = { searchParams: Promise<{ q?: string; categoria?: string; pagina?: string }> }

export default async function LojaPage({ searchParams }: Props) {
  const { q, categoria, pagina: paginaStr } = await searchParams
  const paginaAtual = Math.max(1, parseInt(paginaStr ?? '1', 10))
  const offset = (paginaAtual - 1) * POR_PAGINA

  const [produtos, total, categorias] = await Promise.all([
    getProdutosAtivos({ q, categoriaSlug: categoria, limit: POR_PAGINA, offset }).catch(() => []),
    countProdutosAtivos({ q }).catch(() => 0),
    getCategoriasAtivas().catch(() => []),
  ])

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="bg-primary-600 text-white py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Loja Esportiva</h1>
            <p className="text-primary-100">Produtos de lojistas esportivos do Rio Grande do Sul.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Busca */}
          <form method="GET" className="mb-6">
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar produtos..."
              className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </form>

          {/* Filtro de categorias */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href="/loja"
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                !categoria ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-600 hover:border-primary-400'
              }`}
            >
              Todos
            </Link>
            {categorias.map(cat => (
              <Link
                key={cat.slug}
                href={`/loja?${new URLSearchParams({ ...(q ? { q } : {}), categoria: cat.slug }).toString()}`}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  categoria === cat.slug
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-gray-300 text-gray-600 hover:border-primary-400'
                }`}
              >
                {cat.icone} {cat.nome}
              </Link>
            ))}
          </div>

          {produtos.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium">Nenhum produto encontrado.</p>
              {(q || categoria) && (
                <p className="text-sm mt-2">
                  <Link href="/loja" className="text-primary-600 hover:underline">Remover filtros</Link>
                </p>
              )}
              <p className="text-sm mt-4">
                Você tem uma loja esportiva?{' '}
                <Link href="/cadastrar-lojista" className="text-primary-600 hover:underline">
                  Cadastre-se como lojista
                </Link>
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-4">{total} produto{total !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {produtos.map(produto => (
                  <Link key={produto.id} href={`/loja/${produto.slug}`} className="card hover:shadow-md transition-shadow group">
                    <div className="relative">
                      {produto.imagens[0] ? (
                        <div className="relative h-44 bg-gray-100">
                          <Image src={produto.imagens[0]} alt={produto.nome} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className="h-44 bg-gradient-to-br from-accent-100 to-primary-100 flex items-center justify-center">
                          <span className="text-4xl">🏅</span>
                        </div>
                      )}
                      {produto.preco_original && produto.preco_original > produto.preco && (
                        <span className="absolute top-2 left-2 bg-accent-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          -{Math.round((1 - produto.preco / produto.preco_original) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-400 mb-1">{produto.lojista?.nome_loja}</p>
                      <h2 className="font-medium text-gray-900 text-sm line-clamp-2 leading-snug">{produto.nome}</h2>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-bold text-primary-700">{formatCurrency(produto.preco)}</span>
                        {produto.preco_original && produto.preco_original > produto.preco && (
                          <span className="text-xs text-gray-400 line-through">{formatCurrency(produto.preco_original)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Suspense>
                <Paginacao total={total} porPagina={POR_PAGINA} paginaAtual={paginaAtual} />
              </Suspense>
            </>
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-200 py-8 px-4 text-center">
          <p className="text-gray-600 mb-2">Tem uma loja esportiva no RS?</p>
          <Link href="/cadastrar-lojista" className="btn-primary inline-block">
            Vender no Portal do Esporte
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
