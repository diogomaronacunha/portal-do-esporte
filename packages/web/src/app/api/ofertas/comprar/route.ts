import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://portal-do-esporte-phi.vercel.app'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { oferta_id } = await request.json()
  if (!oferta_id) return NextResponse.json({ error: 'oferta_id obrigatório' }, { status: 400 })

  // Buscar oferta
  const { data: oferta } = await supabase
    .from('ofertas')
    .select('id, titulo, preco_oferta, quantidade_maxima, quantidade_vendida, status, data_fim, prestador_id')
    .eq('id', oferta_id)
    .eq('status', 'ativa')
    .single()

  if (!oferta) return NextResponse.json({ error: 'Oferta não encontrada ou inativa' }, { status: 404 })

  // Verificar se esgotada ou expirada
  if (oferta.quantidade_maxima !== null && oferta.quantidade_vendida >= oferta.quantidade_maxima) {
    return NextResponse.json({ error: 'Oferta esgotada' }, { status: 409 })
  }
  if (oferta.data_fim && new Date(oferta.data_fim) < new Date()) {
    return NextResponse.json({ error: 'Oferta expirada' }, { status: 410 })
  }

  const admin = createAdminClient()

  // Criar cupom
  const { data: cupom, error: cupomError } = await admin
    .from('cupons_oferta')
    .insert({ oferta_id, comprador_id: user.id })
    .select('id, codigo')
    .single()

  if (cupomError || !cupom) {
    return NextResponse.json({ error: 'Erro ao gerar cupom' }, { status: 500 })
  }

  // Incrementar quantidade vendida
  await admin
    .from('ofertas')
    .update({ quantidade_vendida: oferta.quantidade_vendida + 1 })
    .eq('id', oferta_id)

  // Pagamento via MercadoPago (se configurado)
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    // Sem MP — cupom gerado diretamente
    return NextResponse.json({ codigo: cupom.codigo })
  }

  const mp = new MercadoPagoConfig({ accessToken })
  const preference = new Preference(mp)

  const pref = await preference.create({
    body: {
      external_reference: cupom.id,
      items: [{
        id: oferta.id,
        title: oferta.titulo,
        quantity: 1,
        unit_price: oferta.preco_oferta,
        currency_id: 'BRL',
      }],
      payer: { email: user.email },
      back_urls: {
        success: `${BASE_URL}/ofertas/cupom?codigo=${cupom.codigo}`,
        failure: `${BASE_URL}/ofertas`,
        pending: `${BASE_URL}/ofertas/cupom?codigo=${cupom.codigo}&status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${BASE_URL}/api/checkout/webhook`,
    },
  })

  return NextResponse.json({ init_point: pref.init_point })
}
