'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Plus, Edit2, Trash2, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, formatCOP } from '@/lib/supabase';
import type { Product, Category } from '@/lib/types';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', price: '', compare_price: '',
    category_id: '', stock: '', sku: '', images: [''], featured: false, active: true,
  });

  useEffect(() => {
    supabase.from('store_categories').select('*').eq('active', true).then(({ data }) => setCategories(data || []));
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('store_products')
      .select('*, category:store_categories(*)', { count: 'exact' });

    if (search) query = query.ilike('name', `%${search}%`);
    if (catFilter) query = query.eq('category_id', catFilter);
    if (statusFilter === 'active') query = query.eq('active', true);
    if (statusFilter === 'inactive') query = query.eq('active', false);

    query = query.order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    const { data, count } = await query;
    setProducts(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [search, catFilter, statusFilter, page]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const openCreateModal = () => {
    setEditProduct(null);
    setFormData({ name: '', slug: '', description: '', price: '', compare_price: '', category_id: '', stock: '0', sku: '', images: [''], featured: false, active: true });
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditProduct(p);
    setFormData({
      name: p.name, slug: p.slug, description: p.description || '',
      price: String(p.price), compare_price: String(p.compare_price || ''),
      category_id: p.category_id || '', stock: String(p.stock), sku: p.sku || '',
      images: p.images?.length > 0 ? p.images : [''],
      featured: p.featured, active: p.active,
    });
    setModalOpen(true);
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Nombre y precio son requeridos');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || null,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        category_id: formData.category_id || null,
        stock: parseInt(formData.stock) || 0,
        sku: formData.sku || null,
        images: formData.images.filter(Boolean),
        featured: formData.featured,
        active: formData.active,
        updated_at: new Date().toISOString(),
      };

      if (editProduct?.id) {
        const { error } = await supabase.from('store_products').update(payload).eq('id', editProduct.id);
        if (error) throw error;
        toast.success('Producto actualizado');
      } else {
        const { error } = await supabase.from('store_products').insert({ ...payload, created_at: new Date().toISOString() });
        if (error) throw error;
        toast.success('Producto creado');
      }
      setModalOpen(false);
      loadProducts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      toast.error(message.includes('duplicate') ? 'El slug ya existe, elige otro nombre' : message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('store_products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Producto eliminado');
      setDeleteId(null);
      loadProducts();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const toggleActive = async (p: Product) => {
    await supabase.from('store_products').update({ active: !p.active }).eq('id', p.id);
    loadProducts();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const stockBadge = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-700';
    if (stock < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="p-6 lg:p-8 max-w-screen-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Catálogo de Productos</h1>
          <p className="text-petfy-grey-text text-sm mt-1">{total} productos en total</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-5 mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-petfy-grey-text" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre o SKU..."
            className="input-field pl-10 text-sm py-2.5"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-petfy-grey border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Imagen</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Precio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-5 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-petfy-grey-text">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-petfy-grey/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-petfy-grey flex-shrink-0">
                        {p.images?.[0] ? (
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-petfy-grey-text font-mono text-xs">{p.sku || '—'}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy line-clamp-1 max-w-[180px]">{p.name}</p>
                      {p.featured && <span className="badge bg-petfy-orange/10 text-petfy-orange text-xs mt-0.5">Destacado</span>}
                    </td>
                    <td className="px-4 py-3 text-navy">{(p as Product & { category?: Category }).category?.name || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-navy">{formatCOP(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${stockBadge(p.stock)}`}>{p.stock} uds</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.active ? 'bg-primary' : 'bg-gray-300'}`}
                        title={p.active ? 'Desactivar' : 'Activar'}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${p.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        {deleteId === p.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                              <Check size={12} />
                            </button>
                            <button onClick={() => setDeleteId(null)} className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors">
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-petfy-grey-text">
              Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} de {total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-petfy-grey">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-petfy-grey">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-navy">{editProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-petfy-grey rounded-xl">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-navy mb-1.5">Nombre *</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value, slug: generateSlug(e.target.value) }))}
                    className="input-field"
                    placeholder="Nombre del producto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Slug</label>
                  <input
                    value={formData.slug}
                    onChange={(e) => setFormData((f) => ({ ...f, slug: e.target.value }))}
                    className="input-field text-sm font-mono"
                    placeholder="slug-del-producto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">SKU</label>
                  <input
                    value={formData.sku}
                    onChange={(e) => setFormData((f) => ({ ...f, sku: e.target.value }))}
                    className="input-field"
                    placeholder="PFC-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Precio (COP) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData((f) => ({ ...f, price: e.target.value }))}
                    className="input-field"
                    placeholder="29900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Precio tachado</label>
                  <input
                    type="number"
                    value={formData.compare_price}
                    onChange={(e) => setFormData((f) => ({ ...f, compare_price: e.target.value }))}
                    className="input-field"
                    placeholder="39900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Categoría</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData((f) => ({ ...f, category_id: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData((f) => ({ ...f, stock: e.target.value }))}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-navy mb-1.5">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Descripción del producto..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-navy mb-2">URLs de imágenes</label>
                  <div className="space-y-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          value={img}
                          onChange={(e) => {
                            const imgs = [...formData.images];
                            imgs[idx] = e.target.value;
                            setFormData((f) => ({ ...f, images: imgs }));
                          }}
                          className="input-field text-sm"
                          placeholder="https://..."
                        />
                        {formData.images.length > 1 && (
                          <button
                            onClick={() => setFormData((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))}
                            className="p-2.5 border border-gray-200 rounded-xl hover:bg-red-50 text-red-400"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData((f) => ({ ...f, images: [...f.images, ''] }))}
                      className="text-primary text-sm font-medium hover:text-accent flex items-center gap-1"
                    >
                      <Plus size={14} /> Agregar imagen
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData((f) => ({ ...f, featured: e.target.checked }))}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    <span className="text-sm font-medium text-navy">Destacado</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData((f) => ({ ...f, active: e.target.checked }))}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    <span className="text-sm font-medium text-navy">Activo</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1 text-sm py-3">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm py-3">
                {saving ? 'Guardando...' : editProduct ? 'Actualizar' : 'Crear producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Also provide link to full form */}
      <div className="mt-4 text-center">
        <Link href="/admin/catalogo/nuevo" className="text-primary text-sm font-medium hover:text-accent">
          Abrir formulario completo de producto →
        </Link>
      </div>
    </div>
  );
}
