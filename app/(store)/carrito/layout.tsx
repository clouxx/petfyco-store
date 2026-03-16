import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mi Carrito | PetfyCo',
  description: 'Revisa los productos seleccionados y continúa con tu compra.',
  robots: { index: false, follow: false },
};

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
