'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

interface Esporte {
  slug: string
  nome: string
}

interface Props {
  esportes: Esporte[]
  placeholder?: string
}

export default function FiltrosBusca({ esportes, placeholder = 'Buscar...' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const esporteAtivo = searchParams.get('esporte') ?? ''

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="mb-8 space-y-4">
      {/* Campo de busca */}
      <input
        type="search"
        defaultValue={q}
        placeholder={placeholder}
        onChange={e => update('q', e.target.value)}
        className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
      />

      {/* Filtro por esporte */}
      {esportes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => update('esporte', '')}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              !esporteAtivo
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-gray-300 text-gray-600 hover:border-primary-400'
            }`}
          >
            Todos
          </button>
          {esportes.map(e => (
            <button
              key={e.slug}
              onClick={() => update('esporte', esporteAtivo === e.slug ? '' : e.slug)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                esporteAtivo === e.slug
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-300 text-gray-600 hover:border-primary-400'
              }`}
            >
              {e.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
