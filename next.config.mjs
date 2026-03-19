/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'zziupfzzbcnskhmgotxs.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Evita que el sitio se incruste en iframes de otros dominios (clickjacking)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Bloquea MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Fuerza HTTPS por 1 año (solo activo en producción con dominio propio)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Controla qué información de referrer se comparte
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restringe el acceso a APIs sensibles del navegador
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js requiere unsafe-inline para scripts de hidratación (sin nonces)
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              // Solo imágenes de dominios conocidos
              "img-src 'self' data: blob: https://zziupfzzbcnskhmgotxs.supabase.co https://images.unsplash.com",
              "font-src 'self'",
              // Fetch/XHR solo a Supabase (Wompi se llama server-side desde API routes)
              "connect-src 'self' https://zziupfzzbcnskhmgotxs.supabase.co wss://zziupfzzbcnskhmgotxs.supabase.co",
              // Sin iframes, sin plugins
              "frame-src 'none'",
              "object-src 'none'",
              // Previene inyección de base tag y hijacking de formularios
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      {
        // Las rutas admin nunca deben cachearse
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};
export default nextConfig;
