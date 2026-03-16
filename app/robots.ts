import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/checkout', '/carrito', '/pedidos', '/auth/'],
      },
    ],
    sitemap: 'https://petfyco.com/sitemap.xml',
  };
}
