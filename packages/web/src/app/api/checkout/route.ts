import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://portal-do-esporte-phi.vercel.app'

interface ItemPayload {
  produto_id: string
  lojista_id: string
  nome_produto: string
  preco_unitario: number
  quantidade: number
  tamanho: string | null
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const { endereco, itens } = body as { endereco: Record<string, string>; itens: ItemPayload[] }

  if (!itens?.length) {
    return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 })
  }

  const total = itens.reduce((acc, i) => acc + i.preco_unitario * i.quantidade, 0)

  // 1. Criar pedido no banco
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      comprador_id: user.id,
      status: 'aguardando_pagamento',
      total,
      endereco_entrega: endereco,
    })
    .select('id')
    .single()

  if (pedidoError || !pedido) {
    return NextResponse.json({ error: pedidoError?.message ?? 'Erro ao criar pedido' }, { status: 500 })
  }

  // 2. Inserir itens do pedido
  const { error: itensError } = await supabase.from('pedidos_itens').insert(
    itens.map(i => ({
      pedido_id: pedido.id,
      produto_id: i.produto_id,
      lojista_id: i.lojista_id,
      nome_produto: i.nome_produto,
      preco_unitario: i.preco_unitario,
      quantidade: i.quantidade,
      tamanho: i.tamanho,
    }))
  )

  if (itensError) {
    return NextResponse.json({ error: itensError.message }, { status: 500 })
  }

  // 3. Criar preferência no MercadoPago
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    // Sem MP configurado — redirecionar direto para confirmação
    return NextResponse.json({
      init_point: `${BASE_URL}/loja/pedido-confirmado?pedido=${pedido.id}`,
    })
  }

  const mp = new MercadoPagoConfig({ accessToken })
  const preference = new Preference(mp)

  const pref = await preference.create({
    body: {
      external_reference: pedido.id,
      items: itens.map(i => ({
        id: i.produto_id,
        title: i.nome_produto + (i.tamanho ? ` (${i.tamanho})` : ''),
        quantity: i.quantidade,
        unit_price: i.preco_unitario,
        currency_id: 'BRL',
      })),
      payer: { email: user.email },
      back_urls: {
        success: `${BASE_URL}/loja/pedido-confirmado?pedido=${pedido.id}&status=approved`,
        failure: `${BASE_URL}/loja/carrinho`,
        pending: `${BASE_URL}/loja/pedido-confirmado?pedido=${pedido.id}&status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${BASE_URL}/api/checkout/webhook`,
    },
  })

  return NextResponse.json({ init_point: pref.init_point })
}
