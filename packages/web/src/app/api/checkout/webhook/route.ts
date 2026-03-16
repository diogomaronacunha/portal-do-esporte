import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase/admin'

// Webhook MercadoPago — atualiza status do pedido conforme pagamento
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ ok: true })

  const { type, data } = body

  if (type !== 'payment' || !data?.id) {
    return NextResponse.json({ ok: true })
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) return NextResponse.json({ ok: true })

  try {
    const mp = new MercadoPagoConfig({ accessToken })
    const paymentClient = new Payment(mp)
    const payment = await paymentClient.get({ id: data.id })

    const pedidoId = payment.external_reference
    if (!pedidoId) return NextResponse.json({ ok: true })

    const statusMap: Record<string, string> = {
      approved: 'pago',
      in_process: 'aguardando_pagamento',
      pending: 'aguardando_pagamento',
      rejected: 'cancelado',
      cancelled: 'cancelado',
      refunded: 'cancelado',
    }

    const novoStatus = statusMap[payment.status ?? '']
    if (!novoStatus) return NextResponse.json({ ok: true })

    const supabase = createAdminClient()
    await supabase
      .from('pedidos')
      .update({
        status: novoStatus,
        pagamento_id: String(payment.id),
        pagamento_metodo: payment.payment_method_id ?? null,
      })
      .eq('id', pedidoId)
  } catch {
    // Logar mas não retornar erro — MP vai retentar
  }

  return NextResponse.json({ ok: true })
}
