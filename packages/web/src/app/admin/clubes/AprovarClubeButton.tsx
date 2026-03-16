'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AprovarClubeButton({ clubeId }: { clubeId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handle(acao: 'aprovar' | 'rejeitar') {
    setLoading(true)
    try {
      await fetch(`/api/admin/clubes/${clubeId}/${acao}`, { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={() => handle('rejeitar')}
        disabled={loading}
        className="px-3 py-1.5 text-sm border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      >
        Rejeitar
      </button>
      <button
        onClick={() => handle('aprovar')}
        disabled={loading}
        className="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Aprovar'}
      </button>
    </div>
  )
}
