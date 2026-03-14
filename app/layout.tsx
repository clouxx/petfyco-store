import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PetfyCo Tienda | Nutrición y Limpieza para Mascotas',
  description:
    'PetfyCo es la tienda en línea colombiana especializada en productos premium para mascotas. Nutrición, higiene, accesorios y más con envío a toda Colombia.',
  keywords: 'mascotas, perros, gatos, nutrición, higiene, accesorios, Colombia, tienda online',
  icons: { icon: '/favicon.png', apple: '/favicon.png' },
  openGraph: {
    title: 'PetfyCo Tienda | Nutrición y Limpieza para Mascotas',
    description: 'Productos premium para tus mascotas con envío a toda Colombia.',
    type: 'website',
    locale: 'es_CO',
    images: [{ url: '/logo.png', width: 400, height: 160, alt: 'PetfyCo' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans">
        {children}
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
