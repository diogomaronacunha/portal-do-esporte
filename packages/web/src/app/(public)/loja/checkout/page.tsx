import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CheckoutForm from './CheckoutForm'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/loja/checkout')

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Finalizar pedido</h1>
          <CheckoutForm userEmail={user.email ?? ''} />
        </div>
      </main>
      <Footer />
    </>
  )
}
