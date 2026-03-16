import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Productos para Mascotas | PetfyCo',
  description: 'Explora nuestro catálogo de nutrición, higiene y accesorios premium para perros y gatos. Envío a domicilio en Medellín y área metropolitana.',
  openGraph: {
    title: 'Productos para Mascotas | PetfyCo',
    description: 'Nutrición, higiene y accesorios premium para mascotas. Domicilio en Medellín.',
    type: 'website',
    locale: 'es_CO',
  },
};

export default function ProductosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
