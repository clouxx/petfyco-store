import Link from 'next/link';
import {
  DollarSign, ShoppingBag, Package, AlertTriangle,
  Plus, Eye, FileText,
} from 'lucide-react';
import { createAdminClient, formatCOP } from '@/lib/supabase';
import KPICard from '@/components/admin/KPICard';
import SalesChart from '@/components/admin/SalesChart';
import type { Order, Product } from '@/lib/types';

interface DailySales { date: string; total: number }

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmado', shipped: 'Enviado',
  delivered: 'Entregado', cancelled: 'Cancelado',
};

export const revalidate = 60; // revalida cada 60s

export default async function AdminDashboard() {
  const supabase = createAdminClient();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [ordersToday, ordersMonth, pendingOrders, products, recentOrd, lowStock, chartOrders] = await Promise.all([
    supabase.from('store_orders').select('total').gte('created_at', todayStart).neq('status', 'cancelled'),
    supabase.from('store_orders').select('total').gte('created_at', monthStart).neq('status', 'cancelled'),
    supabase.from('store_orders').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('store_products').select('id', { count: 'exact' }).eq('active', true),
    supabase.from('store_orders').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('store_products').select('*').eq('active', true).lte('stock', 5).order('stock', { ascending: true }).limit(10),
    supabase.from('store_orders').select('created_at, total').gte('created_at', thirtyDaysAgo).neq('status', 'cancelled').order('created_at'),
  ]);

  const todayTotal = (ordersToday.data || []).reduce((s: number, o: { total: number }) => s + (o.total || 0), 0);
  const monthTotal = (ordersMonth.data || []).reduce((s: number, o: { total: number }) => s + (o.total || 0), 0);
  const pendingCount = pendingOrders.count || 0;
  const activeProducts = products.count || 0;
  const recentOrders = (recentOrd.data || []) as Order[];
  const lowStockData = (lowStock.data || []) as Product[];
  const lowStockCount = lowStockData.filter((p) => p.stock < 5).length;

  const dailyMap: Record<string, number> = {};
  (chartOrders.data || []).forEach((o: { created_at: string; total: number }) => {
    const d = o.created_at.slice(0, 10);
    dailyMap[d] = (dailyMap[d] || 0) + (o.total || 0);
  });
  const salesData: DailySales[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    salesData.push({
      date: d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }),
      total: dailyMap[key] || 0,
    });
  }

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-navy">Dashboard</h1>
        <p className="text-petfy-grey-text text-sm mt-1">
          {now.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">
        <KPICard title="Ventas hoy" value={formatCOP(todayTotal)} icon={DollarSign} color="#4CB5F9" />
        <KPICard title="Ventas del mes" value={formatCOP(monthTotal)} icon={DollarSign} color="#56C4F2" />
        <KPICard title="Pedidos pendientes" value={String(pendingCount)} icon={ShoppingBag} color="#FF9800" />
        <KPICard title="Productos activos" value={String(activeProducts)} icon={Package} color="#4CB5F9" />
        <KPICard title="Stock bajo" value={String(lowStockCount)} icon={AlertTriangle} color="#E91E63" subtitle="menos de 5 unidades" />
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
        <h2 className="font-bold text-navy text-lg mb-5">Ventas — Últimos 30 días</h2>
        <SalesChart data={salesData} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-navy text-lg">Pedidos Recientes</h2>
            <Link href="/admin/pedidos" className="text-primary text-sm font-semibold hover:text-accent">
              Ver todos
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Pedido</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Cliente</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Total</th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Estado</th>
                  <th className="text-left py-2 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-petfy-grey/50 transition-colors">
                    <td className="py-3 pr-4 font-semibold text-navy">{order.order_number}</td>
                    <td className="py-3 pr-4 text-navy truncate max-w-[140px]">{order.billing_name}</td>
                    <td className="py-3 pr-4 font-semibold text-navy">{formatCOP(order.total)}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-3 text-petfy-grey-text text-xs">
                      {new Date(order.created_at).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Low Stock */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-petfy-orange" />
              <h2 className="font-bold text-navy">Stock Bajo</h2>
            </div>
            {lowStockData.length === 0 ? (
              <p className="text-petfy-grey-text text-sm">Todo el inventario está bien 🎉</p>
            ) : (
              <div className="space-y-2">
                {lowStockData.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <p className="text-sm text-navy font-medium truncate max-w-[160px]">{p.name}</p>
                    <span className={`badge text-xs ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                      {p.stock} uds
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-navy mb-4">Acciones rápidas</h2>
            <div className="space-y-2">
              <Link href="/admin/catalogo/nuevo" className="flex items-center gap-3 p-3 rounded-xl hover:bg-petfy-grey transition-colors text-sm font-medium text-navy">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Plus size={15} className="text-primary" />
                </div>
                Nuevo Producto
              </Link>
              <Link href="/admin/pedidos" className="flex items-center gap-3 p-3 rounded-xl hover:bg-petfy-grey transition-colors text-sm font-medium text-navy">
                <div className="w-8 h-8 bg-petfy-orange/10 rounded-lg flex items-center justify-center">
                  <Eye size={15} className="text-petfy-orange" />
                </div>
                Ver Pedidos
              </Link>
              <Link href="/admin/facturacion" className="flex items-center gap-3 p-3 rounded-xl hover:bg-petfy-grey transition-colors text-sm font-medium text-navy">
                <div className="w-8 h-8 bg-petfy-pink/10 rounded-lg flex items-center justify-center">
                  <FileText size={15} className="text-petfy-pink" />
                </div>
                Generar Factura
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
