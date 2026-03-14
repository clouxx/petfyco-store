'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Truck, ShieldCheck, Headphones, ArrowRight, Star, Zap, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/store/ProductCard';
import type { Product, Category } from '@/lib/types';
import toast from 'react-hot-toast';

const CAT_CONFIG: Record<string, { icon: string; gradient: string; light: string }> = {
  nutricion:  { icon: '🥩', gradient: 'from-orange-400 to-orange-600',  light: 'bg-orange-50' },
  higiene:    { icon: '🛁', gradient: 'from-sky-400 to-blue-600',        light: 'bg-sky-50' },
  accesorios: { icon: '🎀', gradient: 'from-pink-400 to-rose-500',       light: 'bg-pink-50' },
  juguetes:   { icon: '🎾', gradient: 'from-yellow-400 to-amber-500',    light: 'bg-yellow-50' },
  salud:      { icon: '💊', gradient: 'from-emerald-400 to-green-600',   light: 'bg-emerald-50' },
  camas:      { icon: '🛏️', gradient: 'from-violet-400 to-purple-600',   light: 'bg-violet-50' },
};

const FALLBACK_CATS: Category[] = [
  { id:'1', name:'Nutrición',       slug:'nutricion',  active:true },
  { id:'2', name:'Higiene',         slug:'higiene',    active:true },
  { id:'3', name:'Accesorios',      slug:'accesorios', active:true },
  { id:'4', name:'Juguetes',        slug:'juguetes',   active:true },
  { id:'5', name:'Salud',           slug:'salud',      active:true },
  { id:'6', name:'Camas y Descanso',slug:'camas',      active:true },
];

