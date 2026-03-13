'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isAdmin } from '@/lib/supabase';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth/login?redirect=/admin');
        return;
      }
      if (!isAdmin(session.user.email)) {
        router.replace('/');
        return;
      }
      setAuthorized(true);
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session || !isAdmin(session.user.email)) {
        router.replace('/auth/login?redirect=/admin');
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-petfy-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-petfy-grey-text text-sm">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-petfy-bg">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
