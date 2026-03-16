import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mis Pedidos | PetfyCo',
  description: 'Consulta el historial y estado de tus pedidos en PetfyCo.',
  robots: { index: false, follow: false },
};

export default function PedidosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
