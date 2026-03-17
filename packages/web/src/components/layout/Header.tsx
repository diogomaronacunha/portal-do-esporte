'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, LogOut, User, ShoppingCart, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCarrinho } from '@/contexts/CarrinhoContext'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const navLinks = [
  { href: '/noticias', label: 'Notícias' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/atletas', label: 'Atletas' },
  { href: '/clubes', label: 'Clubes' },
  { href: '/loja', label: 'Loja' },
  { href: '/lojistas', label: 'Lojistas' },
  { href: '/ofertas', label: 'Ofertas' },
  { href: '/prestadores', label: 'Serviços' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const router = useRouter()
  const { count: carrinhoCount } = useCarrinho()

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement)?.value.trim()
    if (q) {
      setSearchOpen(false)
      router.push(`/buscar?q=${encodeURIComponent(q)}`)
    }
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="http://portaldoesporte.com.br/wp-content/uploads/2022/06/ID-Portal-do-Esporte-300x146.png"
            alt="Portal do Esporte"
            width={150}
            height={73}
            priority
            className="h-10 w-auto"
          />
        </Link>

        {/* Nav Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Ações Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(v => !v)}
            className="p-1.5 text-gray-600 hover:text-primary-600 transition-colors"
            aria-label="Buscar"
          >
            <Search size={20} />
          </button>
          <Link href="/loja/carrinho" className="relative p-1.5 text-gray-600 hover:text-primary-600 transition-colors">
            <ShoppingCart size={20} />
            {carrinhoCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {carrinhoCount > 9 ? '9+' : carrinhoCount}
              </span>
            )}
          </Link>
          <Link
            href="/cadastrar-evento"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            + Cadastrar Evento
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/meu-perfil"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-600"
              >
                <User size={16} />
                <span className="max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary text-sm">
              Entrar
            </Link>
          )}
        </div>

        {/* Botão Menu Mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-primary-600"
          aria-label="Abrir menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Barra de busca expansível */}
      {searchOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <input
              name="q"
              autoFocus
              placeholder="Buscar notícias, eventos, produtos, atletas..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <button type="submit" className="btn-primary text-sm px-4 py-2">
              Buscar
            </button>
          </form>
        </div>
      )}

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              name="q"
              placeholder="Buscar..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <button type="submit" className="p-2 text-primary-600">
              <Search size={18} />
            </button>
          </form>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-gray-700 hover:text-primary-600 font-medium py-1"
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-gray-100" />
          <Link
            href="/cadastrar-evento"
            onClick={() => setMenuOpen(false)}
            className="block text-primary-600 font-medium py-1"
          >
            + Cadastrar Evento
          </Link>
          {user ? (
            <button
              onClick={() => { handleLogout(); setMenuOpen(false) }}
              className="block text-red-500 font-medium py-1"
            >
              Sair
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="block btn-primary text-center text-sm"
            >
              Entrar
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
