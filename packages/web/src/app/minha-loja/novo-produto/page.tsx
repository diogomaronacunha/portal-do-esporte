import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import NovoProdutoForm from './NovoProdutoForm'
import { createClient } from '@/lib/supabase/server'
import { getLojistaPorUsuario } from '@/lib/db/lojistas'
import { getCategoriasAtivas } from '@/lib/db/categorias'

export const metadata: Metadata = { title: 'Novo Produto' }

export default async function NovoProdutoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/minha-loja/novo-produto')

  const lojista = await getLojistaPorUsuario(user.id).catch(() => null)

  if (!lojista || lojista.status !== 'aprovado') {
    redirect('/minha-loja')
  }

  const [categorias, { data: esportesData }] = await Promise.all([
    getCategoriasAtivas().catch(() => []),
    supabase.from('esportes').select('id, nome').order('nome'),
  ])

  const esportes = esportesData ?? []

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Novo produto</h1>
          <p className="text-gray-500 text-sm mb-6">
            Preencha as informações do produto. Ele ficará pendente de aprovação antes de aparecer na loja.
          </p>
          <NovoProdutoForm categorias={categorias} esportes={esportes} />
        </div>
      </main>
      <Footer />
    </>
  )
}
