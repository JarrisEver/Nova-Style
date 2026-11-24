import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryItem } from '../../types';
import { PRODUCT_MEDIA_BY_CATEGORY } from '../../assets/media';
import { TiltCard3D } from '../ui/TiltCard3D';
import { ModalShell, ModuleHeader, SafeImage } from '../ui/MotionPrimitives';
import { Plus, Edit2, Power, X, FolderTree } from 'lucide-react';

export const CategoriesView: React.FC = () => {
  const { categories, products, saveCategory, toggleCategoryStatus } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(PRODUCT_MEDIA_BY_CATEGORY['Ropa Hombre']);
  const [status, setStatus] = useState<'ACTIVA' | 'INACTIVA'>('ACTIVA');

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setImage(PRODUCT_MEDIA_BY_CATEGORY['Ropa Hombre']);
    setStatus('ACTIVA');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description);
    setImage(cat.image);
    setStatus(cat.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = saveCategory({
      id: editingId || undefined,
      name,
      description,
      image,
      status,
    });
    if (res.success) {
      setIsModalOpen(false);
    }
  };

  const imagePresets = Object.entries(PRODUCT_MEDIA_BY_CATEGORY);

  return (
    <div className="space-y-6">
      <ModuleHeader
        kicker="Estructura Comercial · Departamentos"
        title="Gestión de Categorías"
        subtitle="Administra los departamentos visibles tanto en el catálogo POS como en la Tienda Online."
        actions={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Categoría</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.category === cat.name);
          const totalUnits = catProducts.reduce(
            (acc, p) => acc + p.variants.reduce((sum, v) => sum + v.stock, 0),
            0
          );

          return (
            <TiltCard3D
              key={cat.id}
              elevation="subtle"
              maxTilt={4}
              className="bg-white rounded-xl border border-zinc-200 overflow-hidden flex flex-col"
            >
              <div className="relative h-40 bg-zinc-900 overflow-hidden">
                <SafeImage
                  src={cat.image}
                  alt={cat.name}
                  fallbackTitle={cat.name}
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      cat.status === 'ACTIVA'
                        ? 'bg-emerald-500/90 text-white border-emerald-400'
                        : 'bg-zinc-800/90 text-zinc-300 border-zinc-600'
                    }`}
                  >
                    {cat.status}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="text-[10px] font-mono text-zinc-300">/{cat.slug}</div>
                  <h3 className="text-base font-bold mt-0.5">{cat.name}</h3>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 font-mono text-zinc-700 tabular-nums">
                    <span>
                      <strong>{catProducts.length}</strong> productos
                    </span>
                    <span className="text-zinc-300">|</span>
                    <span>
                      <strong>{totalUnits}</strong> u. stock
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition"
                      title="Editar categoría"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleCategoryStatus(cat.id)}
                      className={`p-1.5 rounded-md transition ${
                        cat.status === 'ACTIVA'
                          ? 'text-zinc-500 hover:text-red-600 hover:bg-red-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={cat.status === 'ACTIVA' ? 'Desactivar' : 'Activar'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </TiltCard3D>
          );
        })}
      </div>

      <ModalShell
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidthClass="max-w-lg"
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold">
              {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              Nombre del Departamento *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Ropa Urbana"
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Descripción</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción editorial para la tienda..."
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Imagen Editorial</label>
              <select
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
              >
                {imagePresets.map(([label, url]) => (
                  <option key={label} value={url}>
                    Estilo {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVA' | 'INACTIVA')}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-semibold"
              >
                <option value="ACTIVA">ACTIVA (Visible en Tienda)</option>
                <option value="INACTIVA">INACTIVA (Oculta)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-zinc-100 text-zinc-700 font-semibold rounded-lg hover:bg-zinc-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
            >
              Guardar Categoría
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
};
