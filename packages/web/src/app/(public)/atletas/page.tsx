import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getAtletasAprovados } from '@/lib/db/atletas'
import { Instagram, Facebook, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Atletas | Portal do Esporte',
  description: 'Conheça os atletas amadores do Rio Grande do Sul.',
}

export const revalidate = 3600

export default async function AtletasPage() {
  const atletas = await getAtletasAprovados(40).catch(() => [])

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="bg-primary-600 text-white py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Atletas Amadores</h1>
            <p className="text-primary-100">
              Conheça os esportistas amadores do Rio Grande do Sul.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10">
          {atletas.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-4">Nenhum atleta cadastrado ainda.</p>
              <Link href="/cadastrar-atleta" className="btn-primary inline-block">
                Cadastrar meu perfil
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-500">
                  {atletas.length} atleta{atletas.length !== 1 ? 's' : ''}
                </p>
                <Link href="/cadastrar-atleta" className="btn-primary text-sm">
                  + Cadastrar meu perfil
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {atletas.map((atleta) => (
                  <Link key={atleta.id} href={`/atletas/${atleta.slug}`} className="card p-5 text-center hover:shadow-md transition-shadow block">
                    {atleta.foto_url ? (
                      <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-3">
                        <Image
                          src={atleta.foto_url}
                          alt={atleta.nome}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                        {atleta.nome.charAt(0)}
                      </div>
                    )}
                    <h2 className="font-semibold text-gray-900 text-sm">{atleta.nome}</h2>
                    {atleta.esportes?.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center mt-2">
                        {atleta.esportes.slice(0, 2).map((esp) => (
                          <span key={esp} className="badge-green text-xs">{esp}</span>
                        ))}
                      </div>
                    )}
                    {atleta.cidade && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                        <MapPin size={11} />
                        {atleta.cidade}
                      </p>
                    )}
                    {atleta.clube_nome && (
                      <p className="text-xs text-gray-500 mt-1">{atleta.clube_nome}</p>
                    )}
                    <div className="flex gap-2 justify-center mt-3">
                      {atleta.instagram_url && (
                        <a
                          href={atleta.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-accent-500 transition-colors"
                        >
                          <Instagram size={16} />
                        </a>
                      )}
                      {atleta.facebook_url && (
                        <a
                          href={atleta.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          <Facebook size={16} />
                        </a>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
