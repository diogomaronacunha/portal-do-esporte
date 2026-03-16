import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [noticias, eventos, atletas, clubes, lojistas, produtos] = await Promise.all([
    supabase.from('noticias').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
    supabase.from('eventos').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
    supabase.from('atletas').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
    supabase.from('clubes').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
    supabase.from('lojistas').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
    supabase.from('produtos').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
  ])

  const stats = [
    {
      label: 'Notícias Pendentes',
      value: noticias.count ?? 0,
      href: '/admin/noticias',
      color: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    },
    {
      label: 'Eventos Pendentes',
      value: eventos.count ?? 0,
      href: '/admin/eventos',
      color: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      label: 'Atletas Pendentes',
      value: atletas.count ?? 0,
      href: '/admin/atletas',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    {
      label: 'Clubes Pendentes',
      value: clubes.count ?? 0,
      href: '/admin/clubes',
      color: 'bg-green-50 text-green-800 border-green-200',
    },
    {
      label: 'Lojistas Pendentes',
      value: lojistas.count ?? 0,
      href: '/admin/lojistas',
      color: 'bg-orange-50 text-orange-800 border-orange-200',
    },
    {
      label: 'Produtos Pendentes',
      value: produtos.count ?? 0,
      href: '/admin/produtos',
      color: 'bg-accent-50 text-accent-800 border-accent-200',
    },
  ]

  const total = (noticias.count ?? 0) + (eventos.count ?? 0) + (atletas.count ?? 0) + (clubes.count ?? 0) + (lojistas.count ?? 0) + (produtos.count ?? 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {total > 0 && (
          <span className="bg-accent-500 text-white text-sm font-medium px-3 py-1 rounded-full">
            {total} item{total !== 1 ? 's' : ''} pendente{total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`rounded-xl p-6 border ${stat.color} hover:opacity-90 transition-opacity`}
          >
            <p className="text-sm font-medium opacity-80">{stat.label}</p>
            <p className="text-4xl font-bold mt-1">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/noticias" className="btn-primary text-sm">
            Aprovar notícias →
          </Link>
          <Link href="/admin/eventos" className="btn-primary text-sm">
            Aprovar eventos →
          </Link>
          <Link href="/admin/atletas" className="btn-primary text-sm">
            Aprovar atletas →
          </Link>
          <Link href="/admin/clubes" className="btn-primary text-sm">
            Aprovar clubes →
          </Link>
          <Link href="/admin/lojistas" className="btn-primary text-sm">
            Aprovar lojistas →
          </Link>
          <Link href="/admin/produtos" className="btn-primary text-sm">
            Aprovar produtos →
          </Link>
        </div>
      </div>
    </div>
  )
}
