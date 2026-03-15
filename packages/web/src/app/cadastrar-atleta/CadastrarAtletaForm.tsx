'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Esporte } from '@/types/database'

export default function CadastrarAtletaForm({ esportes }: { esportes: Esporte[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [esportesSelecionados, setEsportesSelecionados] = useState<string[]>([])

  function toggleEsporte(nome: string) {
    setEsportesSelecionados((prev) =>
      prev.includes(nome) ? prev.filter((e) => e !== nome) : [...prev, nome]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    if (esportesSelecionados.length === 0) {
      setErro('Selecione pelo menos um esporte.')
      setLoading(false)
      return
    }

    const form = new FormData(e.currentTarget)
    const payload = {
      nome: form.get('nome'),
      bio: form.get('bio'),
      cidade: form.get('cidade'),
      estado: form.get('estado') || 'RS',
      clube_nome: form.get('clube_nome'),
      conquistas: form.get('conquistas'),
      instagram_url: form.get('instagram_url'),
      facebook_url: form.get('facebook_url'),
      esportes: esportesSelecionados,
    }

    try {
      const res = await fetch('/api/atletas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.error ?? 'Erro ao cadastrar atleta.')
      } else {
        setSucesso(true)
        setTimeout(() => router.push('/atletas'), 2000)
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
        <h2 className="text-xl font-bold text-gray-900 mb-2">Perfil enviado!</h2>
        <p className="text-gray-500">
          Seu perfil foi enviado para aprovação e em breve aparecerá na página de atletas.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados pessoais */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900">Dados pessoais</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome completo <span className="text-red-500">*</span>
          </label>
          <input name="nome" required className="input-field" placeholder="Seu nome completo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sobre você</label>
          <textarea
            name="bio"
            rows={3}
            className="input-field resize-none"
            placeholder="Conte um pouco sobre sua trajetória no esporte..."
          />
        </div>
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
      </div>

      {/* Esportes */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-900">
          Modalidades <span className="text-red-500">*</span>
        </h2>
        <p className="text-sm text-gray-500">Selecione os esportes que você pratica.</p>
        <div className="flex flex-wrap gap-2">
          {esportes.map((esp) => {
            const selecionado = esportesSelecionados.includes(esp.nome)
            return (
              <button
                key={esp.id}
                type="button"
                onClick={() => toggleEsporte(esp.nome)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selecionado
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                }`}
              >
                {esp.nome}
              </button>
            )
          })}
        </div>
      </div>

      {/* Clube e conquistas */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900">Clube e conquistas</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clube / Associação</label>
          <input name="clube_nome" className="input-field" placeholder="Nome do seu clube" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Conquistas</label>
          <textarea
            name="conquistas"
            rows={2}
            className="input-field resize-none"
            placeholder="Ex: Campeão gaúcho de atletismo 2025, Vice-campeão regional..."
          />
        </div>
      </div>

      {/* Redes sociais */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900">Redes sociais (opcional)</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
          <input
            name="instagram_url"
            type="url"
            className="input-field"
            placeholder="https://instagram.com/seuperfil"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
          <input
            name="facebook_url"
            type="url"
            className="input-field"
            placeholder="https://facebook.com/seuperfil"
          />
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
        {loading ? 'Enviando...' : 'Enviar perfil para aprovação'}
      </button>
    </form>
  )
}
