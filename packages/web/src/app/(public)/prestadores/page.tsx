import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Globe, Instagram, Phone } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Prestadores Esportivos',
  description: 'Serviços e negócios esportivos no Rio Grande do Sul.',
}

export default async function PrestadoresPage() {
  const supabase = await createClient()
  const { data: prestadores } = await supabase
    .from('prestadores')
    .select('id, nome_empresa, slug, descricao, logo_url, cidade, estado, whatsapp, instagram, website')
    .eq('status', 'aprovado')
    .order('nome_empresa', { ascending: true })
    .limit(60)

  const lista = prestadores ?? []

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="bg-accent-500 text-white py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Serviços Esportivos</h1>
            <p className="text-orange-100">Academias, personal trainers, fisioterapeutas e negócios esportivos do RS.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {lista.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-medium">Nenhum prestador cadastrado ainda.</p>
              <p className="text-sm mt-4">
                Tem um negócio esportivo?{' '}
                <Link href="/cadastrar-prestador" className="text-primary-600 hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lista.map(p => (
                <Link
                  key={p.id}
                  href={`/prestadores/${p.slug}`}
                  className="card hover:shadow-md transition-shadow p-5 flex items-start gap-4"
                >
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-xl bg-gray-100 overflow-hidden">
                    {p.logo_url ? (
                      <Image src={p.logo_url} alt={p.nome_empresa} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🏋️</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-gray-900 truncate">{p.nome_empresa}</h2>
                    {p.cidade && (
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <MapPin size={11} />
                        {p.cidade}, {p.estado}
                      </p>
                    )}
                    {p.descricao && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.descricao}</p>
                    )}
                    <div className="flex gap-3 mt-2">
                      {p.whatsapp && <Phone size={13} className="text-green-500" />}
                      {p.instagram && <Instagram size={13} className="text-accent-500" />}
                      {p.website && <Globe size={13} className="text-primary-600" />}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-200 py-8 px-4 text-center">
          <p className="text-gray-600 mb-2">Tem um negócio esportivo no RS?</p>
          <Link href="/cadastrar-prestador" className="btn-primary inline-block">
            Cadastrar meu negócio
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
