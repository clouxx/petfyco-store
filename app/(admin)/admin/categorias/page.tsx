'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';
import toast from 'react-hot-toast';

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '', active: true });

  const loadCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from('store_categories').select('*').order('name');
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { loadCategories(); }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

  const openCreate = () => {
    setEditCat(null);
    setForm({ name: '', slug: '', description: '', image_url: '', active: true });
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditCat(c);
    setForm({ name: c.name, slug: c.slug, description: c.description || '', image_url: c.image_url || '', active: c.active });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('El nombre es requerido'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        description: form.description || null,
        image_url: form.image_url || null,
        active: form.active,
      };
      if (editCat) {
        const { error } = await supabase.from('store_categories').update(payload).eq('id', editCat.id);
        if (error) throw error;
        toast.success('Categoría actualizada');
      } else {
        const { error } = await supabase.from('store_categories').insert(payload);
        if (error) throw error;
        toast.success('Categoría creada');
      }
      setModalOpen(false);
      loadCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      toast.error(msg.includes('duplicate') ? 'El slug ya existe' : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('store_categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Categoría eliminada');
      setDeleteId(null);
      loadCategories();
    } catch {
      toast.error('Error al eliminar — verifica que no tenga productos asociados');
    }
  };

  const toggleActive = async (c: Category) => {
    await supabase.from('store_categories').update({ active: !c.active }).eq('id', c.id);
    loadCategories();
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Categorías</h1>
          <p className="text-petfy-grey-text text-sm mt-1">{categories.length} categorías en total</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nueva Categoría
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-petfy-grey-text">Cargando...</div>
        ) : categories.length === 0 ? (
          <div className="p-16 text-center text-petfy-grey-text">No hay categorías</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-petfy-grey border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Imagen</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Nombre</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Descripción</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Estado</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-petfy-grey-text uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-petfy-grey/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-petfy-grey flex-shrink-0">
                      {c.image_url ? (
                        <Image src={c.image_url} alt={c.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🏷️</div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-navy">{c.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-petfy-grey-text">{c.slug}</td>
                  <td className="px-5 py-3 text-petfy-grey-text max-w-[220px]">
                    <p className="line-clamp-2">{c.description || '—'}</p>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${c.active ? 'bg-primary' : 'bg-gray-300'}`}
                      title={c.active ? 'Desactivar' : 'Activar'}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${c.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      {deleteId === c.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                            <Check size={12} />
                          </button>
                          <button onClick={() => setDeleteId(null)} className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-navy">{editCat ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-petfy-grey rounded-xl">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Nombre *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: generateSlug(e.target.value) }))}
                  className="input-field"
                  placeholder="Ej: Nutrición"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="input-field font-mono text-sm"
                  placeholder="nutricion"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Describe brevemente esta categoría..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">URL de imagen</label>
                <input
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  className="input-field text-sm"
                  placeholder="https://..."
                />
                {form.image_url && (
                  <div className="mt-2 relative w-16 h-16 rounded-lg overflow-hidden bg-petfy-grey">
                    <Image src={form.image_url} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm font-medium text-navy">Categoría activa (visible en tienda)</span>
              </label>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1 py-3 text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3 text-sm">
                {saving ? 'Guardando...' : editCat ? 'Actualizar' : 'Crear categoría'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
