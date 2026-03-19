/**
 * Rate limiter con sliding window en memoria.
 *
 * Limitación: en-memoria por instancia serverless — no distribuido entre
 * instancias de Vercel. Para producción a escala, migrar a Upstash Redis
 * (@upstash/ratelimit) o Vercel KV.
 *
 * Cubre la gran mayoría de abusos: un atacante común opera desde pocos IPs
 * y choca contra los límites dentro de la misma instancia caliente.
 */

interface WindowEntry {
  timestamps: number[];
  blockedUntil?: number;
}

const store = new Map<string, WindowEntry>();

// Limpieza periódica para no acumular entradas en memoria
let lastCleanup = Date.now();
function maybeCleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, entry] of store.entries()) {
    const cutoff = now - windowMs;
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0 && (!entry.blockedUntil || entry.blockedUntil < now)) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * @param key       Identificador único (ej. `orders:${ip}`)
 * @param limit     Máximo de requests permitidos en la ventana
 * @param windowMs  Duración de la ventana en milisegundos
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  maybeCleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;

  if (!store.has(key)) store.set(key, { timestamps: [] });

  const entry = store.get(key)!;

  // Bloqueo temporal activo
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return { allowed: false, remaining: 0, resetInMs: entry.blockedUntil - now };
  }

  // Descartar timestamps fuera de la ventana (sliding window)
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= limit) {
    const resetInMs = windowMs - (now - entry.timestamps[0]);
    entry.blockedUntil = now + resetInMs;
    return { allowed: false, remaining: 0, resetInMs };
  }

  entry.timestamps.push(now);
  return { allowed: true, remaining: limit - entry.timestamps.length, resetInMs: windowMs };
}

/** Extrae IP real del request (Vercel pone la IP en x-forwarded-for) */
export function getIp(req: Request): string {
  return (
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}
