import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear Cuenta | PetfyCo',
  description: 'Regístrate en PetfyCo y disfruta de domicilios y seguimiento de tus pedidos.',
  robots: { index: false, follow: false },
};

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return children;
}
