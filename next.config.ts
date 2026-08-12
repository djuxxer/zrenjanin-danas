import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
    // Smanjen broj varijanti veličina (Next.js podrazumevano pravi do 16 po slici).
    // Slike su već kompresovane na klijentu pre otpremanja (WebP, max 1600px),
    // pa manje varijanti ovde znači manje posla za Sharp i manji memorijski
    // otisak servera — sveden na stvarne veličine koje sajt zaista koristi.
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256],
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ]
  },
}

export default nextConfig
