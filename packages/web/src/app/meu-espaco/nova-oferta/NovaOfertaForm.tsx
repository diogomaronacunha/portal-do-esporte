'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  prestadorId: string
  categorias: { id: string; nome: string; slug: string; icone: string | null }[]
  esportes: { id: string; nome: string }[]
}

export default function NovaOfertaForm({ prestadorId, categorias, esportes }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = {
      prestador_id: prestadorId,
      titulo: (form.elements.namedItem('titulo') as HTMLInputElement).value.trim(),
      descricao: (form.elements.namedItem('descricao') as HTMLTextAreaElement).value.trim() || null,
      preco_original: parseFloat((form.elements.namedItem('preco_original') as HTMLInputElement).value),
      preco_oferta: parseFloat((form.elements.namedItem('preco_oferta') as HTMLInputElement).value),
      quantidade_maxima: parseInt((form.elements.namedItem('quantidade_maxima') as HTMLInputElement).value) || null,
      data_inicio: (form.elements.namedItem('data_inicio') as HTMLInputElement).value || null,
      data_fim: (form.elements.namedItem('data_fim') as HTMLInputElement).value || null,
      categoria_id: (form.elements.namedItem('categoria_id') as HTMLSelectElement).value || null,
      esporte_id: (form.elements.namedItem('esporte_id') as HTMLSelectElement).value || null,
      imagem_url: (form.elements.namedItem('imagem_url') as HTMLInputElement).value.trim() || null,
    }

    if (!data.titulo) { setError('Título é obrigatório.'); setLoading(false); return }
    if (isNaN(data.preco_original) || data.preco_original <= 0) { setError('Preço original inválido.'); setLoading(false); return }
    if (isNaN(data.preco_oferta) || data.preco_oferta <= 0) { setError('Preço de oferta inválido.'); setLoading(false); return }
    if (data.preco_oferta >= data.preco_original) { setError('O preço de oferta deve ser menor que o preço original.'); setLoading(false); return }

    const res = await fetch('/api/ofertas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Erro ao publicar oferta.')
      setLoading(false)
      return
    }

    router.push('/meu-espaco?nova=1')
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título da oferta *</label>
        <input name="titulo" className="input" placeholder="Ex: Aula de natação com 40% de desconto" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea name="descricao" rows={4} className="input" placeholder="Descreva o que está sendo oferecido, condições, etc." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preço original (R$) *</label>
          <input name="preco_original" type="number" step="0.01" min="0.01" className="input" placeholder="200,00" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preço da oferta (R$) *</label>
          <input name="preco_oferta" type="number" step="0.01" min="0.01" className="input" placeholder="120,00" required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade máxima de cupons</label>
        <input name="quantidade_maxima" type="number" min="1" className="input" placeholder="Deixe em branco para ilimitado" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data de início</label>
          <input name="data_inicio" type="date" className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data de encerramento</label>
          <input name="data_fim" type="date" className="input" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select name="categoria_id" className="input">
            <option value="">Selecione...</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Esporte relacionado</label>
          <select name="esporte_id" className="input">
            <option value="">Selecione...</option>
            {esportes.map(e => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL da imagem</label>
        <input name="imagem_url" type="url" className="input" placeholder="https://..." />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Enviando...' : 'Enviar para aprovação →'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Sua oferta será analisada pela equipe do portal antes de ser publicada.
      </p>
    </form>
  )
}
