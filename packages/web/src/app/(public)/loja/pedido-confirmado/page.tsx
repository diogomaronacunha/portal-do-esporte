import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = { title: 'Pedido Confirmado' }

type Props = { searchParams: Promise<{ pedido?: string; status?: string }> }

export default async function PedidoConfirmadoPage({ searchParams }: Props) {
  const { pedido, status } = await searchParams

  const pago = status === 'approved'
  const pendente = status === 'pending' || status === 'in_process'

  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {pago ? (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento confirmado!</h1>
              <p className="text-gray-500 mb-2">
                Seu pedido foi registrado com sucesso.
              </p>
            </>
          ) : pendente ? (
            <>
              <div className="text-6xl mb-4">⏳</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento em análise</h1>
              <p className="text-gray-500 mb-2">
                Seu pedido foi recebido e aguarda confirmação do pagamento.
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">📦</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido recebido!</h1>
              <p className="text-gray-500 mb-2">
                Obrigado pela compra. Acompanhe o status pelo seu perfil.
              </p>
            </>
          )}

          {pedido && (
            <p className="text-xs text-gray-400 mb-6">Pedido: {pedido}</p>
          )}

          <div className="flex flex-col gap-3">
            <Link href="/meu-perfil" className="btn-primary">
              Ver meus pedidos
            </Link>
            <Link href="/loja" className="text-sm text-primary-600 hover:underline">
              Continuar comprando
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
