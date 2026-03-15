import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

// Dados placeholder — serão substituídos por dados reais do Supabase
const noticiasFake = [
  {
    id: '1',
    titulo: 'Campeonato Gaúcho de Futebol Amador 2026 tem nova data',
    resumo: 'A Federação Gaúcha de Futebol anunciou as datas da edição 2026 do campeonato amador estadual.',
    esporte: 'Futebol',
    fonte: 'FGF',
    slug: 'campeonato-gaucho-futebol-amador-2026',
  },
  {
    id: '2',
    titulo: 'Atletismo gaúcho conquista medalhas no campeonato nacional',
    resumo: 'Atletas do RS sobem ao pódio em três modalidades durante o Campeonato Brasileiro de Atletismo.',
    esporte: 'Atletismo',
    fonte: 'FGA',
    slug: 'atletismo-gaucho-medalhas-campeonato-nacional',
  },
  {
    id: '3',
    titulo: 'Vôlei de praia: torneio regional acontece em Tramandaí',
    resumo: 'Mais de 50 duplas inscritas para o torneio regional de beach vôlei no litoral gaúcho.',
    esporte: 'Beach Vôlei',
    fonte: 'FGV',
    slug: 'torneio-beach-volei-tramandai',
  },
]

const eventosFake = [
  {
    id: '1',
    titulo: 'Corrida 5K Parque Farroupilha',
    data: '29/03/2026',
    local: 'Porto Alegre, RS',
    esporte: 'Corrida de Rua',
    gratuito: false,
  },
  {
    id: '2',
    titulo: 'Torneio de Judô Região Metropolitana',
    data: '05/04/2026',
    local: 'Canoas, RS',
    esporte: 'Judô',
    gratuito: true,
  },
]

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-primary-600 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              O esporte amador gaúcho em um só lugar
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Notícias, eventos, atletas e clubes do Rio Grande do Sul.
              Apoiando o esporte de base desde 2026.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/eventos"
                className="bg-white text-primary-700 hover:bg-primary-50 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Ver Calendário de Eventos
              </Link>
              <Link
                href="/noticias"
                className="border border-white text-white hover:bg-primary-700 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Últimas Notícias
              </Link>
            </div>
          </div>
        </section>

        {/* Últimas Notícias */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Últimas Notícias</h2>
              <Link href="/noticias" className="text-primary-600 hover:underline text-sm font-medium">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {noticiasFake.map((noticia) => (
                <article key={noticia.id} className="card hover:shadow-md transition-shadow">
                  <div className="bg-gray-200 h-40 flex items-center justify-center text-gray-400 text-sm">
                    Imagem da notícia
                  </div>
                  <div className="p-4">
                    <span className="badge-green mb-2">{noticia.esporte}</span>
                    <h3 className="font-semibold text-gray-900 mt-2 mb-1 line-clamp-2">
                      {noticia.titulo}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{noticia.resumo}</p>
                    <p className="text-xs text-gray-400 mt-3">Fonte: {noticia.fonte}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Próximos Eventos */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Próximos Eventos</h2>
              <Link href="/eventos" className="text-primary-600 hover:underline text-sm font-medium">
                Ver calendário →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventosFake.map((evento) => (
                <div key={evento.id} className="card p-4 flex gap-4">
                  <div className="bg-primary-600 text-white rounded-lg p-3 text-center min-w-[60px]">
                    <div className="text-xs font-medium">{evento.data.split('/')[1]}/{evento.data.split('/')[2]}</div>
                    <div className="text-2xl font-bold">{evento.data.split('/')[0]}</div>
                  </div>
                  <div>
                    <span className="badge-gray mb-1">{evento.esporte}</span>
                    <h3 className="font-semibold text-gray-900">{evento.titulo}</h3>
                    <p className="text-sm text-gray-500">{evento.local}</p>
                    {evento.gratuito && (
                      <span className="badge-green mt-1">Gratuito</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Cadastro */}
        <section className="py-12 px-4 bg-gray-900 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Tem um evento esportivo?</h2>
          <p className="text-gray-400 mb-6">
            Divulgue gratuitamente no maior portal do esporte amador gaúcho.
          </p>
          <Link
            href="/cadastrar-evento"
            className="btn-primary inline-block"
          >
            Cadastrar Evento
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
