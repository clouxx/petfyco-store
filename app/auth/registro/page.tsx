'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Eye, EyeOff, User, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const schema = z.object({
  nombre: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
  terms: z.boolean().refine((v) => v === true, 'Debes aceptar los términos'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegistroPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.nombre },
        },
      });
      if (error) throw error;

      // Insertar perfil en tabla profiles para que checkout pueda pre-llenarse
      if (authData.user) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          display_name: data.nombre,
          email: data.email,
        });
      }

      toast.success('¡Cuenta creada! Revisa tu correo para confirmar.');
      router.push('/auth/login?message=confirm');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear cuenta';
      toast.error(message.includes('already registered') ? 'Este correo ya está registrado' : message);
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-extrabold text-navy mb-2">Crear cuenta</h1>
          <p className="text-petfy-grey-text text-sm mb-6">Únete a la familia PetfyCo</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Nombre completo</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-petfy-grey-text" />
                <input
                  {...register('nombre')}
                  placeholder="Tu nombre"
                  className="input-field pl-10"
                />
              </div>
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
            </div>

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
                  placeholder="Mínimo 6 caracteres"
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

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Confirmar contraseña</label>
              <input
                {...register('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Repite la contraseña"
                className="input-field"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  {...register('terms')}
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-petfy-grey-text leading-relaxed">
                  Acepto los{' '}
                  <Link href="/terminos" className="text-primary hover:underline">Términos y Condiciones</Link>
                  {' '}y la{' '}
                  <Link href="/privacidad" className="text-primary hover:underline">Política de Privacidad</Link>
                  {' '}de PetfyCo
                </span>
              </label>
              {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-petfy-grey-text mt-5">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-primary font-semibold hover:text-accent">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
