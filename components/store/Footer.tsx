'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Twitter, Youtube, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            {/* Logo con fondo blanco suave para que el texto del logo sea legible */}
            <div className="mb-4 inline-block bg-white/10 rounded-2xl p-3">
              <Image src="/petfyco_nutricion.png" alt="PetfyCo" width={140} height={56} className="object-contain brightness-125" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              La mejor tienda para tus mascotas. Productos premium con amor y cuidado para tu compañero peludo.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/petfyco"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://facebook.com/petfyco"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://twitter.com/petfyco"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={16} />
              </a>
              <a
                href="https://youtube.com/petfyco"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Tienda */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-5">
              Tienda
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Todos los productos', href: '/productos' },
                { label: 'Nutrición', href: '/productos?category=nutricion' },
                { label: 'Higiene', href: '/productos?category=higiene' },
                { label: 'Accesorios', href: '/productos?category=accesorios' },
                { label: 'Juguetes', href: '/productos?category=juguetes' },
                { label: 'Ofertas', href: '/productos?sort=precio_asc' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-5">
              Ayuda
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Mis pedidos', href: '/pedidos' },
                { label: 'Política de envíos', href: '/envios' },
                { label: 'Devoluciones', href: '/devoluciones' },
                { label: 'Términos y condiciones', href: '/terminos' },
                { label: 'Política de privacidad', href: '/privacidad' },
                { label: 'Contacto', href: '/contacto' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-5">
              Newsletter
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Suscríbete y recibe ofertas exclusivas y consejos para el cuidado de tus mascotas.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                if (email) {
                  import('@/lib/supabase').then(({ supabase }) => {
                    supabase.from('store_newsletter').insert({ email }).then(() => {
                      form.reset();
                      import('react-hot-toast').then(({ default: toast }) => {
                        toast.success('¡Suscripción exitosa!');
                      });
                    });
                  });
                }
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                name="email"
                placeholder="Tu correo"
                required
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-primary text-white px-3 py-2.5 rounded-xl hover:bg-accent transition-colors"
                aria-label="Suscribirse"
              >
                <Mail size={16} />
              </button>
            </form>
            <p className="text-gray-500 text-xs mt-3">
              Sin spam. Solo las mejores noticias para tus mascotas.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">
            © 2025 PetfyCo S.A.S. Bogotá, Colombia. NIT 901234567-8
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terminos" className="text-gray-500 hover:text-white text-xs transition-colors">
              Términos y Condiciones
            </Link>
            <Link href="/privacidad" className="text-gray-500 hover:text-white text-xs transition-colors">
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
