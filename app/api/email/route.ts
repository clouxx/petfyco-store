import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// FROM temporal hasta tener dominio petfyco.com verificado en Resend
// Cambiar a: 'PetfyCo <pedidos@petfyco.com>' cuando esté el dominio
const FROM = 'PetfyCo <onboarding@resend.dev>';

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface OrderEmailPayload {
  order_number: string;
  billing_name: string;
  billing_email: string;
  delivery_address: string;
  delivery_city: string;
  delivery_depto: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: string;
}

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}

function buildOrderConfirmationHtml(order: OrderEmailPayload): string {
  const itemsHtml = order.items.map((item) => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#1A3D1A;font-size:14px;">${escapeHtml(item.product_name)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#666;font-size:14px;text-align:center;">${escapeHtml(item.quantity)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;color:#1A3D1A;font-size:14px;text-align:right;font-weight:600;">${formatCOP(item.subtotal)}</td>
    </tr>
  `).join('');

  const paymentLabel: Record<string, string> = {
    wompi: 'Wompi (tarjeta / PSE / Nequi)',
    transferencia: 'Transferencia bancaria',
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#2D7A2D,#1A3D1A);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">PetfyCo</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Nutrición y cuidado para tus mascotas</p>
          </td>
        </tr>

        <!-- Hero message -->
        <tr>
          <td style="padding:36px 40px 24px;text-align:center;border-bottom:1px solid #f0f0f0;">
            <div style="font-size:40px;margin-bottom:12px;">🐾</div>
            <h2 style="margin:0 0 8px;color:#1A3D1A;font-size:22px;font-weight:700;">¡Recibimos tu pedido!</h2>
            <p style="margin:0;color:#666;font-size:15px;">Gracias por confiar en PetfyCo. Estamos preparando todo para ti.</p>
            <div style="margin:20px auto 0;background:#f0f7f0;border:2px solid #2D7A2D;border-radius:12px;display:inline-block;padding:10px 24px;">
              <p style="margin:0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Número de pedido</p>
              <p style="margin:4px 0 0;font-size:20px;font-weight:800;color:#2D7A2D;">${order.order_number}</p>
            </div>
          </td>
        </tr>

        <!-- Items -->
        <tr>
          <td style="padding:28px 40px 0;">
            <h3 style="margin:0 0 16px;color:#1A3D1A;font-size:16px;font-weight:700;">Resumen del pedido</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:12px;overflow:hidden;">
              <thead>
                <tr style="background:#f8f8f8;">
                  <th style="padding:10px 16px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Producto</th>
                  <th style="padding:10px 16px;text-align:center;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Cant.</th>
                  <th style="padding:10px 16px;text-align:right;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <!-- Totals -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;">Subtotal</td>
                <td style="padding:6px 0;color:#1A3D1A;font-size:14px;text-align:right;">${formatCOP(order.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;">Envío</td>
                <td style="padding:6px 0;font-size:14px;text-align:right;${order.shipping === 0 ? 'color:#2D7A2D;font-weight:600;' : 'color:#1A3D1A;'}">${order.shipping === 0 ? '¡Gratis!' : formatCOP(order.shipping)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0 6px;color:#1A3D1A;font-size:16px;font-weight:700;border-top:2px solid #f0f0f0;">Total</td>
                <td style="padding:10px 0 6px;color:#2D7A2D;font-size:18px;font-weight:800;text-align:right;border-top:2px solid #f0f0f0;">${formatCOP(order.total)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Delivery info -->
        <tr>
          <td style="padding:24px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;border-radius:12px;padding:20px;">
              <tr>
                <td>
                  <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1A3D1A;">📍 Dirección de entrega</p>
                  <p style="margin:0;font-size:14px;color:#444;">${escapeHtml(order.delivery_address)}</p>
                  <p style="margin:4px 0 0;font-size:14px;color:#666;">${escapeHtml(order.delivery_city)}, ${escapeHtml(order.delivery_depto)}</p>
                </td>
              </tr>
              <tr><td style="padding-top:16px;">
                <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1A3D1A;">💳 Método de pago</p>
                <p style="margin:0;font-size:14px;color:#444;">${escapeHtml(paymentLabel[order.payment_method] || order.payment_method)}</p>
                ${order.payment_method === 'transferencia' ? `
                <div style="margin-top:10px;padding:12px;background:#fff3cd;border-radius:8px;border:1px solid #ffc107;">
                  <p style="margin:0;font-size:13px;color:#856404;">⚠️ Recuerda enviar el comprobante de pago a <strong>pagos@petfyco.com</strong> con tu número de pedido <strong>${escapeHtml(order.order_number)}</strong></p>
                </div>` : ''}
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Next steps -->
        <tr>
          <td style="padding:0 40px 28px;">
            <div style="background:#e8f5e9;border-radius:12px;padding:20px;">
              <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#1A3D1A;">¿Qué sigue ahora?</p>
              <p style="margin:0 0 6px;font-size:13px;color:#444;">✅ Te notificaremos por <strong>WhatsApp</strong> cuando tu pedido salga a domicilio.</p>
              <p style="margin:0 0 6px;font-size:13px;color:#444;">📦 Puedes consultar el estado en <strong>${process.env.NEXT_PUBLIC_SITE_URL ?? 'petfyco-store.vercel.app'}/pedidos</strong></p>
              <p style="margin:0;font-size:13px;color:#444;">📞 ¿Dudas? Escríbenos: <a href="https://wa.me/573177931145" style="color:#2D7A2D;font-weight:600;">WhatsApp</a></p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1A3D1A;padding:24px 40px;text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.7);font-size:12px;">© 2026 PetfyCo · Sabaneta, Antioquia, Colombia</p>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.5);font-size:11px;">Este es un mensaje automático, por favor no respondas a este correo.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  // Only internal server-to-server calls are allowed
  const internalSecret = process.env.INTERNAL_API_SECRET;
  if (!internalSecret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }
  if (req.headers.get('x-internal-secret') !== internalSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const order: OrderEmailPayload = await req.json();

    if (!order.billing_email || !order.order_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(order.billing_email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to: order.billing_email,
      subject: `PetfyCo — Confirmación de pedido ${order.order_number}`,
      html: buildOrderConfirmationHtml(order),
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Email error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
