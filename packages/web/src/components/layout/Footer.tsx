import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-4 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Marca */}
          <div>
            <p className="text-white font-bold text-lg mb-2">⚽ Portal do Esporte</p>
            <p className="text-sm">
              O maior portal do esporte amador do Rio Grande do Sul.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-white font-semibold mb-3">Navegação</p>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/noticias', label: 'Notícias' },
                { href: '/eventos', label: 'Eventos' },
                { href: '/atletas', label: 'Atletas' },
                { href: '/cadastrar-evento', label: 'Cadastrar Evento' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <p className="text-white font-semibold mb-3">Institucional</p>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/sobre', label: 'Sobre' },
                { href: '/contato', label: 'Contato' },
                { href: '/privacidade', label: 'Política de Privacidade' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-sm">
          <p>© {year} Portal do Esporte. Todos os direitos reservados.</p>
          <p className="mt-1 text-xs text-gray-600">
            Feito com ♥ para o esporte amador gaúcho
          </p>
        </div>
      </div>
    </footer>
  )
}
