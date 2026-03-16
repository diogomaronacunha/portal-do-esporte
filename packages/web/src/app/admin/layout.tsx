import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Link href="/" className="text-primary-400 font-bold text-lg">
            Portal do Esporte
          </Link>
          <p className="text-gray-400 text-xs mt-1">Painel Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/noticias', label: 'Notícias' },
            { href: '/admin/eventos', label: 'Eventos' },
            { href: '/admin/atletas', label: 'Atletas' },
            { href: '/admin/clubes', label: 'Clubes' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">
            ← Voltar ao site
          </Link>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
