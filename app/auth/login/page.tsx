'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { supabase, isAdmin } from '@/lib/supabase';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect') ?? '';
  const redirect = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
    ? rawRedirect
    : '/productos';
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      toast.success('¡Bienvenido de vuelta!');
      if (isAdmin(authData.user?.email)) {
        router.push('/admin');
      } else {
        router.push(redirect);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      toast.error(message.includes('Invalid login') ? 'Credenciales incorrectas' : message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error con Google';
      toast.error(message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-petfy-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center">
            <Image
              src="/petfyco_nutricion_sin_fondo.png"
              alt="PetfyCo"
              width={200}
              height={80}
              className="object-contain"
              priority
            />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          <h1 className="text-2xl font-extrabold text-navy mb-2">Iniciar sesión</h1>
          <p className="text-petfy-grey-text text-sm mb-6">Accede a tu cuenta PetfyCo</p>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3.5 text-sm font-semibold text-navy hover:bg-petfy-grey transition-colors mb-5 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07Z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3Z"/>
            </svg>
            {googleLoading ? 'Redirigiendo...' : 'Continuar con Google'}
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-petfy-grey-text">o con correo</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-petfy-grey-text" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="tu@correo.com"
                  className="input-field pl-10"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-petfy-grey-text hover:text-navy"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-accent font-medium">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-petfy-grey-text mt-5">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/registro" className="text-primary font-semibold hover:text-accent">
              Crear cuenta
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-petfy-grey-text mt-6">
          Al ingresar aceptas nuestros{' '}
          <Link href="/terminos" className="text-primary hover:underline">Términos</Link>
          {' '}y{' '}
          <Link href="/privacidad" className="text-primary hover:underline">Política de Privacidad</Link>
        </p>
      </div>
    </div>
  );
}
