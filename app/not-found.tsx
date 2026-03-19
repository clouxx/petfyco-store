import Link from 'next/link';

export const metadata = {
  title: 'Página no encontrada | PetfyCo',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-4">🐾</div>
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          ¡Ups! Esta página se escapó
        </h2>
        <p className="text-gray-500 mb-8">
          No encontramos lo que buscabas. Puede que el enlace haya cambiado o que la página ya no exista.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Ir al inicio
          </Link>
          <Link
            href="/productos"
            className="border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary/5 transition-colors"
          >
            Ver productos
          </Link>
        </div>
      </div>
    </div>
  );
}
