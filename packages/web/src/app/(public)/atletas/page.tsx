import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Atletas',
  description: 'Perfis de atletas amadores do Rio Grande do Sul. Conheça os esportistas da nossa terra.',
}

export default function AtletasPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Atletas Amadores</h1>
        <p className="text-gray-500 mb-8">
          Conheça os atletas amadores do Rio Grande do Sul.
        </p>
        {/* TODO: Buscar atletas do Supabase (status = aprovado) */}
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Perfis em breve.</p>
          <p className="text-sm mt-2">
            É atleta amador gaúcho? Cadastre seu perfil e apareça aqui.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
