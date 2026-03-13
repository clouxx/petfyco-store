'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, ShoppingBag, DollarSign, Package } from 'lucide-react';
import { supabase, formatCOP } from '@/lib/supabase';
import KPICard from '@/components/admin/KPICard';

type Period = 'hoy' | 'semana' | 'mes' | 'año';

interface RevenuePoint { date: string; total: number; }
interface CategoryPoint { name: string; total: number; }
interface PaymentPoint { name: string; value: number; }
interface TopProduct { name: string; revenue: number; quantity: number; }

const PIE_COLORS = ['#4CB5F9', '#56C4F2', '#FF9800', '#E91E63', '#2D2D2D'];
const BAR_COLORS = ['#4CB5F9', '#56C4F2', '#FF9800', '#E91E63', '#4CAF50', '#9C27B0'];

const PERIOD_DAYS: Record<Period, number> = {
  hoy: 1, semana: 7, mes: 30, año: 365,
};

export default function ReportesPage() {
  const [period, setPeriod] = useState<Period>('mes');
  const [loading, setLoading] = useState(true);

  // KPIs
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [avgTicket, setAvgTicket] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  // Charts
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryPoint[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const days = PERIOD_DAYS[period];
      const since = new Date(Date.now() - days * 86400000).toISOString();

      // Orders in period
      const { data: orders } = await supabase
        .from('store_orders')
        .select('total, status, payment_method, created_at')
        .gte('created_at', since)
        .neq('status', 'cancelled');

      const ordersArr = orders || [];
      const total = ordersArr.reduce((s: number, o: { total: number }) => s + (o.total || 0), 0);
      const completed = ordersArr.filter((o: { status: string }) => o.status === 'delivered').length;
      setTotalRevenue(total);
      setCompletedOrders(completed);
      setAvgTicket(ordersArr.length > 0 ? total / ordersArr.length : 0);

      // Products sold
      const { data: items } = await supabase
        .from('store_order_items')
        .select('quantity, subtotal, product_name, store_orders!inner(created_at, status)')
        .gte('store_orders.created_at', since)
        .neq('store_orders.status', 'cancelled');
      const itemsArr = (items || []) as { quantity: number; subtotal: number; product_name: string }[];
      setTotalProducts(itemsArr.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));

      // Revenue over time
      const dailyMap: Record<string, number> = {};
      ordersArr.forEach((o: { created_at: string; total: number }) => {
        const d = o.created_at.slice(0, 10);
        dailyMap[d] = (dailyMap[d] || 0) + (o.total || 0);
      });
      const rData: RevenuePoint[] = [];
      for (let i = Math.min(days - 1, 29); i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const key = d.toISOString().slice(0, 10);
        rData.push({
          date: d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }),
          total: dailyMap[key] || 0,
        });
      }
      setRevenueData(rData);

      // Category sales
      const catMap: Record<string, number> = {};
      itemsArr.forEach((item) => {
        catMap[item.product_name.slice(0, 20)] = (catMap[item.product_name.slice(0, 20)] || 0) + item.subtotal;
      });
      // Get actual categories
      const { data: catOrders } = await supabase
        .from('store_order_items')
        .select('subtotal, product_id, store_orders!inner(created_at,status)')
        .gte('store_orders.created_at', since)
        .neq('store_orders.status', 'cancelled');

      const { data: cats } = await supabase.from('store_categories').select('id, name');
      const { data: prods } = await supabase.from('store_products').select('id, category_id');

      const catSales: Record<string, number> = {};
      (catOrders || []).forEach((item: { product_id: string; subtotal: number }) => {
        const prod = (prods || []).find((p: { id: string }) => p.id === item.product_id);
        if (prod) {
          const cat = (cats || []).find((c: { id: string }) => c.id === prod.category_id);
          const catName = cat?.name || 'Otros';
          catSales[catName] = (catSales[catName] || 0) + item.subtotal;
        }
      });
      setCategoryData(
        Object.entries(catSales)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 6)
      );

      // Payment methods
      const pmMap: Record<string, number> = {};
      ordersArr.forEach((o: { payment_method?: string }) => {
        const m = o.payment_method || 'Otro';
        pmMap[m] = (pmMap[m] || 0) + 1;
      });
      setPaymentData(Object.entries(pmMap).map(([name, value]) => ({ name, value })));

      // Top products by revenue
      const prodMap: Record<string, { revenue: number; quantity: number }> = {};
      itemsArr.forEach((item) => {
        if (!prodMap[item.product_name]) prodMap[item.product_name] = { revenue: 0, quantity: 0 };
        prodMap[item.product_name].revenue += item.subtotal;
        prodMap[item.product_name].quantity += item.quantity;
      });
      setTopProducts(
        Object.entries(prodMap)
          .map(([name, v]) => ({ name, ...v }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
      );

      setLoading(false);
    };
    load();
  }, [period]);

  const periods: { value: Period; label: string }[] = [
    { value: 'hoy', label: 'Hoy' },
    { value: 'semana', label: 'Esta semana' },
    { value: 'mes', label: 'Este mes' },
    { value: 'año', label: 'Este año' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Reportes y Analítica</h1>
          <p className="text-petfy-grey-text text-sm mt-1">Métricas de ventas y rendimiento</p>
        </div>
        {/* Period selector */}
        <div className="flex gap-2 bg-white rounded-2xl shadow-card p-1.5">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                period === p.value ? 'bg-primary text-white shadow-sm' : 'text-navy hover:bg-petfy-grey'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <KPICard title="Ingresos totales" value={formatCOP(totalRevenue)} icon={DollarSign} color="#4CB5F9" />
        <KPICard title="Órdenes completadas" value={String(completedOrders)} icon={ShoppingBag} color="#56C4F2" />
        <KPICard title="Ticket promedio" value={formatCOP(avgTicket)} icon={TrendingUp} color="#FF9800" />
        <KPICard title="Productos vendidos" value={String(totalProducts)} icon={Package} color="#E91E63" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card h-72 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Revenue chart */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-navy text-lg mb-5">Ingresos en el período</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CB5F9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4CB5F9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F6F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#757575' }} tickLine={false} axisLine={false} interval={Math.floor(revenueData.length / 6)} />
                <YAxis tick={{ fontSize: 11, fill: '#757575' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatCOP(v), 'Ingresos']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="total" stroke="#4CB5F9" strokeWidth={2.5} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category chart */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-navy text-lg mb-5">Ventas por categoría</h2>
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-petfy-grey-text text-sm">Sin datos en este período</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={categoryData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F6F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#757575' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#757575' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [formatCOP(v), 'Ventas']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {categoryData.map((_, idx) => (
                        <Cell key={idx} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Payment methods chart */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-navy text-lg mb-5">Métodos de pago</h2>
              {paymentData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-petfy-grey-text text-sm">Sin datos en este período</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={paymentData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {paymentData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top products */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-navy text-lg mb-5">Top 5 productos por ingresos</h2>
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-petfy-grey-text text-sm">Sin datos en este período</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F6F9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#757575' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#757575' }} tickLine={false} axisLine={false} width={120} />
                    <Tooltip formatter={(v: number) => [formatCOP(v), 'Ingresos']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                    <Bar dataKey="revenue" fill="#4CB5F9" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 pr-4 text-xs font-semibold text-petfy-grey-text uppercase">#</th>
                        <th className="text-left py-2 pr-4 text-xs font-semibold text-petfy-grey-text uppercase">Producto</th>
                        <th className="text-right py-2 pr-4 text-xs font-semibold text-petfy-grey-text uppercase">Unidades</th>
                        <th className="text-right py-2 text-xs font-semibold text-petfy-grey-text uppercase">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {topProducts.map((p, idx) => (
                        <tr key={p.name} className="hover:bg-petfy-grey/30">
                          <td className="py-3 pr-4 font-bold text-petfy-grey-text">{idx + 1}</td>
                          <td className="py-3 pr-4 font-medium text-navy">{p.name}</td>
                          <td className="py-3 pr-4 text-right text-navy">{p.quantity}</td>
                          <td className="py-3 text-right font-bold text-navy">{formatCOP(p.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
