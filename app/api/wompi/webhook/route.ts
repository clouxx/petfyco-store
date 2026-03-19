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

  // Validar firma — OBLIGATORIO. Sin secret configurado el webhook no opera.
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
  if (!eventsSecret) {
    console.error('Webhook rejected: WOMPI_EVENTS_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const checksum = req.headers.get('x-event-checksum') ?? '';
  const timestamp = req.headers.get('x-event-timestamp') ?? '';

  if (!checksum || !timestamp) {
    return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 });
  }

  // Validar que el timestamp no tenga más de 5 minutos (anti replay-attack)
  const eventTime = parseInt(timestamp, 10);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (isNaN(eventTime) || Math.abs(nowSeconds - eventTime) > 300) {
    return NextResponse.json({ error: 'Request expired' }, { status: 401 });
  }

  // Wompi firma: HMAC-SHA256(secret, timestamp + body_string)
  const expected = crypto
    .createHmac('sha256', eventsSecret)
    .update(`${timestamp}${JSON.stringify(body)}`)
    .digest('hex');

  const expectedBuf = Buffer.from(expected, 'hex');
  const checksumBuf = Buffer.from(checksum.length === expected.length ? checksum : '', 'hex');
  if (checksumBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(expectedBuf, checksumBuf)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
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

    // B2 — idempotency: no reprocessar si ya fue aprobado
    const { data: existing } = await supabase
      .from('store_orders')
      .select('payment_status')
      .eq('order_number', reference)
      .maybeSingle();

    if (existing?.payment_status === 'approved') {
      return NextResponse.json({ received: true });
    }

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

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
