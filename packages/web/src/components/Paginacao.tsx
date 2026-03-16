'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface Props {
  total: number
  porPagina: number
  paginaAtual: number
}

export default function Paginacao({ total, porPagina, paginaAtual }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const totalPaginas = Math.ceil(total / porPagina)

  if (totalPaginas <= 1) return null

  function ir(pagina: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (pagina === 1) {
      params.delete('pagina')
    } else {
      params.set('pagina', String(pagina))
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const pages: (number | '...')[] = []
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || Math.abs(i - paginaAtual) <= 1) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-10">
      <button
        onClick={() => ir(paginaAtual - 1)}
        disabled={paginaAtual === 1}
        className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ← Anterior
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => ir(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
              p === paginaAtual
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => ir(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas}
        className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Próxima →
      </button>
    </div>
  )
}
