/**
 * Lógica de cobertura y zonas de envío — fuente de verdad única.
 * Importar desde aquí tanto en el cliente (checkout/page.tsx) como en el servidor (api/orders/route.ts).
 */

export type CoverageStatus = 'sabaneta' | 'medellin' | 'metro_close' | 'metro_far' | 'outside' | 'unknown';

export const FREE_SHIPPING_THRESHOLD = 150_000;

export const SHIPPING_BY_ZONE: Record<CoverageStatus, number> = {
  sabaneta:    5_000,
  medellin:    8_000,
  metro_close: 8_000,
  metro_far:   10_000,
  outside:     12_000,
  unknown:     8_000,
};

const SABANETA    = ['sabaneta'];
const MEDELLIN    = ['medellín', 'medellin'];
const METRO_CLOSE = ['itagüí', 'itagui', 'envigado', 'la estrella'];
const METRO_FAR   = ['bello', 'copacabana'];

export function getCoverageStatus(city: string, depto: string): CoverageStatus {
  if (!city || !depto) return 'unknown';
  if (depto !== 'Antioquia') return 'outside';
  const n = city.toLowerCase().trim();
  if (SABANETA.includes(n))    return 'sabaneta';
  if (MEDELLIN.includes(n))    return 'medellin';
  if (METRO_CLOSE.includes(n)) return 'metro_close';
  if (METRO_FAR.includes(n))   return 'metro_far';
  return 'outside';
}

export function calcShipping(subtotal: number, city: string, depto: string): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_BY_ZONE[getCoverageStatus(city, depto)];
}
