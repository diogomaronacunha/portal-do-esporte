import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { getEsportesAtivos } from '@/lib/db/esportes'
import CadastrarClubeForm from './CadastrarClubeForm'

export const metadata: Metadata = {
  title: 'Cadastrar Clube | Portal do Esporte',
  description: 'Cadastre seu clube ou associação esportiva no Portal do Esporte gaúcho.',
}

export default async function CadastrarClubePage() {
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
            <h1 className="text-3xl font-bold mb-2">Cadastrar Clube</h1>
            <p className="text-primary-100">
              Coloque seu clube no mapa do esporte amador gaúcho.
              O perfil será revisado e publicado em breve.
            </p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="card p-6">
            <CadastrarClubeForm esportes={esportes} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
