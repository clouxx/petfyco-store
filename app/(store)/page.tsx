'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, Star, Headphones, ArrowRight, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/store/ProductCard';
import type { Product, Category } from '@/lib/types';
import toast from 'react-hot-toast';

const CATEGORY_ICONS: Record<string, string> = {
  nutricion: '🥩',
  higiene: '🛁',
  accesorios: '🎀',
  juguetes: '🎾',
  salud: '💊',
  camas: '🛏️',
};

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Nutrición', slug: 'nutricion', active: true },
  { id: '2', name: 'Higiene', slug: 'higiene', active: true },
  { id: '3', name: 'Accesorios', slug: 'accesorios', active: true },
  { id: '4', name: 'Juguetes', slug: 'juguetes', active: true },
  { id: '5', name: 'Salud', slug: 'salud', active: true },
  { id: '6', name: 'Camas y Descanso', slug: 'camas', active: true },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // Load categories
      const { data: cats } = await supabase
        .from('store_categories')
        .select('*')
        .eq('active', true)
        .order('name');
      setCategories(cats && cats.length > 0 ? cats : FALLBACK_CATEGORIES);

      // Load featured products
      const { data: prods } = await supabase
        .from('store_products')
        .select('*, category:store_categories(*)')
        .eq('active', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(8);
      setFeaturedProducts(prods || []);
      setLoadingProducts(false);
    };
    loadData();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribing(true);
    try {
      const { error } = await supabase
        .from('store_newsletter')
        .insert({ email: newsletterEmail });
      if (error && error.code !== '23505') throw error;
      toast.success('¡Gracias por suscribirte! 🐾');
      setNewsletterEmail('');
    } catch {
      toast.error('Hubo un error. Intenta de nuevo.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-primary via-accent to-blue-200 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 text-8xl">🐕</div>
          <div className="absolute top-1/2 right-1/4 text-6xl">🐈</div>
          <div className="absolute bottom-10 right-20 text-5xl">🐾</div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium mb-6">
              <span>🐾</span>
              <span>Envío gratis en compras mayores a $150.000</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              Todo lo que tu mascota necesita
            </h1>
            <p className="text-white/90 text-lg md:text-xl mb-8 leading-relaxed">
              Nutrición premium y productos de limpieza entregados a domicilio en Colombia.
              Porque ellos se merecen lo mejor.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-2xl hover:bg-petfy-grey transition-colors shadow-lg"
              >
                Ver Productos
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/#nosotros"
                className="inline-flex items-center gap-2 border-2 border-white text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors"
              >
                Conocer más
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 30C360 0 0 30 0 30L0 60Z" fill="#F5F5F7" />
          </svg>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-navy mb-3">Explora por categoría</h2>
          <p className="text-petfy-grey-text">Todo lo que necesita tu compañero peludo</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/productos?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              <span className="text-4xl">{CATEGORY_ICONS[cat.slug] || '🐾'}</span>
              <span className="text-sm font-semibold text-navy group-hover:text-primary transition-colors text-center">
                {cat.name}
              </span>
              <ChevronRight size={14} className="text-petfy-grey-text group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-16 bg-petfy-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-navy mb-2">Productos Destacados</h2>
              <p className="text-petfy-grey-text">Los favoritos de nuestros clientes</p>
            </div>
            <Link
              href="/productos"
              className="hidden md:flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors"
            >
              Ver todos
              <ArrowRight size={16} />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-10 bg-gray-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-6xl mb-4">🐾</p>
              <p className="text-navy font-semibold text-lg">¡Pronto tendremos productos!</p>
              <p className="text-petfy-grey-text mt-2">Estamos preparando nuestro catálogo</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link href="/productos" className="btn-primary inline-flex items-center gap-2">
              Ver todos los productos
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section id="nosotros" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-navy mb-3">¿Por qué PetfyCo?</h2>
          <p className="text-petfy-grey-text">Tu confianza es nuestra prioridad</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Truck size={28} className="text-primary" />,
              title: 'Envío a todo Colombia',
              description: 'Entregamos en cualquier ciudad del país. Envío gratis en compras mayores a $150.000.',
              bg: 'bg-blue-50',
            },
            {
              icon: <Star size={28} className="text-petfy-orange" />,
              title: 'Calidad Premium',
              description: 'Solo productos certificados y probados por veterinarios y dueños de mascotas.',
              bg: 'bg-orange-50',
            },
            {
              icon: <Headphones size={28} className="text-petfy-pink" />,
              title: 'Soporte 24/7',
              description: 'Nuestro equipo de expertos está disponible para ayudarte en cualquier momento.',
              bg: 'bg-pink-50',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card p-8 text-center">
              <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-navy mb-3">{item.title}</h3>
              <p className="text-petfy-grey-text text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-4xl">📧</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-4 mb-3">
            ¡No te pierdas nada!
          </h2>
          <p className="text-white/90 mb-8">
            Suscríbete y recibe ofertas exclusivas, tips de cuidado y novedades para tus mascotas.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Tu correo electrónico"
              required
              className="flex-1 rounded-xl px-5 py-3.5 text-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="bg-navy text-white font-bold px-6 py-3.5 rounded-xl hover:bg-navy/80 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {subscribing ? 'Suscribiendo...' : 'Suscribirme'}
            </button>
          </form>
          <p className="text-white/70 text-xs mt-3">Sin spam. Cancela cuando quieras.</p>
        </div>
      </section>
    </div>
  );
}
