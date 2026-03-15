import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { getEsportesAtivos } from '@/lib/db/esportes'
import CadastrarAtletaForm from './CadastrarAtletaForm'

export const metadata: Metadata = {
  title: 'Cadastrar Atleta | Portal do Esporte',
  description: 'Cadastre seu perfil de atleta amador no Portal do Esporte gaúcho.',
}

export default async function CadastrarAtletaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const esportes = await getEsportesAtivos().catch(() => [])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-primary-600 text-white py-10 px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Cadastrar Perfil de Atleta</h1>
            <p className="text-primary-100">
              Apareça na página de atletas do Portal do Esporte gaúcho.
              Seu perfil será revisado e publicado em breve.
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="card p-6">
            <CadastrarAtletaForm esportes={esportes} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
