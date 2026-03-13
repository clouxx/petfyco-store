'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, Printer, FileText } from 'lucide-react';
import { supabase, formatCOP } from '@/lib/supabase';
import type { Invoice, Order } from '@/lib/types';
import toast from 'react-hot-toast';

export default function FacturacionPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [ivaRate, setIvaRate] = useState(0);
  const [saving, setSaving] = useState(false);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('store_invoices')
      .select('*, order:store_orders(*)')
      .order('created_at', { ascending: false });

    if (search) query = query.or(`invoice_number.ilike.%${search}%,buyer_name.ilike.%${search}%`);
    const { data } = await query;
    setInvoices(data || []);
    setLoading(false);
  }, [search]);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  const searchOrder = async () => {
    if (!orderSearch) return;
    const { data } = await supabase
      .from('store_orders')
      .select('*, items:store_order_items(*)')
      .ilike('order_number', `%${orderSearch}%`)
      .limit(1)
      .single();
    if (data) {
      setFoundOrder(data);
    } else {
      toast.error('Pedido no encontrado');
      setFoundOrder(null);
    }
  };

  const createInvoice = async () => {
    if (!foundOrder) return;
    setSaving(true);
    try {
      const subtotal = foundOrder.subtotal;
      const taxIva = Math.round(subtotal * ivaRate);
      const total = subtotal + taxIva + foundOrder.shipping;
      const invoiceNumber = 'FAC-' + Date.now().toString().slice(-8);

      const { error } = await supabase.from('store_invoices').insert({
        invoice_number: invoiceNumber,
        order_id: foundOrder.id,
        seller_nit: '901234567-8',
        seller_name: 'PetfyCo S.A.S.',
        seller_address: 'Bogotá, Colombia',
        buyer_name: foundOrder.billing_name,
        buyer_id_type: foundOrder.billing_id_type,
        buyer_id: foundOrder.billing_id,
        buyer_email: foundOrder.billing_email,
        buyer_address: foundOrder.billing_address,
        buyer_city: foundOrder.billing_city,
        subtotal,
        tax_iva: taxIva,
        total,
        status: 'issued',
        issued_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success(`Factura ${invoiceNumber} emitida`);
      setModalOpen(false);
      setFoundOrder(null);
      setOrderSearch('');
      loadInvoices();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear factura';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const cancelInvoice = async (id: string) => {
    await supabase.from('store_invoices').update({ status: 'cancelled' }).eq('id', id);
    toast.success('Factura cancelada');
    loadInvoices();
  };

  const statusColor = (s: string) => {
    if (s === 'issued') return 'bg-green-100 text-green-700';
    if (s === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
  };
  const statusLabel = (s: string) => ({ issued: 'Emitida', cancelled: 'Cancelada', draft: 'Borrador' }[s] || s);

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Facturación</h1>
          <p className="text-petfy-grey-text text-sm mt-1">Gestión de facturas electrónicas</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nueva Factura
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-card p-5 mb-6">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-petfy-grey-text" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar factura o comprador..."
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider"># Factura</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Comprador</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Subtotal</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">IVA</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Total</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Estado</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Fecha</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : invoices.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-petfy-grey-text">No hay facturas</td></tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-petfy-grey/30 transition-colors">
                    <td className="px-5 py-4 font-bold text-navy">{inv.invoice_number}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-navy">{inv.buyer_name}</p>
                      <p className="text-xs text-petfy-grey-text">{inv.buyer_id_type}: {inv.buyer_id}</p>
                    </td>
                    <td className="px-5 py-4 text-navy">{formatCOP(inv.subtotal)}</td>
                    <td className="px-5 py-4 text-navy">{formatCOP(inv.tax_iva)}</td>
                    <td className="px-5 py-4 font-bold text-navy">{formatCOP(inv.total)}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${statusColor(inv.status)}`}>{statusLabel(inv.status)}</span>
                    </td>
                    <td className="px-5 py-4 text-petfy-grey-text text-xs">
                      {new Date(inv.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewInvoice(inv)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                          title="Ver factura"
                        >
                          <FileText size={14} />
                        </button>
                        {inv.status === 'issued' && (
                          <button
                            onClick={() => cancelInvoice(inv.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors text-xs font-medium"
                            title="Cancelar"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Invoice Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-navy">Nueva Factura</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-petfy-grey rounded-xl"><X size={20} /></button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Buscar pedido</label>
                <div className="flex gap-2">
                  <input
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchOrder()}
                    placeholder="Número de pedido (ej: PFC-12345678)"
                    className="input-field flex-1 text-sm"
                  />
                  <button onClick={searchOrder} className="btn-primary px-4 text-sm py-2.5">Buscar</button>
                </div>
              </div>

              {foundOrder && (
                <div className="bg-petfy-grey rounded-2xl p-5 space-y-3">
                  <p className="font-bold text-navy">{foundOrder.order_number}</p>
                  <p className="text-sm text-navy">{foundOrder.billing_name} — {foundOrder.billing_id_type}: {foundOrder.billing_id}</p>
                  <p className="text-sm text-petfy-grey-text">{foundOrder.billing_email}</p>
                  <p className="text-sm text-petfy-grey-text">{foundOrder.billing_address}, {foundOrder.billing_city}</p>
                  <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
                    <span className="text-petfy-grey-text">Subtotal del pedido</span>
                    <span className="font-bold text-navy">{formatCOP(foundOrder.subtotal)}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">IVA</label>
                    <div className="flex gap-2">
                      {[0, 5, 19].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setIvaRate(rate / 100)}
                          className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                            ivaRate === rate / 100 ? 'border-primary bg-primary text-white' : 'border-gray-200 text-navy hover:bg-petfy-grey'
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 text-sm border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-petfy-grey-text">Subtotal</span>
                      <span>{formatCOP(foundOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-petfy-grey-text">IVA ({(ivaRate * 100).toFixed(0)}%)</span>
                      <span>{formatCOP(Math.round(foundOrder.subtotal * ivaRate))}</span>
                    </div>
                    <div className="flex justify-between font-bold text-navy pt-1 border-t border-gray-200">
                      <span>Total factura</span>
                      <span className="text-primary">{formatCOP(Math.round(foundOrder.subtotal * (1 + ivaRate)) + foundOrder.shipping)}</span>
                    </div>
                  </div>

                  <button onClick={createInvoice} disabled={saving} className="btn-primary w-full py-3.5">
                    {saving ? 'Emitiendo...' : 'Emitir Factura'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invoice View Modal (printable) */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 no-print" onClick={() => setViewInvoice(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" id="invoice-print">
            {/* Print header */}
            <div className="no-print flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-navy">Vista previa de factura</h2>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-navy/80">
                  <Printer size={16} />
                  Imprimir
                </button>
                <button onClick={() => setViewInvoice(null)} className="p-2 hover:bg-petfy-grey rounded-xl">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Invoice content */}
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">🐾</span>
                    <span className="text-2xl font-extrabold text-primary">PetfyCo</span>
                  </div>
                  <p className="text-sm text-petfy-grey-text">{viewInvoice.seller_name}</p>
                  <p className="text-sm text-petfy-grey-text">NIT: {viewInvoice.seller_nit}</p>
                  <p className="text-sm text-petfy-grey-text">{viewInvoice.seller_address}</p>
                </div>
                <div className="text-right">
                  <h1 className="text-2xl font-extrabold text-navy">FACTURA</h1>
                  <p className="text-lg font-bold text-primary">{viewInvoice.invoice_number}</p>
                  <p className="text-sm text-petfy-grey-text">
                    {viewInvoice.issued_at
                      ? new Date(viewInvoice.issued_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
                      : '—'}
                  </p>
                  <span className={`badge mt-1 ${viewInvoice.status === 'issued' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {viewInvoice.status === 'issued' ? 'Emitida' : viewInvoice.status}
                  </span>
                </div>
              </div>

              {/* CUFE placeholder */}
              <div className="bg-petfy-grey rounded-xl p-3 mb-6 text-xs text-petfy-grey-text font-mono">
                CUFE: [Pendiente de integración DIAN] — {viewInvoice.invoice_number}
              </div>

              {/* Buyer info */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-petfy-grey rounded-xl p-4">
                  <h3 className="font-bold text-navy text-sm mb-3 uppercase tracking-wide">Datos del comprador</h3>
                  <div className="space-y-1.5 text-sm">
                    <p className="font-semibold text-navy">{viewInvoice.buyer_name}</p>
                    <p className="text-petfy-grey-text">{viewInvoice.buyer_id_type}: {viewInvoice.buyer_id}</p>
                    <p className="text-petfy-grey-text">{viewInvoice.buyer_email}</p>
                    <p className="text-petfy-grey-text">{viewInvoice.buyer_address}</p>
                    <p className="text-petfy-grey-text">{viewInvoice.buyer_city}</p>
                  </div>
                </div>
                {viewInvoice.order && (
                  <div className="bg-petfy-grey rounded-xl p-4">
                    <h3 className="font-bold text-navy text-sm mb-3 uppercase tracking-wide">Pedido referencia</h3>
                    <div className="space-y-1.5 text-sm">
                      <p className="font-semibold text-navy">{viewInvoice.order.order_number}</p>
                      <p className="text-petfy-grey-text capitalize">Estado: {viewInvoice.order.status}</p>
                      <p className="text-petfy-grey-text">Pago: {viewInvoice.order.payment_method || '—'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Items table */}
              {viewInvoice.order?.items && viewInvoice.order.items.length > 0 && (
                <div className="mb-6">
                  <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                    <thead className="bg-petfy-grey">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-navy">Producto</th>
                        <th className="text-right px-4 py-3 font-semibold text-navy">Cant.</th>
                        <th className="text-right px-4 py-3 font-semibold text-navy">P. Unitario</th>
                        <th className="text-right px-4 py-3 font-semibold text-navy">IVA</th>
                        <th className="text-right px-4 py-3 font-semibold text-navy">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {viewInvoice.order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">{item.product_name}</td>
                          <td className="px-4 py-3 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">{formatCOP(item.unit_price)}</td>
                          <td className="px-4 py-3 text-right">{viewInvoice.tax_iva > 0 ? '19%' : '0%'}</td>
                          <td className="px-4 py-3 text-right font-semibold">{formatCOP(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-petfy-grey-text">Subtotal</span>
                    <span className="font-medium">{formatCOP(viewInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-petfy-grey-text">IVA (19%)</span>
                    <span className="font-medium">{formatCOP(viewInvoice.tax_iva)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-navy text-base pt-2 border-t border-gray-200">
                    <span>TOTAL</span>
                    <span className="text-primary">{formatCOP(viewInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-5 text-center text-xs text-petfy-grey-text">
                <p>Esta factura fue generada electrónicamente por PetfyCo S.A.S.</p>
                <p>NIT 901234567-8 | Bogotá, Colombia | contacto@petfyco.com</p>
                <p className="mt-1">Resolución DIAN No. [Pendiente] | Rango de autorización: [Pendiente]</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
