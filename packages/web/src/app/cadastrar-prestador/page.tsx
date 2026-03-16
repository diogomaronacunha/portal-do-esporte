import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CadastrarPrestadorForm from './CadastrarPrestadorForm'

export const metadata: Metadata = {
  title: 'Cadastrar Prestador',
  description: 'Publique ofertas de serviços esportivos no Portal do Esporte.',
}

export default function CadastrarPrestadorPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-10">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Publicar ofertas esportivas</h1>
            <p className="text-gray-500 text-sm">
              Academia, personal trainer, aulas, assessoria — cadastre seu serviço e alcance esportistas do RS com ofertas exclusivas.
            </p>
          </div>
          <CadastrarPrestadorForm />
        </div>
      </main>
      <Footer />
    </>
  )
}
