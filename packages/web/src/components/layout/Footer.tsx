import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-4 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Marca */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-white font-bold text-lg mb-2">⚽ Portal do Esporte</p>
            <p className="text-sm">
              O maior portal do esporte amador do Rio Grande do Sul. Notícias, eventos, atletas, loja e ofertas.
            </p>
          </div>

          {/* Portal */}
          <div>
            <p className="text-white font-semibold mb-3">Portal</p>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/noticias', label: 'Notícias' },
                { href: '/eventos', label: 'Eventos' },
                { href: '/atletas', label: 'Atletas' },
                { href: '/clubes', label: 'Clubes' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Loja */}
          <div>
            <p className="text-white font-semibold mb-3">Loja</p>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/loja', label: 'Produtos' },
                { href: '/lojistas', label: 'Lojistas' },
                { href: '/ofertas', label: 'Ofertas' },
                { href: '/cadastrar-lojista', label: 'Vender no portal' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Participe */}
          <div>
            <p className="text-white font-semibold mb-3">Participe</p>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/cadastrar-evento', label: 'Cadastrar Evento' },
                { href: '/cadastrar-atleta', label: 'Cadastrar Atleta' },
                { href: '/cadastrar-clube', label: 'Cadastrar Clube' },
                { href: '/login', label: 'Entrar / Cadastrar' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-sm">
          <p>© {year} Portal do Esporte. Todos os direitos reservados.</p>
          <p className="mt-1 text-xs text-gray-600">Feito com ♥ para o esporte amador gaúcho</p>
        </div>
      </div>
    </footer>
  )
}
