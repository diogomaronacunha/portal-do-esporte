import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ComprarOfertaButton from './ComprarOfertaButton'
import { getOfertaPorSlug } from '@/lib/db/ofertas'
import { formatCurrency } from '@/lib/utils'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const oferta = await getOfertaPorSlug(slug)
  if (!oferta) return {}
  return { title: oferta.titulo, description: oferta.descricao ?? oferta.titulo }
}

export default async function OfertaPage({ params }: Props) {
  const { slug } = await params
  const oferta = await getOfertaPorSlug(slug)
  if (!oferta) notFound()

  const desconto = Math.round((1 - oferta.preco_oferta / oferta.preco_original) * 100)
  const esgotada = oferta.quantidade_maxima !== null && oferta.quantidade_vendida >= oferta.quantidade_maxima
  const restam = oferta.quantidade_maxima !== null ? oferta.quantidade_maxima - oferta.quantidade_vendida : null
  const venceEm = oferta.data_fim ? Math.ceil((new Date(oferta.data_fim).getTime() - Date.now()) / 86400000) : null

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-5xl mx-auto px-4 py-3 text-sm text-gray-400">
          <Link href="/ofertas" className="hover:text-accent-600">Ofertas</Link>
          {oferta.categoria && (
            <> / <Link href={`/ofertas?categoria=${oferta.categoria.slug}`} className="hover:text-accent-600">{oferta.categoria.nome}</Link></>
          )}
          {' / '}<span className="text-gray-700">{oferta.titulo}</span>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-12">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Imagem */}
            <div>
              {oferta.imagem_url ? (
                <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-gray-100">
                  <Image src={oferta.imagem_url} alt={oferta.titulo} fill className="object-cover" priority />
                </div>
              ) : (
                <div className="h-72 md:h-96 rounded-2xl bg-gradient-to-br from-accent-100 to-primary-100 flex items-center justify-center text-8xl">
                  {oferta.categoria?.icone ?? '🏷️'}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-accent-600 font-medium">{oferta.prestador?.nome_empresa}</p>
                {oferta.categoria && <span className="text-xs text-gray-400">{oferta.categoria.nome}</span>}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">{oferta.titulo}</h1>

              {/* Preço */}
              <div className="bg-accent-50 border border-accent-100 rounded-2xl p-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-accent-600">{formatCurrency(oferta.preco_oferta)}</span>
                  <span className="text-lg text-gray-400 line-through">{formatCurrency(oferta.preco_original)}</span>
                  <span className="bg-accent-500 text-white text-sm font-bold px-2 py-0.5 rounded-full">-{desconto}%</span>
                </div>
                <p className="text-xs text-accent-700 mt-1">
                  Você economiza {formatCurrency(oferta.preco_original - oferta.preco_oferta)}
                </p>
              </div>

              {/* Alertas */}
              <div className="space-y-2">
                {restam !== null && !esgotada && restam <= 10 && (
                  <p className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                    ⚡ Apenas {restam} vagas restantes!
                  </p>
                )}
                {venceEm !== null && venceEm <= 7 && !esgotada && (
                  <p className="text-sm font-medium text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    ⏳ Oferta encerra em {venceEm} dia{venceEm !== 1 ? 's' : ''}
                  </p>
                )}
                {oferta.quantidade_vendida > 0 && (
                  <p className="text-sm text-gray-500">✓ {oferta.quantidade_vendida} pessoas já compraram</p>
                )}
              </div>

              {esgotada ? (
                <div className="py-3 px-6 bg-gray-100 text-gray-500 text-center rounded-xl font-medium">
                  Oferta esgotada
                </div>
              ) : (
                <ComprarOfertaButton ofertaId={oferta.id} whatsapp={oferta.prestador?.whatsapp ?? null} titulo={oferta.titulo} />
              )}
            </div>
          </div>

          {/* Descrição */}
          {oferta.descricao && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Sobre a oferta</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{oferta.descricao}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
