import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client — uses cookies so middleware can read the session
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Server-side client (API routes)
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

export const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

export const isAdmin = (email?: string | null) => ADMIN_EMAILS.includes(email ?? '');

export const formatCOP = (amount: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
