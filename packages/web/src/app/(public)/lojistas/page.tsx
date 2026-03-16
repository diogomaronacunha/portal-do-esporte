import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getLojistasAprovados } from '@/lib/db/lojistas'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Lojistas Esportivos',
  description: 'Lojistas esportivos parceiros do Portal do Esporte no Rio Grande do Sul.',
}

export default async function LojistasPage() {
  const lojistas = await getLojistasAprovados().catch(() => [])

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="bg-primary-600 text-white py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Lojistas Parceiros</h1>
            <p className="text-primary-100">Lojas esportivas do Rio Grande do Sul no Portal do Esporte.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {lojistas.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium">Nenhuma loja cadastrada ainda.</p>
              <p className="text-sm mt-4">
                Tem uma loja?{' '}
                <Link href="/cadastrar-lojista" className="text-primary-600 hover:underline">
                  Cadastre-se como lojista
                </Link>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lojistas.map(lojista => (
                <Link
                  key={lojista.id}
                  href={`/lojistas/${lojista.slug}`}
                  className="card hover:shadow-md transition-shadow p-5 flex items-center gap-4"
                >
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-full bg-gray-100 overflow-hidden">
                    {lojista.logo_url ? (
                      <Image src={lojista.logo_url} alt={lojista.nome_loja} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-gray-900 truncate">{lojista.nome_loja}</h2>
                    {lojista.cidade && (
                      <p className="text-xs text-gray-400 mt-0.5">📍 {lojista.cidade}{lojista.estado ? `, ${lojista.estado}` : ''}</p>
                    )}
                    {lojista.descricao && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{lojista.descricao}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-200 py-8 px-4 text-center">
          <p className="text-gray-600 mb-2">Tem uma loja esportiva no RS?</p>
          <Link href="/cadastrar-lojista" className="btn-primary inline-block">
            Cadastrar minha loja
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
