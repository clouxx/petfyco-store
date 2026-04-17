'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatCOP } from '@/lib/supabase';

const FREE_SHIPPING_THRESHOLD = 150000;
const SHIPPING_COST = 8000;

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart, coupon, applyCoupon, removeCoupon } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const cartTotal = total();
  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const discount = coupon?.discount_amount ?? 0;
  const orderTotal = cartTotal - discount + shipping;

  const handlePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim(), subtotal: cartTotal }),
      });
      const data = await res.json() as { valid: boolean; error?: string; coupon_code?: string; discount_type?: 'percentage' | 'fixed'; discount_value?: number; discount_amount?: number };
      if (!data.valid) {
        setPromoError(data.error ?? 'Cupón no válido');
      } else {
        applyCoupon({
          code: data.coupon_code!,
          discount_type: data.discount_type!,
          discount_value: data.discount_value!,
          discount_amount: data.discount_amount!,
        });
        setPromoCode('');
      }
    } catch {
      setPromoError('Error al validar el cupón. Intenta de nuevo.');
    } finally {
      setPromoLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-8xl mb-6">🛒</div>
        <h1 className="text-3xl font-extrabold text-navy mb-3">Tu carrito está vacío</h1>
        <p className="text-petfy-grey-text mb-8">Agrega productos para comenzar tu compra</p>
        <Link href="/productos" className="btn-primary inline-flex items-center gap-2">
          <ShoppingCart size={18} />
          Explorar productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-extrabold text-navy">Mi Carrito</h1>
        <span className="bg-primary text-white text-sm font-bold rounded-full px-3 py-1">
          {items.reduce((s, i) => s + i.quantity, 0)} items
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const img = item.product.images?.[0] || 'https://images.unsplash.com/photo-1601758064978-4e9c55a11fcb?w=200&h=200&fit=crop';
            return (
              <div key={item.product.id} className="bg-white rounded-2xl shadow-card p-5 flex gap-5">
                <Link href={`/producto/${item.product.slug}`} className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-petfy-grey">
                  <Image src={img} alt={item.product.name} fill className="object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <Link href={`/producto/${item.product.slug}`} className="font-semibold text-navy hover:text-primary transition-colors line-clamp-2 text-sm">
                        {item.product.name}
                      </Link>
                      {item.product.sku && (
                        <p className="text-xs text-petfy-grey-text mt-0.5">SKU: {item.product.sku}</p>
                      )}
                      {item.product.category && (
                        <span className="badge bg-primary/10 text-primary mt-1">{item.product.category.name}</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQty(item.product.id, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-petfy-grey transition-colors text-navy"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-navy">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-9 h-9 flex items-center justify-center hover:bg-petfy-grey transition-colors text-navy disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-navy text-lg">{formatCOP(item.product.price * item.quantity)}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-petfy-grey-text">{formatCOP(item.product.price)} c/u</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between pt-4">
            <Link href="/productos" className="flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors text-sm">
              <ArrowLeft size={16} />
              Continuar comprando
            </Link>
            <button
              onClick={() => clearCart()}
              className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors"
            >
              Vaciar carrito
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-navy mb-6">Resumen del pedido</h2>

            {/* Shipping progress */}
            {cartTotal < FREE_SHIPPING_THRESHOLD && (
              <div className="bg-blue-50 rounded-xl p-4 mb-5">
                <p className="text-xs text-navy mb-2">
                  Agrega{' '}
                  <span className="text-primary font-semibold">
                    {formatCOP(FREE_SHIPPING_THRESHOLD - cartTotal)}
                  </span>{' '}
                  más para obtener envío gratis
                </p>
                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-petfy-grey-text">Subtotal</span>
                <span className="font-medium text-navy">{formatCOP(cartTotal)}</span>
              </div>
              {discount > 0 && coupon && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-green-600">
                    Cupón {coupon.code} ({coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatCOP(coupon.discount_value)})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-600">-{formatCOP(discount)}</span>
                    <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500 text-xs transition-colors" title="Quitar cupón">✕</button>
                  </div>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-petfy-grey-text">Envío</span>
                <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-navy'}`}>
                  {shipping === 0 ? '¡Gratis!' : formatCOP(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-extrabold text-navy pt-3 border-t border-gray-100">
                <span>Total</span>
                <span className="text-primary">{formatCOP(orderTotal)}</span>
              </div>
            </div>

            {/* Promo code */}
            {!coupon && (
              <div className="mb-5">
                <label className="block text-xs font-semibold text-navy mb-2">Código de descuento</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                    placeholder="PETFY10"
                    disabled={promoLoading}
                    onKeyDown={(e) => { if (e.key === 'Enter') handlePromo(); }}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  />
                  <button
                    onClick={handlePromo}
                    disabled={promoLoading || !promoCode.trim()}
                    className="bg-navy text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-navy/80 transition-colors disabled:opacity-50"
                  >
                    {promoLoading ? '...' : 'Aplicar'}
                  </button>
                </div>
                {promoError && <p className="text-red-500 text-xs mt-1.5">{promoError}</p>}
              </div>
            )}
            {coupon && (
              <div className="mb-5 bg-green-50 rounded-xl px-4 py-2.5 text-green-700 text-xs font-medium">
                ¡Cupón <span className="font-bold">{coupon.code}</span> aplicado!
              </div>
            )}

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full btn-primary py-4 text-base"
            >
              Proceder al pago
              <ArrowRight size={18} />
            </Link>

            <p className="text-xs text-petfy-grey-text text-center mt-3">
              Pago 100% seguro con cifrado SSL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
