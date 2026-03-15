'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Esporte } from '@/types/database'

interface Props {
  esportes: Esporte[]
  userId: string
}

export default function CadastrarEventoForm({ esportes, userId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const form = e.currentTarget
    const data = new FormData(form)

    const payload = {
      titulo: data.get('titulo') as string,
      descricao: data.get('descricao') as string || null,
      data_inicio: data.get('data_inicio') as string,
      data_fim: data.get('data_fim') as string || null,
      hora_inicio: data.get('hora_inicio') as string || null,
      local_nome: data.get('local_nome') as string,
      local_endereco: data.get('local_endereco') as string || null,
      local_cidade: data.get('local_cidade') as string || 'Porto Alegre',
      esporte_id: data.get('esporte_id') as string || null,
      organizador_nome: data.get('organizador_nome') as string,
      organizador_contato: data.get('organizador_contato') as string || null,
      gratuito: data.get('gratuito') === 'true',
      url_inscricao: data.get('url_inscricao') as string || null,
    }

    try {
      const res = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, criado_por: userId }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Erro ao cadastrar evento')
      }

      setSucesso(true)
      form.reset()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (sucesso) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Evento cadastrado!</h2>
        <p className="text-gray-500 mb-6">
          Seu evento foi enviado para análise. Em breve ele aparecerá no calendário.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setSucesso(false)}
            className="btn-primary"
          >
            Cadastrar outro evento
          </button>
          <button
            onClick={() => router.push('/eventos')}
            className="border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50"
          >
            Ver calendário
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {erro}
        </div>
      )}

      {/* Dados do evento */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Dados do Evento</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do evento <span className="text-red-500">*</span>
          </label>
          <input
            name="titulo"
            type="text"
            required
            placeholder="Ex: Corrida 5K Parque da Redenção"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Esporte / Modalidade
          </label>
          <select name="esporte_id" className="input-field">
            <option value="">Selecione...</option>
            {esportes.map((e) => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            name="descricao"
            rows={3}
            placeholder="Detalhes sobre o evento, categorias, premiação..."
            className="input-field resize-none"
          />
        </div>
      </section>

      {/* Data e horário */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Data e Horário</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de início <span className="text-red-500">*</span>
            </label>
            <input name="data_inicio" type="date" required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de término
            </label>
            <input name="data_fim" type="date" className="input-field" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Horário de início
          </label>
          <input name="hora_inicio" type="time" className="input-field w-40" />
        </div>
      </section>

      {/* Local */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Local</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do local <span className="text-red-500">*</span>
          </label>
          <input
            name="local_nome"
            type="text"
            required
            placeholder="Ex: Parque da Redenção"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço
          </label>
          <input
            name="local_endereco"
            type="text"
            placeholder="Rua, número, bairro"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cidade
          </label>
          <input
            name="local_cidade"
            type="text"
            defaultValue="Porto Alegre"
            className="input-field"
          />
        </div>
      </section>

      {/* Organizador */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Organizador</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do organizador / clube <span className="text-red-500">*</span>
          </label>
          <input
            name="organizador_nome"
            type="text"
            required
            placeholder="Ex: Associação Atletismo RS"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contato (telefone, e-mail ou WhatsApp)
          </label>
          <input
            name="organizador_contato"
            type="text"
            placeholder="(51) 99999-9999 ou email@exemplo.com"
            className="input-field"
          />
        </div>
      </section>

      {/* Inscrições */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Inscrições</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            O evento é gratuito?
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="gratuito" value="true" defaultChecked />
              <span className="text-sm">Sim, gratuito</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="gratuito" value="false" />
              <span className="text-sm">Não, tem inscrição paga</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link de inscrição (se houver)
          </label>
          <input
            name="url_inscricao"
            type="url"
            placeholder="https://sympla.com.br/..."
            className="input-field"
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-3 text-base disabled:opacity-50"
      >
        {loading ? 'Cadastrando...' : 'Enviar para aprovação'}
      </button>

      <p className="text-center text-xs text-gray-400">
        O evento será revisado e publicado em até 24h após o envio.
      </p>
    </form>
  )
}
