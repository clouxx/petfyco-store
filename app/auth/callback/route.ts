import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') ?? '/productos';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://petfyco-store.vercel.app';

  const safeRedirect =
    redirect.startsWith('/') && !redirect.startsWith('//')
      ? redirect
      : '/productos';

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/auth/login`);
  }

  const response = NextResponse.redirect(`${siteUrl}${safeRedirect}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data } = await supabase.auth.exchangeCodeForSession(code);
  const email = data.user?.email ?? '';

  const destination = ADMIN_EMAILS.includes(email) ? '/admin' : safeRedirect;
  return NextResponse.redirect(`${siteUrl}${destination}`, {
    headers: response.headers,
  });
}
