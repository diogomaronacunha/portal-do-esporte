'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Esporte } from '@/types/database'

export default function CadastrarClubeForm({ esportes }: { esportes: Esporte[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const payload = {
      nome: form.get('nome'),
      descricao: form.get('descricao'),
      esporte_slug: form.get('esporte_slug') || null,
      cidade: form.get('cidade'),
      estado: form.get('estado') || 'RS',
      fundado_em: form.get('fundado_em') ? Number(form.get('fundado_em')) : null,
      site_url: form.get('site_url'),
      instagram_url: form.get('instagram_url'),
    }

    try {
      const res = await fetch('/api/clubes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.error ?? 'Erro ao cadastrar clube.')
      } else {
        setSucesso(true)
        setTimeout(() => router.push('/clubes'), 2000)
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (sucesso) {
    return (
      <div className="text-center py-10">
        <p className="text-2xl mb-2">✅</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Clube enviado!</h2>
        <p className="text-gray-500">
          Seu clube foi enviado para aprovação e em breve aparecerá na página de clubes.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900">Dados do clube</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do clube <span className="text-red-500">*</span>
          </label>
          <input name="nome" required className="input-field" placeholder="Ex: Associação Atlética Gaúcha" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            name="descricao"
            rows={3}
            className="input-field resize-none"
            placeholder="Conte sobre a história e atividades do clube..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade principal</label>
          <select name="esporte_slug" className="input-field">
            <option value="">Selecione...</option>
            {esportes.map((e) => (
              <option key={e.slug} value={e.slug}>{e.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900">Localização</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <input name="cidade" className="input-field" placeholder="Porto Alegre" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <input name="estado" className="input-field" defaultValue="RS" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ano de fundação</label>
          <input
            name="fundado_em"
            type="number"
            min="1800"
            max={new Date().getFullYear()}
            className="input-field"
            placeholder="Ex: 1985"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900">Links (opcional)</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
          <input name="site_url" type="url" className="input-field" placeholder="https://seuclubesite.com.br" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
          <input name="instagram_url" type="url" className="input-field" placeholder="https://instagram.com/seuclubeaqui" />
        </div>
      </div>

      {erro && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Enviando...' : 'Enviar clube para aprovação'}
      </button>
    </form>
  )
}
