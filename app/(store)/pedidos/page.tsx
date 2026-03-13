'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { supabase, formatCOP } from '@/lib/supabase';
import type { Order } from '@/lib/types';
import toast from 'react-hot-toast';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export default function PedidosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newOrderNumber = searchParams.get('order');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(newOrderNumber);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login?redirect=/pedidos');
        return;
      }
      setAuthenticated(true);

      const { data } = await supabase
        .from('store_orders')
        .select('*, items:store_order_items(*)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  useEffect(() => {
    if (newOrderNumber) {
      toast.success(`¡Pedido ${newOrderNumber} creado exitosamente! 🎉`);
    }
  }, [newOrderNumber]);

  if (!authenticated || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-petfy-grey-text mt-4">Cargando tus pedidos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-navy mb-8">Mis Pedidos</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-16 text-center">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-navy mb-2">No tienes pedidos aún</h2>
          <p className="text-petfy-grey-text mb-6">Cuando realices tu primera compra aparecerá aquí</p>
          <button onClick={() => router.push('/productos')} className="btn-primary">
            Explorar productos
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' };
            const isExpanded = expandedOrder === order.id || expandedOrder === order.order_number;
            const orderDate = new Date(order.created_at).toLocaleDateString('es-CO', {
              year: 'numeric', month: 'long', day: 'numeric'
            });

            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-petfy-grey/50 transition-colors"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-navy text-sm">{order.order_number}</p>
                      <p className="text-xs text-petfy-grey-text">{orderDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`badge ${status.color}`}>{status.label}</span>
                    <span className="font-extrabold text-navy hidden sm:block">{formatCOP(order.total)}</span>
                    {isExpanded ? <ChevronUp size={18} className="text-petfy-grey-text" /> : <ChevronDown size={18} className="text-petfy-grey-text" />}
                  </div>
                </button>

                {/* Order Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-6 pb-6 pt-5 space-y-5">
                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-navy text-sm mb-3">Productos</h3>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm bg-petfy-grey rounded-xl px-4 py-3">
                              <span className="text-navy">
                                {item.product_name}
                                <span className="text-petfy-grey-text ml-2">x{item.quantity}</span>
                              </span>
                              <span className="font-semibold text-navy">{formatCOP(item.subtotal)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="bg-petfy-grey rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-petfy-grey-text">Subtotal</span>
                        <span>{formatCOP(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-petfy-grey-text">Envío</span>
                        <span>{order.shipping === 0 ? 'Gratis' : formatCOP(order.shipping)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-navy pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span className="text-primary">{formatCOP(order.total)}</span>
                      </div>
                    </div>

                    {/* Delivery info */}
                    <div>
                      <h3 className="font-semibold text-navy text-sm mb-2">Dirección de entrega</h3>
                      <p className="text-sm text-petfy-grey-text">
                        {order.delivery_address || order.billing_address}, {order.delivery_city || order.billing_city}, {order.delivery_depto || order.billing_depto}
                      </p>
                    </div>

                    {/* Payment status */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-navy">Estado del pago</p>
                        <p className="text-sm text-petfy-grey-text capitalize">{order.payment_status}</p>
                      </div>
                      {order.status === 'delivered' && (
                        <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                          <Check size={16} />
                          Entregado
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
