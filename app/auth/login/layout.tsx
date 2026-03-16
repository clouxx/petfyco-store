import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | PetfyCo',
  description: 'Ingresa a tu cuenta PetfyCo para gestionar tus pedidos.',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
