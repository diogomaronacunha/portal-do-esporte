'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CadastrarPrestadorForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErro(null)

    const form = e.currentTarget
    const getValue = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement)?.value ?? ''

    const res = await fetch('/api/prestadores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome_empresa: getValue('nome_empresa'),
        descricao: getValue('descricao'),
        cidade: getValue('cidade'),
        estado: getValue('estado'),
        whatsapp: getValue('whatsapp'),
        instagram: getValue('instagram'),
        website: getValue('website'),
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setErro(body.error ?? 'Erro ao cadastrar. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/meu-perfil?prestador=novo')
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da empresa / profissional *</label>
        <input
          name="nome_empresa"
          required
          placeholder="Ex: Academia Força Total RS"
          className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição dos serviços</label>
        <textarea
          name="descricao"
          rows={3}
          placeholder="Descreva os serviços que você oferece..."
          className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
          <input name="cidade" placeholder="Porto Alegre" className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <input name="estado" defaultValue="RS" maxLength={2} className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
        <input name="whatsapp" type="tel" placeholder="51999999999" className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
        <input name="instagram" placeholder="@meuservico" className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
        <input name="website" type="url" placeholder="https://meusite.com.br" className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400" />
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button type="submit" disabled={loading} className="w-full py-3 px-6 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60">
        {loading ? 'Enviando...' : 'Cadastrar como prestador'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Após aprovação, você poderá publicar ofertas no portal.
      </p>
    </form>
  )
}
