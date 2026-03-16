'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReprocessarButton({ noticiaId }: { noticiaId: string }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const router = useRouter()

  async function handleReprocessar() {
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/admin/noticias/${noticiaId}/reprocessar`, { method: 'POST' })
      const data = await res.json()
      if (data.updated) {
        setMsg(`Atualizado: ${data.fields.join(', ')}`)
        router.refresh()
      } else {
        setMsg(data.reason ?? 'Sem alterações')
      }
    } catch {
      setMsg('Erro ao reprocessar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleReprocessar}
        disabled={loading}
        className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? 'Buscando...' : '↺ Reprocessar'}
      </button>
      {msg && <span className="text-xs text-gray-500">{msg}</span>}
    </div>
  )
}
