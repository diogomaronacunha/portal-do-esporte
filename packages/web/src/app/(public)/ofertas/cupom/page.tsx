import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = { title: 'Seu Cupom' }

type Props = { searchParams: Promise<{ codigo?: string }> }

export default async function CupomPage({ searchParams }: Props) {
  const { codigo } = await searchParams

  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="text-6xl mb-4">🎟️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Compra confirmada!</h1>
          <p className="text-gray-500 mb-6">Apresente este código ao prestador para utilizar sua oferta.</p>

          {codigo && (
            <div className="bg-accent-50 border-2 border-accent-200 rounded-2xl p-6 mb-6">
              <p className="text-xs text-accent-600 font-medium mb-1">Seu cupom</p>
              <p className="text-3xl font-bold tracking-[0.3em] text-accent-700">{codigo}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link href="/meu-perfil" className="btn-primary">Ver meus cupons</Link>
            <Link href="/ofertas" className="text-sm text-accent-600 hover:underline">Ver mais ofertas</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
