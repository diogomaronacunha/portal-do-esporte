'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AprovarPrestadorButton({ id, status }: { id: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function acao(tipo: 'aprovar' | 'rejeitar') {
    setLoading(tipo)
    await fetch(`/api/admin/prestadores/${id}/${tipo}`, { method: 'POST' })
    setLoading(null)
    router.refresh()
  }

  if (status === 'aprovado') return <span className="text-xs text-green-600 font-medium">✓ Aprovado</span>
  if (status === 'rejeitado') return <span className="text-xs text-red-500 font-medium">✗ Rejeitado</span>

  return (
    <div className="flex gap-2">
      <button onClick={() => acao('aprovar')} disabled={!!loading} className="px-3 py-1 bg-accent-500 text-white text-xs rounded-lg hover:bg-accent-600 disabled:opacity-50">
        {loading === 'aprovar' ? '...' : 'Aprovar'}
      </button>
      <button onClick={() => acao('rejeitar')} disabled={!!loading} className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded-lg hover:bg-red-200 disabled:opacity-50">
        {loading === 'rejeitar' ? '...' : 'Rejeitar'}
      </button>
    </div>
  )
}
