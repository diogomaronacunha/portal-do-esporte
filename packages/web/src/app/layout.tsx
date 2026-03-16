import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { CarrinhoProvider } from '@/contexts/CarrinhoContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Portal do Esporte | Esporte Amador Gaúcho',
    template: '%s | Portal do Esporte',
  },
  description:
    'O maior portal do esporte amador do Rio Grande do Sul. Notícias, eventos, atletas e muito mais.',
  keywords: ['esporte', 'amador', 'Rio Grande do Sul', 'RS', 'futebol', 'vôlei', 'atletismo'],
  openGraph: {
    siteName: 'Portal do Esporte',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <CarrinhoProvider>
          {children}
        </CarrinhoProvider>
      </body>
    </html>
  )
}
