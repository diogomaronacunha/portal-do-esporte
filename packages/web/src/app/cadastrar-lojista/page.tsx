import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CadastrarLojistaForm from './CadastrarLojistaForm'

export const metadata: Metadata = {
  title: 'Cadastrar Lojista',
  description: 'Cadastre sua loja esportiva no Portal do Esporte e alcance esportistas do RS.',
}

export default function CadastrarLojistaPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Cadastrar minha loja</h1>
          <p className="text-gray-500 text-sm mb-6">
            Venda seus produtos esportivos para a comunidade do RS. Após aprovação, sua loja aparecerá no portal.
          </p>
          <CadastrarLojistaForm />
        </div>
      </main>
      <Footer />
    </>
  )
}
