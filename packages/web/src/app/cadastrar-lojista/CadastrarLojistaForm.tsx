'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CadastrarLojistaForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErro(null)

    const form = e.currentTarget
    const data = {
      nome_loja: (form.elements.namedItem('nome_loja') as HTMLInputElement).value,
      descricao: (form.elements.namedItem('descricao') as HTMLTextAreaElement).value,
      cidade: (form.elements.namedItem('cidade') as HTMLInputElement).value,
      estado: (form.elements.namedItem('estado') as HTMLInputElement).value,
      whatsapp: (form.elements.namedItem('whatsapp') as HTMLInputElement).value,
      instagram: (form.elements.namedItem('instagram') as HTMLInputElement).value,
      website: (form.elements.namedItem('website') as HTMLInputElement).value,
    }

    const res = await fetch('/api/lojistas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setErro(body.error ?? 'Erro ao cadastrar. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/minha-loja?novo=1')
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da loja *</label>
        <input
          name="nome_loja"
          required
          placeholder="Ex: Esporte Total RS"
          className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea
          name="descricao"
          rows={3}
          placeholder="Fale um pouco sobre sua loja..."
          className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
          <input
            name="cidade"
            placeholder="Porto Alegre"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <input
            name="estado"
            defaultValue="RS"
            placeholder="RS"
            maxLength={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
        <input
          name="whatsapp"
          type="tel"
          placeholder="51999999999"
          className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
        <input
          name="instagram"
          placeholder="@minhaloja"
          className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
        <input
          name="website"
          type="url"
          placeholder="https://minhaloja.com.br"
          className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-60"
      >
        {loading ? 'Enviando...' : 'Cadastrar loja'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Sua loja será analisada pela equipe e aparecerá no portal após aprovação.
      </p>
    </form>
  )
}
