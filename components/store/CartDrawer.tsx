'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatCOP } from '@/lib/supabase';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const FREE_SHIPPING_THRESHOLD = 150000;
const SHIPPING_COST = 8000;

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { items, removeItem, updateQty, total, itemCount } = useCartStore();
  const cartTotal = total();
  const count = itemCount();
  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const orderTotal = cartTotal + shipping;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-navy">Carrito</h2>
            {count > 0 && (
              <span className="bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-petfy-grey transition-colors text-navy"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="text-6xl">🛒</div>
              <p className="text-navy font-semibold text-lg">Tu carrito está vacío</p>
              <p className="text-petfy-grey-text text-sm">
                Agrega productos para comenzar tu compra
              </p>
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Ver productos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const img = item.product.images?.[0] || 'https://images.unsplash.com/photo-1601758064978-4e9c55a11fcb?w=100&h=100&fit=crop';
                return (
                  <div key={item.product.id} className="flex gap-3 bg-petfy-grey rounded-xl p-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={img} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy line-clamp-2 leading-snug">
                        {item.product.name}
                      </p>
                      <p className="text-primary font-bold text-sm mt-1">
                        {formatCOP(item.product.price)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQty(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-navy border border-gray-200"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-navy">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-7 h-7 rounded-lg bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-colors text-navy border border-gray-200 disabled:opacity-50"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 space-y-3 bg-white">
            {/* Shipping progress */}
            {cartTotal < FREE_SHIPPING_THRESHOLD && (
              <div className="bg-petfy-grey rounded-xl p-3">
                <p className="text-xs text-petfy-grey-text mb-2">
                  Te faltan{' '}
                  <span className="text-primary font-semibold">
                    {formatCOP(FREE_SHIPPING_THRESHOLD - cartTotal)}
                  </span>{' '}
                  para envío gratis
                </p>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between text-sm text-navy">
              <span className="text-petfy-grey-text">Subtotal</span>
              <span className="font-medium">{formatCOP(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-navy">
              <span className="text-petfy-grey-text">Envío</span>
              <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                {shipping === 0 ? 'Gratis' : formatCOP(shipping)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-navy pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-primary">{formatCOP(orderTotal)}</span>
            </div>

            <Link
              href="/checkout"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full btn-primary text-center"
            >
              Ir al Checkout
              <ArrowRight size={16} />
            </Link>

            <button
              onClick={onClose}
              className="w-full text-sm text-petfy-grey-text hover:text-navy transition-colors py-1"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
