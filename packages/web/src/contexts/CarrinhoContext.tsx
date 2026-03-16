'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { CarrinhoItemLocal, Produto } from '@/types/database'

interface CarrinhoContextValue {
  items: CarrinhoItemLocal[]
  count: number
  total: number
  addItem: (produto: Produto, quantidade?: number, tamanho?: string | null) => void
  removeItem: (produtoId: string, tamanho?: string | null) => void
  updateQuantity: (produtoId: string, tamanho: string | null, quantidade: number) => void
  clearCart: () => void
}

const CarrinhoContext = createContext<CarrinhoContextValue | null>(null)
const STORAGE_KEY = 'portal-esporte-carrinho'

function itemKey(produtoId: string, tamanho: string | null) {
  return `${produtoId}::${tamanho ?? ''}`
}

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CarrinhoItemLocal[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch { /* ignorar erros de parse */ }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const addItem = useCallback((produto: Produto, quantidade = 1, tamanho: string | null = null) => {
    setItems(prev => {
      const key = itemKey(produto.id, tamanho)
      const exists = prev.find(i => itemKey(i.produto.id, i.tamanho) === key)
      if (exists) {
        return prev.map(i =>
          itemKey(i.produto.id, i.tamanho) === key
            ? { ...i, quantidade: i.quantidade + quantidade }
            : i
        )
      }
      return [...prev, { produto, quantidade, tamanho }]
    })
  }, [])

  const removeItem = useCallback((produtoId: string, tamanho: string | null = null) => {
    setItems(prev => prev.filter(i => itemKey(i.produto.id, i.tamanho) !== itemKey(produtoId, tamanho)))
  }, [])

  const updateQuantity = useCallback((produtoId: string, tamanho: string | null, quantidade: number) => {
    if (quantidade <= 0) {
      removeItem(produtoId, tamanho)
      return
    }
    setItems(prev =>
      prev.map(i =>
        itemKey(i.produto.id, i.tamanho) === itemKey(produtoId, tamanho)
          ? { ...i, quantidade }
          : i
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => setItems([]), [])

  const count = items.reduce((acc, i) => acc + i.quantidade, 0)
  const total = items.reduce((acc, i) => acc + i.produto.preco * i.quantidade, 0)

  return (
    <CarrinhoContext.Provider value={{ items, count, total, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CarrinhoContext.Provider>
  )
}

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext)
  if (!ctx) throw new Error('useCarrinho deve ser usado dentro de CarrinhoProvider')
  return ctx
}