const TRUST = [
  { icon: <Truck size={26} />,       title: 'Envío a toda Colombia',    sub: 'Gratis desde $150.000',     color: 'text-primary', bg: 'bg-primary/10' },
  { icon: <ShieldCheck size={26} />, title: 'Productos Certificados',   sub: 'Aprobados por veterinarios', color: 'text-accent',  bg: 'bg-accent/10'  },
  { icon: <Headphones size={26} />,  title: 'Soporte 24 / 7',           sub: 'Expertos a tu disposición',  color: 'text-sky-500', bg: 'bg-sky-50'     },
  { icon: <Star size={26} />,        title: '4.9 ★ Satisfacción',       sub: '+2.000 clientes felices',    color: 'text-amber-500',bg: 'bg-amber-50'  },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [email, setEmail]           = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: cats }  = await supabase.from('store_categories').select('*').eq('active',true).order('name');
      const { data: prods } = await supabase.from('store_products')
        .select('*, category:store_categories(*)')
        .eq('active',true).eq('featured',true)
        .order('created_at',{ascending:false}).limit(8);
      setCategories(cats?.length ? cats : FALLBACK_CATS);
      setFeatured(prods || []);
      setLoading(false);
    })();
  }, []);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      const { error } = await supabase.from('store_newsletter').insert({ email });
      if (error && error.code !== '23505') throw error;
      toast.success('¡Bienvenido a la familia PetfyCo! 🐾');
      setEmail('');
    } catch { toast.error('Hubo un error. Intenta de nuevo.'); }
    finally { setSubscribing(false); }
  };

  return (
    <div className="bg-white">

      {/* ═══ HERO ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A3D1A] via-[#2D7A2D] to-[#5aab3a]" />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-1/2 w-[900px] h-[900px] rounded-full bg-black/10 -translate-x-1/4 translate-y-1/2" />
        <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 animate-fade-up">
              <Zap size={13} className="text-accent" />
              Envío gratis en compras +$150.000
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6 animate-fade-up delay-100">
              Todo lo que tu<br/>
              <span className="text-accent">mascota</span> merece
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-10 max-w-lg animate-fade-up delay-200">
              Nutrición premium, higiene y accesorios entregados a domicilio en Colombia.
              Porque ellos son familia.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up delay-300">
              <Link href="/productos" className="inline-flex items-center gap-2 bg-accent text-white font-bold px-8 py-4 rounded-full hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-accent/30 text-base">
                Ver Catálogo <ArrowRight size={18} />
              </Link>
              <Link href="/#nosotros" className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-bold px-8 py-4 rounded-full hover:bg-white/10 transition-all text-base">
                Conócenos
              </Link>
            </div>
            <div className="flex gap-8 mt-12 animate-fade-up delay-400">
              {[['2K+','Clientes'],['500+','Productos'],['4.9★','Valoración']].map(([n,l])=>(
                <div key={l}>
                  <p className="text-2xl font-extrabold text-white">{n}</p>
                  <p className="text-white/60 text-sm">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center animate-fade-in delay-300">
            <Image src="/petfyco_nutricion_sin_fondo.png" alt="PetfyCo" width={420} height={420}
              className="animate-float"
              style={{ filter: 'drop-shadow(0 0 1px white) drop-shadow(0 0 1px white) drop-shadow(0 0 1px white) drop-shadow(0 4px 24px rgba(0,0,0,0.3))' }}
              priority />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,80 L1440,80 L1440,20 C1200,70 960,0 720,30 C480,60 240,10 0,40 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ═══ DOMICILIO BANNER ════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-r from-accent via-[#f0952a] to-accent overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {['🐕','🐈','🐾','🏠','🚚','🐕','🐈','🐾','🏠','🚚'].map((e, i) => (
            <span key={i} className="absolute text-4xl select-none" style={{ top: `${(i * 37) % 100}%`, left: `${(i * 19) % 100}%` }}>{e}</span>
          ))}
        </div>
        <div className="relative max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="text-4xl animate-bounce-slow flex-shrink-0">🏠</div>
            <div>
              <p className="text-white font-extrabold text-xl md:text-2xl leading-tight tracking-tight">
                ¡No salgas de casa! Nosotros llevamos todo.
              </p>
              <p className="text-white/85 text-sm md:text-base mt-0.5">
                Tus mascotas felices sin que muevas un pie — pedido listo en 1 a 3 días.
              </p>
            </div>
          </div>
          <Link
            href="/productos"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-accent font-extrabold px-7 py-3.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all text-sm whitespace-nowrap"
          >
            <Truck size={18} /> Pedir a domicilio
          </Link>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══════════════════════════════════════════════════ */}
      <section className="py-14 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST.map((t,i)=>(
            <div key={i} className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-50">
              <div className={`${t.bg} ${t.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                {t.icon}
              </div>
              <div>
                <p className="font-bold text-navy text-sm">{t.title}</p>
                <p className="text-petfy-grey-text text-xs mt-0.5">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CATEGORIES ══════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy tracking-tight">Explora por categoría</h2>
          <p className="text-petfy-grey-text text-base mt-2">Encuentra exactamente lo que tu compañero necesita</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat)=>{
            const cfg = CAT_CONFIG[cat.slug] || { icon:'🐾', gradient:'from-gray-400 to-gray-600', light:'bg-gray-50' };
            return (
              <Link key={cat.id} href={`/productos?category=${cat.slug}`}
                className="group relative flex flex-col items-center gap-3 rounded-3xl p-6 overflow-hidden
                           border-2 border-transparent hover:border-primary/20
                           bg-white shadow-card hover:shadow-card-hover
                           hover:-translate-y-2 transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}/>
                <div className={`relative w-14 h-14 ${cfg.light} rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
                  {cfg.icon}
                </div>
                <span className="relative text-sm font-bold text-navy group-hover:text-primary transition-colors text-center leading-snug">
                  {cat.name}
                </span>
                <ArrowRight size={14} className="relative text-petfy-grey-text group-hover:text-primary group-hover:translate-x-1 transition-all"/>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ FEATURED PRODUCTS ════════════════════════════════════════════ */}
      <section className="py-20 bg-[#F7FBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <Heart size={12}/> Los favoritos
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-navy tracking-tight">Productos Destacados</h2>
            </div>
            <Link href="/productos" className="hidden md:inline-flex items-center gap-1.5 text-primary font-semibold hover:text-accent transition-colors text-sm">
              Ver todos <ArrowRight size={15}/>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({length:8}).map((_,i)=>(
                <div key={i} className="bg-white rounded-3xl overflow-hidden">
                  <div className="aspect-square skeleton"/>
                  <div className="p-4 space-y-3">
                    <div className="h-4 skeleton rounded-full w-3/4"/>
                    <div className="h-4 skeleton rounded-full w-1/2"/>
                    <div className="h-10 skeleton rounded-2xl"/>
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-card">
              <Image src="/petfyco_nutricion_sin_fondo.png" alt="" width={120} height={120} className="mx-auto mb-4 opacity-70"/>
              <p className="text-navy font-bold text-xl">¡Pronto tendremos productos!</p>
              <p className="text-petfy-grey-text mt-2">Ejecuta el schema.sql en Supabase para ver el catálogo</p>
              <Link href="/admin" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-full mt-6 hover:brightness-110 transition-all">
                Ir al Admin <ArrowRight size={16}/>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((p)=>(
                <ProductCard key={p.id} product={p}/>
              ))}
            </div>
          )}

          <div className="text-center mt-10 md:hidden">
            <Link href="/productos" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-full">
              Ver todos los productos <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ WHY PETFYCO ════════════════════════════════════════════════ */}
      <section id="nosotros" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative flex justify-center order-2 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-[3rem] blur-3xl"/>
            <Image src="/petfyco_nutricion_sin_fondo.png" alt="PetfyCo" width={380} height={380}
              className="relative animate-float-slow drop-shadow-xl"/>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              Nuestra historia
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy tracking-tight mb-6">
              ¿Por qué elegir <span className="text-primary">PetfyCo</span>?
            </h2>
            <p className="text-petfy-grey-text leading-relaxed mb-8">
              Somos una empresa colombiana apasionada por el bienestar animal. Cada producto ha sido
              seleccionado por expertos en nutrición y salud veterinaria.
            </p>
            <div className="space-y-4">
              {[
                { icon:'🚚', title:'Entrega rápida',        desc:'1-3 días hábiles a todo el país' },
                { icon:'✅', title:'Calidad garantizada',   desc:'Productos certificados por veterinarios' },
                { icon:'💚', title:'Amor por los animales', desc:'Apoyamos refugios locales con cada compra' },
              ].map(({icon,title,desc})=>(
                <div key={title} className="flex items-start gap-4 bg-[#F7FBF7] rounded-2xl p-4 hover:shadow-card transition-all duration-300">
                  <span className="text-2xl mt-0.5">{icon}</span>
                  <div>
                    <p className="font-bold text-navy">{title}</p>
                    <p className="text-petfy-grey-text text-sm mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/productos" className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-full mt-8 hover:brightness-110 transition-all shadow-lg">
              Descubrir productos <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ NEWSLETTER ════════════════════════════════════════════════ */}
      <section className="mx-4 sm:mx-8 lg:mx-auto max-w-6xl mb-20 rounded-[3rem] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A3D1A] via-[#2D7A2D] to-[#5aab3a]"/>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-accent/20 blur-3xl"/>
        <div className="relative py-16 px-8 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-4">Newsletter</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Ofertas exclusivas<br/>para tus peludos
            </h2>
            <p className="text-white/75 leading-relaxed">
              Suscríbete y recibe descuentos únicos, tips de cuidado y las últimas novedades directo en tu correo.
            </p>
          </div>
          <div>
            <form onSubmit={subscribe} className="space-y-3">
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="tu@correo.com" required
                className="w-full bg-white/15 border-2 border-white/30 rounded-2xl px-5 py-4 text-white placeholder-white/50 focus:outline-none focus:border-white/70 transition-colors text-base"/>
              <button type="submit" disabled={subscribing}
                className="w-full bg-accent text-white font-bold py-4 rounded-2xl hover:brightness-110 disabled:opacity-50 transition-all shadow-xl shadow-accent/30 text-base">
                {subscribing ? 'Suscribiendo...' : '¡Quiero las ofertas!'}
              </button>
            </form>
            <p className="text-white/50 text-xs mt-3 text-center">Sin spam. Cancela cuando quieras.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
