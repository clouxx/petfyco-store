import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import crypto from 'crypto';

// Wompi envía eventos POST con el cuerpo del evento y una firma en el header
// Docs: https://docs.wompi.co/docs/colombia/eventos/
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Validar firma si WOMPI_EVENTS_SECRET está configurado
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
  if (eventsSecret) {
    const checksum = req.headers.get('x-event-checksum') ?? '';
    const timestamp = req.headers.get('x-event-timestamp') ?? '';

    // Wompi firma: HMAC-SHA256(secret, timestamp + body_string)
    const expected = crypto
      .createHmac('sha256', eventsSecret)
      .update(`${timestamp}${JSON.stringify(body)}`)
      .digest('hex');

    if (expected !== checksum) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  const event = body as {
    event?: string;
    data?: { transaction?: Record<string, unknown> };
    sent_at?: string;
  };

  if (event.event !== 'transaction.updated') {
    return NextResponse.json({ received: true });
  }

  const tx = event.data?.transaction as {
    id?: string;
    reference?: string;
    status?: string;
    amount_in_cents?: number;
    currency?: string;
  } | undefined;

  if (!tx?.reference || !tx?.status) {
    return NextResponse.json({ received: true });
  }

  const status = tx.status;
  const reference = tx.reference;

  const orderStatus =
    status === 'APPROVED' ? 'confirmed' :
    status === 'DECLINED' || status === 'VOIDED' ? 'cancelled' :
    'pending';

  try {
    const supabase = createClient();

    await supabase
      .from('store_orders')
      .update({ payment_status: status.toLowerCase(), status: orderStatus })
      .eq('order_number', reference);

    // Enviar email de confirmación cuando el pago sea aprobado
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
          headers: { 'Content-Type': 'application/json' },
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

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
