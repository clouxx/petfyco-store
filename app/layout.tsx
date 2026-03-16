import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PetfyCo Tienda | Nutrición y Limpieza para Mascotas',
  description:
    'PetfyCo es la tienda en línea especializada en productos premium para mascotas. Nutrición, higiene, accesorios y más con domicilio en Medellín y su área metropolitana.',
  keywords: 'mascotas, perros, gatos, nutrición, higiene, accesorios, Medellín, domicilio, tienda online',
  icons: { icon: '/favicon.png', apple: '/favicon.png' },
  openGraph: {
    title: 'PetfyCo Tienda | Nutrición y Limpieza para Mascotas',
    description: 'Productos premium para tus mascotas con domicilio en Medellín y su área metropolitana.',
    type: 'website',
    locale: 'es_CO',
    images: [{ url: '/logo.png', width: 400, height: 160, alt: 'PetfyCo' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  return (
    <html lang="es" className={inter.variable}>
      <head>
        {pixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`,
            }}
          />
        )}
      </head>
      <body className="font-sans">
        {children}
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#2D2D2D',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#2D7A2D',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#E91E63',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
