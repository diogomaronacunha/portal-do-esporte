import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acesse o Portal do Esporte para cadastrar eventos e perfis de atletas.',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="max-w-md w-full mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="text-primary-600 font-bold text-2xl">
            ⚽ Portal do Esporte
          </a>
          <p className="text-gray-500 mt-2">Esporte amador gaúcho</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Entrar na sua conta</h1>
          <p className="text-gray-500 text-sm mb-6">
            Digite seu e-mail e enviaremos um link de acesso. Sem senha necessária.
          </p>
          <LoginForm searchParams={searchParams} />
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Ao entrar, você concorda com nossos{' '}
          <a href="/privacidade" className="text-primary-600 hover:underline">
            termos de uso
          </a>
          .
        </p>
      </div>
    </div>
  )
}
