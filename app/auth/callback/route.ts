import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
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

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.exchangeCodeForSession(code);
  const email = data.user?.email ?? '';

  if (ADMIN_EMAILS.includes(email)) {
    return NextResponse.redirect(`${siteUrl}/admin`);
  }

  return NextResponse.redirect(`${siteUrl}${safeRedirect}`);
}
