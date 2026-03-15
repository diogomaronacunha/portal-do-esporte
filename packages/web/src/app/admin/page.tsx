// TODO: Buscar estatísticas reais do Supabase

const stats = [
  { label: 'Notícias Pendentes', value: 0, href: '/admin/noticias', color: 'bg-yellow-50 text-yellow-800' },
  { label: 'Eventos Pendentes', value: 0, href: '/admin/eventos', color: 'bg-blue-50 text-blue-800' },
  { label: 'Atletas Pendentes', value: 0, href: '/admin/atletas', color: 'bg-purple-50 text-purple-800' },
  { label: 'Clubes Pendentes', value: 0, href: '/admin/clubes', color: 'bg-orange-50 text-orange-800' },
]

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className={`rounded-xl p-6 ${stat.color} hover:opacity-90 transition-opacity`}
          >
            <p className="text-sm font-medium opacity-80">{stat.label}</p>
            <p className="text-4xl font-bold mt-1">{stat.value}</p>
          </a>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h2>
        <p className="text-gray-400 text-sm">Nenhuma atividade recente.</p>
      </div>
    </div>
  )
}
