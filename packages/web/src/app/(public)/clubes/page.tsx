import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Globe, Instagram } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getClubesAprovados } from '@/lib/db/clubes'

export const metadata: Metadata = {
  title: 'Clubes | Portal do Esporte',
  description: 'Clubes e associações esportivas do Rio Grande do Sul.',
}

export const revalidate = 3600

export default async function ClubesPage() {
  const clubes = await getClubesAprovados(60).catch(() => [])

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="bg-primary-600 text-white py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Clubes e Associações</h1>
            <p className="text-primary-100">
              Clubes esportivos amadores do Rio Grande do Sul.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10">
          {clubes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-4">Nenhum clube cadastrado ainda.</p>
              <Link href="/cadastrar-clube" className="btn-primary inline-block">
                Cadastrar meu clube
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-500">
                  {clubes.length} clube{clubes.length !== 1 ? 's' : ''}
                </p>
                <Link href="/cadastrar-clube" className="btn-primary text-sm">
                  + Cadastrar clube
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubes.map((clube) => (
                  <Link key={clube.id} href={`/clubes/${clube.slug}`} className="card p-5 hover:shadow-md transition-shadow block">
                    <div className="flex items-center gap-4 mb-3">
                      {clube.logo_url ? (
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          <Image
                            src={clube.logo_url}
                            alt={clube.nome}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                          {clube.nome.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h2 className="font-semibold text-gray-900 leading-snug">{clube.nome}</h2>
                        {clube.esporte && (
                          <span className="badge-green mt-1">{clube.esporte.nome}</span>
                        )}
                      </div>
                    </div>

                    {clube.descricao && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{clube.descricao}</p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      {clube.cidade && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {clube.cidade}, {clube.estado}
                        </span>
                      )}
                      {clube.fundado_em && (
                        <span>Fundado em {clube.fundado_em}</span>
                      )}
                    </div>

                    <div className="flex gap-3 mt-3">
                      {clube.site_url && (
                        <a
                          href={clube.site_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          <Globe size={16} />
                        </a>
                      )}
                      {clube.instagram_url && (
                        <a
                          href={clube.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-accent-500 transition-colors"
                        >
                          <Instagram size={16} />
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
