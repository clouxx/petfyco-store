'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';
import toast from 'react-hot-toast';

function NuevoProductoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', compare_price: '',
    category_id: '', stock: '0', sku: '', weight_g: '',
    images: [''], tags: '', featured: false, active: true,
  });

  useEffect(() => {
    supabase.from('store_categories').select('*').eq('active', true).then(({ data }) => setCategories(data || []));

    if (editId) {
      supabase.from('store_products').select('*').eq('id', editId).single().then(({ data }) => {
        if (data) {
          setForm({
            name: data.name, slug: data.slug, description: data.description || '',
            price: String(data.price), compare_price: String(data.compare_price || ''),
            category_id: data.category_id || '', stock: String(data.stock), sku: data.sku || '',
            weight_g: String(data.weight_g || ''),
            images: data.images?.length > 0 ? data.images : [''],
            tags: (data.tags || []).join(', '),
            featured: data.featured, active: data.active,
          });
        }
      });
    }
  }, [editId]);

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

  const setField = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error('Nombre y precio son requeridos');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        description: form.description || null,
        price: parseFloat(form.price),
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        category_id: form.category_id || null,
        stock: parseInt(form.stock) || 0,
        sku: form.sku || null,
        weight_g: form.weight_g ? parseInt(form.weight_g) : null,
        images: form.images.filter(Boolean),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        featured: form.featured,
        active: form.active,
        updated_at: new Date().toISOString(),
      };

      if (editId) {
        const res = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, ...payload }),
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
        toast.success('Producto actualizado exitosamente');
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
        toast.success('Producto creado exitosamente');
      }
      router.push('/admin/catalogo');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      toast.error(message.includes('duplicate') ? 'El slug ya existe. Cambia el nombre o el slug.' : message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/admin/catalogo')} className="p-2 rounded-xl hover:bg-white border border-gray-200 text-navy">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-navy">{editId ? 'Editar Producto' : 'Nuevo Producto'}</h1>
          <p className="text-petfy-grey-text text-sm">Completa todos los campos del producto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-bold text-navy mb-5">Información básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-navy mb-1.5">Nombre del producto *</label>
              <input
                value={form.name}
                onChange={(e) => {
                  setField('name', e.target.value);
                  setField('slug', generateSlug(e.target.value));
                }}
                required
                className="input-field"
                placeholder="Ej: Croquetas Premium Adultos 3kg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Slug (URL)</label>
              <input
                value={form.slug}
                onChange={(e) => setField('slug', e.target.value)}
                className="input-field font-mono text-sm"
                placeholder="croquetas-premium-adultos-3kg"
              />
              <p className="text-xs text-petfy-grey-text mt-1">Generado automáticamente del nombre</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">SKU</label>
              <input
                value={form.sku}
                onChange={(e) => setField('sku', e.target.value)}
                className="input-field"
                placeholder="PFC-NUT-001"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-navy mb-1.5">Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                rows={4}
                className="input-field resize-none"
                placeholder="Describe el producto en detalle..."
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-bold text-navy mb-5">Precio e inventario</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Precio (COP) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setField('price', e.target.value)}
                required
                min="0"
                className="input-field"
                placeholder="29900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Precio tachado</label>
              <input
                type="number"
                value={form.compare_price}
                onChange={(e) => setField('compare_price', e.target.value)}
                min="0"
                className="input-field"
                placeholder="39900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setField('stock', e.target.value)}
                min="0"
                className="input-field"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Peso (gramos)</label>
              <input
                type="number"
                value={form.weight_g}
                onChange={(e) => setField('weight_g', e.target.value)}
                min="0"
                className="input-field"
                placeholder="3000"
              />
            </div>
          </div>
        </div>

        {/* Category & Tags */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-bold text-navy mb-5">Organización</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Categoría</label>
              <select
                value={form.category_id}
                onChange={(e) => setField('category_id', e.target.value)}
                className="input-field"
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Tags (separados por comas)</label>
              <input
                value={form.tags}
                onChange={(e) => setField('tags', e.target.value)}
                className="input-field"
                placeholder="perros, adultos, premium"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-bold text-navy mb-5">Imágenes</h2>
          <div className="space-y-3">
            {form.images.map((img, idx) => (
              <div key={idx} className="flex gap-3">
                <input
                  value={img}
                  onChange={(e) => {
                    const imgs = [...form.images];
                    imgs[idx] = e.target.value;
                    setField('images', imgs);
                  }}
                  className="input-field flex-1 text-sm"
                  placeholder={`https://... (Imagen ${idx + 1})`}
                />
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setField('images', form.images.filter((_, i) => i !== idx))}
                    className="p-3 border border-gray-200 rounded-xl hover:bg-red-50 text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setField('images', [...form.images, ''])}
              className="flex items-center gap-2 text-primary font-semibold text-sm hover:text-accent transition-colors"
            >
              <Plus size={16} />
              Agregar otra imagen
            </button>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-bold text-navy mb-5">Configuración</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setField('featured', !form.featured)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.featured ? 'bg-primary' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm font-medium text-navy">Producto destacado</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setField('active', !form.active)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.active ? 'bg-primary' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm font-medium text-navy">Producto activo (visible en tienda)</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="button" onClick={() => router.push('/admin/catalogo')} className="btn-secondary flex-1 py-4">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-4 text-base">
            {saving ? 'Guardando...' : editId ? 'Actualizar producto' : 'Crear producto'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NuevoProductoPage() {
  return (
    <Suspense>
      <NuevoProductoForm />
    </Suspense>
  );
}
