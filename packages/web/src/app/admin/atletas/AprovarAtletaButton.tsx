'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AprovarAtletaButton({ atletaId }: { atletaId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleAprovar() {
    setLoading(true)
    try {
      await fetch(`/api/admin/atletas/${atletaId}/aprovar`, { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleRejeitar() {
    setLoading(true)
    try {
      await fetch(`/api/admin/atletas/${atletaId}/rejeitar`, { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={handleRejeitar}
        disabled={loading}
        className="px-3 py-1.5 text-sm border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      >
        Rejeitar
      </button>
      <button
        onClick={handleAprovar}
        disabled={loading}
        className="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Aprovar'}
      </button>
    </div>
  )
}
