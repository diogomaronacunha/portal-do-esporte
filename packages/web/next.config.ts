import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
      { protocol: 'http', hostname: 'portaldoesporte.com.br' },
      { protocol: 'https', hostname: 'portaldoesporte.com.br' },
    ],
  },
}

export default nextConfig
