import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// SEGURIDAD: leer desde variable server-only (sin NEXT_PUBLIC_) para que los
// emails de admin NO se incluyan en el bundle JavaScript del cliente.
// Configura ADMIN_EMAILS en Vercel → Settings → Environment Variables (server).
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proteger rutas /admin — redirigir si no está autenticado o no es admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
