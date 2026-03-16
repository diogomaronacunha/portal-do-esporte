import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { getPrestadorPorUsuario } from '@/lib/db/prestadores'
import { getCategoriasOferta } from '@/lib/db/ofertas'
import NovaOfertaForm from './NovaOfertaForm'

export const metadata: Metadata = { title: 'Nova Oferta' }

export default async function NovaOfertaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/meu-espaco/nova-oferta')

  const prestador = await getPrestadorPorUsuario(user.id).catch(() => null)

  if (!prestador || prestador.status !== 'aprovado') {
    redirect('/meu-espaco')
  }

  const categorias = await getCategoriasOferta()

  const { data: esportes } = await supabase
    .from('esportes')
    .select('id, nome')
    .eq('ativo', true)
    .order('nome')

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-3 text-sm text-gray-400">
          <Link href="/meu-espaco" className="hover:text-primary-600">Meu Espaço</Link>
          {' / '}
          <span className="text-gray-700">Nova Oferta</span>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Publicar Nova Oferta</h1>
          <NovaOfertaForm
            prestadorId={prestador.id}
            categorias={categorias}
            esportes={esportes ?? []}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
