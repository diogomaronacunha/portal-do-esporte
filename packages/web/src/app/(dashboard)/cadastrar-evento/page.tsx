import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEsportesAtivos } from '@/lib/db/esportes'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CadastrarEventoForm from './CadastrarEventoForm'

export const metadata: Metadata = {
  title: 'Cadastrar Evento',
  description: 'Divulgue seu evento esportivo gratuitamente no Portal do Esporte.',
}

export default async function CadastrarEventoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/cadastrar-evento')

  const esportes = await getEsportesAtivos()

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastrar Evento</h1>
        <p className="text-gray-500 mb-8">
          Preencha os dados do seu evento. Após análise, ele será publicado no calendário.
        </p>
        <CadastrarEventoForm esportes={esportes} userId={user.id} />
      </main>
      <Footer />
    </>
  )
}
