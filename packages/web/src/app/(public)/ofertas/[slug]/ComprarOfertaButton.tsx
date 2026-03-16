'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ComprarOfertaButton({
  ofertaId,
  whatsapp,
  titulo,
}: {
  ofertaId: string
  whatsapp: string | null
  titulo: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleComprar() {
    setLoading(true)
    setErro(null)

    const res = await fetch('/api/ofertas/comprar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oferta_id: ofertaId }),
    })

    const body = await res.json().catch(() => ({}))

    if (res.status === 401) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    if (!res.ok) {
      setErro(body.error ?? 'Erro ao processar. Tente novamente.')
      setLoading(false)
      return
    }

    // Redirecionar para MP ou direto para confirmação
    if (body.init_point) {
      window.location.href = body.init_point
    } else if (body.codigo) {
      router.push(`/ofertas/cupom?codigo=${body.codigo}`)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleComprar}
        disabled={loading}
        className="w-full py-3 px-6 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processando...
          </>
        ) : (
          '💳 Comprar oferta'
        )}
      </button>

      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Vi a oferta "${titulo}" no Portal do Esporte e tenho interesse.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-xl hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          💬 Perguntar via WhatsApp
        </a>
      )}

      {erro && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{erro}</p>}
    </div>
  )
}
