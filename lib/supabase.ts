import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[PetfyCo] Variables de entorno faltantes: NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY no están configuradas.'
  );
}

// Browser client — uses cookies so middleware can read the session
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Server-side client (API routes) — anon key, respects RLS
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

// Admin client — service role key, bypasses RLS. Solo para uso server-side.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// NOTA DE SEGURIDAD: NEXT_PUBLIC_ADMIN_EMAILS es solo un hint de UI (navbar,
// redirección post-login). NO es el gate de seguridad real — ese está en
// middleware.ts con la variable server-only ADMIN_EMAILS.
// Si prefieres no exponer emails en el bundle, deja NEXT_PUBLIC_ADMIN_EMAILS
// vacío y los admins accederán a /admin navegando directamente.
const _UI_ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

export const isAdmin = (email?: string | null) => _UI_ADMIN_EMAILS.includes(email ?? '');

export const formatCOP = (amount: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
