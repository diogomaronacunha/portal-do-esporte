'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CategoriaProduto } from '@/types/database'

type Esporte = { id: string; nome: string }

export default function NovoProdutoForm({
  categorias,
  esportes,
}: {
  categorias: CategoriaProduto[]
  esportes: Esporte[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [tamanhos, setTamanhos] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErro(null)

    const form = e.currentTarget
    const getValue = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value

    const tamanhosList = tamanhos
      .split(',')
      .map(t => t.trim().toUpperCase())
      .filter(Boolean)

    const data = {
      nome: getValue('nome'),
      descricao: getValue('descricao'),
      preco: Number(getValue('preco')),
      preco_original: getValue('preco_original') ? Number(getValue('preco_original')) : null,
      categoria_id: getValue('categoria_id') || null,
      esporte_id: getValue('esporte_id') || null,
      tamanhos_disponiveis: tamanhosList,
      imagens: getValue('imagem_url') ? [getValue('imagem_url')] : [],
    }

    const res = await fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setErro(body.error ?? 'Erro ao cadastrar produto.')
      setLoading(false)
      return
    }

    router.push('/minha-loja?novo=produto')
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do produto *</label>
        <input
          name="nome"
          required
          placeholder="Ex: Chuteira Society Elite"
          className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea
          name="descricao"
          rows={3}
          placeholder="Descreva o produto..."
          className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
          <input
            name="preco"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="99.90"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preço original (R$)</label>
          <input
            name="preco_original"
            type="number"
            step="0.01"
            min="0"
            placeholder="129.90"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
          <select
            name="categoria_id"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
          >
            <option value="">— Selecionar —</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Esporte</label>
          <select
            name="esporte_id"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
          >
            <option value="">— Selecionar —</option>
            {esportes.map(e => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tamanhos disponíveis</label>
        <input
          value={tamanhos}
          onChange={e => setTamanhos(e.target.value)}
          placeholder="P, M, G, GG ou 38, 40, 42"
          className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
        <p className="text-xs text-gray-400 mt-1">Separe por vírgula. Deixe em branco se não tiver tamanhos.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL da imagem</label>
        <input
          name="imagem_url"
          type="url"
          placeholder="https://..."
          className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
        <p className="text-xs text-gray-400 mt-1">Cole o link da imagem do produto (JPG, PNG).</p>
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-60"
      >
        {loading ? 'Enviando...' : 'Cadastrar produto'}
      </button>
    </form>
  )
}
