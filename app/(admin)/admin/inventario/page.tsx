'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Download, X, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, InventoryLog } from '@/lib/types';
import toast from 'react-hot-toast';

export default function InventarioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<InventoryLog[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjustForm, setAdjustForm] = useState({ type: 'in' as 'in' | 'out' | 'adjustment', quantity: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('store_products')
      .select('*, category:store_categories(name)')
      .eq('active', true)
      .order('stock', { ascending: true });

    if (search) query = query.ilike('name', `%${search}%`);
    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  }, [search]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const openHistory = async (p: Product) => {
    setSelectedProduct(p);
    const { data } = await supabase
      .from('store_inventory_logs')
      .select('*')
      .eq('product_id', p.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setHistory(data || []);
    setHistoryOpen(true);
  };

  const openAdjust = (p: Product) => {
    setAdjustProduct(p);
    setAdjustForm({ type: 'in', quantity: '', notes: '' });
    setAdjustOpen(true);
  };

  const handleAdjust = async () => {
    if (!adjustProduct || !adjustForm.quantity) {
      toast.error('Ingresa la cantidad');
      return;
    }
    const qty = parseInt(adjustForm.quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Cantidad inválida');
      return;
    }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Calculate new stock
      let newStock = adjustProduct.stock;
      if (adjustForm.type === 'in') newStock += qty;
      else if (adjustForm.type === 'out') newStock = Math.max(0, newStock - qty);
      else newStock = qty;

      // Update product stock
      const { error: stockError } = await supabase
        .from('store_products')
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', adjustProduct.id);
      if (stockError) throw stockError;

      // Log movement
      const { error: logError } = await supabase.from('store_inventory_logs').insert({
        product_id: adjustProduct.id,
        type: adjustForm.type,
        quantity: qty,
        notes: adjustForm.notes || null,
        created_by: session?.user?.id || null,
      });
      if (logError) throw logError;

      toast.success('Stock actualizado');
      setAdjustOpen(false);
      loadProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al ajustar';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    const headers = ['SKU', 'Nombre', 'Categoría', 'Stock', 'Estado'];
    const rows = products.map((p) => [
      p.sku || '', p.name, (p as Product & { category?: { name: string } }).category?.name || '', p.stock, p.active ? 'Activo' : 'Inactivo'
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stockClass = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-700';
    if (stock < 5) return 'bg-red-50 text-red-600';
    if (stock < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-700';
  };

  const lowStock = products.filter((p) => p.stock < 5);

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Inventario</h1>
          <p className="text-petfy-grey-text text-sm mt-1">Gestión de stock y movimientos</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-navy hover:bg-petfy-grey transition-colors">
          <Download size={15} />
          Exportar CSV
        </button>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm mb-1">
              {lowStock.length} producto{lowStock.length > 1 ? 's' : ''} con stock crítico
            </p>
            <p className="text-red-600 text-xs">
              {lowStock.map((p) => `${p.name} (${p.stock})`).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-card p-5 mb-6">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-petfy-grey-text" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-petfy-grey border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Producto</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">SKU</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Categoría</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Stock actual</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-petfy-grey-text">No se encontraron productos</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className={`hover:bg-petfy-grey/30 transition-colors ${p.stock < 5 ? 'bg-red-50/30' : ''}`}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-navy">{p.name}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-petfy-grey-text">{p.sku || '—'}</td>
                    <td className="px-5 py-4 text-navy">
                      {(p as Product & { category?: { name: string } }).category?.name || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${stockClass(p.stock)}`}>{p.stock} unidades</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openHistory(p)}
                          className="text-xs font-medium text-blue-500 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
                        >
                          Historial
                        </button>
                        <button
                          onClick={() => openAdjust(p)}
                          className="text-xs font-medium text-primary hover:text-accent border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/10 transition-colors flex items-center gap-1"
                        >
                          <Plus size={12} />
                          Ajustar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      {historyOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setHistoryOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-navy">Historial de movimientos</h2>
                <p className="text-sm text-petfy-grey-text">{selectedProduct.name}</p>
              </div>
              <button onClick={() => setHistoryOpen(false)} className="p-2 hover:bg-petfy-grey rounded-xl">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              {history.length === 0 ? (
                <p className="text-center text-petfy-grey-text py-8">Sin movimientos registrados</p>
              ) : (
                <div className="space-y-3">
                  {history.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-petfy-grey">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${
                        log.type === 'in' ? 'bg-green-100 text-green-700' :
                        log.type === 'out' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {log.type === 'in' ? '↑' : log.type === 'out' ? '↓' : '~'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-navy capitalize">
                          {log.type === 'in' ? 'Entrada' : log.type === 'out' ? 'Salida' : 'Ajuste'} — {log.quantity} uds
                        </p>
                        {log.notes && <p className="text-xs text-petfy-grey-text">{log.notes}</p>}
                        <p className="text-xs text-petfy-grey-text mt-0.5">
                          {new Date(log.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {adjustOpen && adjustProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAdjustOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-navy">Ajustar Stock</h2>
                <p className="text-sm text-petfy-grey-text">{adjustProduct.name} — Stock actual: {adjustProduct.stock}</p>
              </div>
              <button onClick={() => setAdjustOpen(false)} className="p-2 hover:bg-petfy-grey rounded-xl">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Tipo de movimiento</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'in', label: 'Entrada', color: 'border-green-400 bg-green-50 text-green-700' },
                    { value: 'out', label: 'Salida', color: 'border-red-400 bg-red-50 text-red-700' },
                    { value: 'adjustment', label: 'Ajuste', color: 'border-blue-400 bg-blue-50 text-blue-700' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAdjustForm((f) => ({ ...f, type: opt.value as 'in' | 'out' | 'adjustment' }))}
                      className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                        adjustForm.type === opt.value ? opt.color : 'border-gray-200 text-navy hover:bg-petfy-grey'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">
                  {adjustForm.type === 'adjustment' ? 'Nuevo stock total' : 'Cantidad'}
                </label>
                <input
                  type="number"
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm((f) => ({ ...f, quantity: e.target.value }))}
                  min="1"
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Notas (opcional)</label>
                <textarea
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Motivo del ajuste..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setAdjustOpen(false)} className="btn-secondary flex-1 text-sm py-3">Cancelar</button>
                <button onClick={handleAdjust} disabled={saving} className="btn-primary flex-1 text-sm py-3">
                  {saving ? 'Guardando...' : 'Guardar ajuste'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
