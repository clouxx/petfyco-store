'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Ingresa tu correo electrónico');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar el correo';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-petfy-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
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
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={56} className="text-primary mx-auto mb-4" />
              <h2 className="text-xl font-extrabold text-navy mb-2">¡Correo enviado!</h2>
              <p className="text-petfy-grey-text text-sm mb-6">
                Revisa tu bandeja de entrada en <strong>{email}</strong>. Te enviamos un enlace para restablecer tu contraseña.
              </p>
              <p className="text-xs text-petfy-grey-text mb-6">
                Si no lo encuentras, revisa la carpeta de spam.
              </p>
              <Link href="/auth/login" className="btn-primary inline-block px-8 py-3">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-petfy-grey-text hover:text-navy mb-6">
                <ArrowLeft size={16} />
                Volver
              </Link>
              <h1 className="text-2xl font-extrabold text-navy mb-2">Recuperar contraseña</h1>
              <p className="text-petfy-grey-text text-sm mb-6">
                Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-petfy-grey-text" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 text-base"
                >
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
