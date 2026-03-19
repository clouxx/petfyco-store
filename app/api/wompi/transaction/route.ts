import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

const WOMPI_SANDBOX_URL = 'https://sandbox.wompi.co/v1';
const WOMPI_PROD_URL = 'https://production.wompi.co/v1';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing transaction id' }, { status: 400 });
  }

  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: 'Wompi not configured' }, { status: 503 });
  }

  const baseUrl = privateKey.startsWith('prv_test_') ? WOMPI_SANDBOX_URL : WOMPI_PROD_URL;

  try {
    const res = await fetch(`${baseUrl}/transactions/${id}`, {
      headers: { Authorization: `Bearer ${privateKey}` },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Wompi API error:', res.status, text);
      return NextResponse.json({ error: 'Wompi API error', status: res.status }, { status: 502 });
    }

    const json = await res.json();
    const tx = json.data;
    const status: string = tx?.status ?? 'ERROR';
    const reference: string = tx?.reference ?? '';

    // Actualizar estado del pedido en Supabase
    if (reference) {
      const supabase = createClient();
      const orderStatus =
        status === 'APPROVED' ? 'confirmed' :
        status === 'DECLINED' || status === 'VOIDED' ? 'cancelled' :
        'pending';

      await supabase
        .from('store_orders')
        .update({ payment_status: status.toLowerCase(), status: orderStatus })
        .eq('order_number', reference);

      // Enviar email de confirmación si el pago fue aprobado
      if (status === 'APPROVED') {
        const { data: order } = await supabase
          .from('store_orders')
          .select(`
            order_number, billing_name, billing_email,
            delivery_address, delivery_city, delivery_depto,
            subtotal, shipping, total, payment_method,
            store_order_items (product_name, quantity, unit_price, subtotal)
          `)
          .eq('order_number', reference)
          .maybeSingle();

        if (order) {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://petfyco-store.vercel.app';
          fetch(`${siteUrl}/api/email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '',
            },
            body: JSON.stringify({
              order_number: order.order_number,
              billing_name: order.billing_name,
              billing_email: order.billing_email,
              delivery_address: order.delivery_address,
              delivery_city: order.delivery_city,
              delivery_depto: order.delivery_depto,
              items: order.store_order_items,
              subtotal: order.subtotal,
              shipping: order.shipping,
              total: order.total,
              payment_method: order.payment_method,
            }),
          }).catch(() => {});
        }
      }
    }

    return NextResponse.json({
      status,
      reference,
      amount_in_cents: tx?.amount_in_cents,
      payment_method: tx?.payment_method_type,
    });
  } catch (err) {
    console.error('Transaction check error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
  }
}
