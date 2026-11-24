import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductVariant } from '../../types';
import { PRODUCT_MEDIA_BY_CATEGORY } from '../../assets/media';
import { TiltCard3D } from '../ui/TiltCard3D';
import { ModalShell, ModuleHeader, SafeImage } from '../ui/MotionPrimitives';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Layers,
  LayoutGrid,
  List,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { products, categories: categoryItems, saveProduct, deleteProduct, storeSettings, addToast } = useApp();

  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [selectedBrand, setSelectedBrand] = useState('TODAS');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const defaultImg = PRODUCT_MEDIA_BY_CATEGORY['Ropa Hombre'];

  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    brand: string;
    category: string;
    subcategory: string;
    description: string;
    price: number;
    cost: number;
    status: 'ACTIVO' | 'INACTIVO';
    image: string;
    variants: ProductVariant[];
  }>({
    code: '',
    name: '',
    brand: '',
    category: 'Ropa Hombre',
    subcategory: '',
    description: '',
    price: 0,
    cost: 0,
    status: 'ACTIVO',
    image: defaultImg,
    variants: [],
  });

  const categories = useMemo(() => {
    const fromState = categoryItems.map((c) => c.name);
    const fromProducts = products.map((p) => p.category);
    return ['TODAS', ...Array.from(new Set([...fromState, ...fromProducts]))];
  }, [categoryItems, products]);

  const formCategoryOptions = useMemo(() => {
    return Array.from(new Set([...categoryItems.map((c) => c.name), formData.category].filter(Boolean)));
  }, [categoryItems, formData.category]);

  const brands = useMemo(() => {
    return ['TODAS', ...Array.from(new Set(products.map((p) => p.brand)))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCat = selectedCategory === 'TODAS' || p.category === selectedCategory;
      const matchBrand = selectedBrand === 'TODAS' || p.brand === selectedBrand;
      const matchStatus = selectedStatus === 'TODOS' || p.status === selectedStatus;
      const matchPrice = !maxPrice || p.price <= parseFloat(maxPrice);

      return matchSearch && matchCat && matchBrand && matchStatus && matchPrice;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand, selectedStatus, maxPrice]);

  const handleOpenCreateModal = () => {
    const nextCode = `PRD-${(products.length + 1001).toString()}`;
    setEditingProductId(null);
    setFormData({
      code: nextCode,
      name: '',
      brand: 'NOVAStyle Collection',
      category: 'Ropa Hombre',
      subcategory: 'Prendas',
      description: '',
      price: 129.0,
      cost: 65.0,
      status: 'ACTIVO',
      image: PRODUCT_MEDIA_BY_CATEGORY['Ropa Hombre'],
      variants: [
        {
          id: 'v-new-1',
          sku: `${nextCode}-S`,
          size: 'S',
          color: 'Negro',
          model: 'Estándar',
          stock: 10,
          minStock: 3,
          location: 'Pasillo A-01',
        },
        {
          id: 'v-new-2',
          sku: `${nextCode}-M`,
          size: 'M',
          color: 'Negro',
          model: 'Estándar',
          stock: 15,
          minStock: 4,
          location: 'Pasillo A-01',
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setFormData({
      code: product.code,
      name: product.name,
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      price: product.price,
      cost: product.cost,
      status: product.status,
      image: product.image,
      variants: [...product.variants],
    });
    setIsModalOpen(true);
  };

  const handleAddVariantRow = () => {
    const newIdx = formData.variants.length + 1;
    const newSku = `${formData.code || 'SKU'}-VAR-${newIdx}`;
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: 'v-row-' + Date.now(),
          sku: newSku,
          size: 'M',
          color: 'Negro',
          model: 'Clásico',
          stock: 5,
          minStock: 2,
          location: 'Almacén Central',
        },
      ],
    }));
  };

  const handleUpdateVariantField = (
    index: number,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    setFormData((prev) => {
      const nextVars = [...prev.variants];
      nextVars[index] = {
        ...nextVars[index],
        [field]: value,
      };
      return { ...prev, variants: nextVars };
    });
  };

  const handleRemoveVariantRow = (index: number) => {
    if (formData.variants.length <= 1) {
      addToast('warning', 'Al menos una variante', 'Un producto debe tener al menos una variante registrada.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      addToast('error', 'Campos incompletos', 'El código y nombre de producto son obligatorios.');
      return;
    }

    if (formData.variants.length === 0) {
      addToast('error', 'Sin variantes', 'Debe agregar al menos una variante para el producto.');
      return;
    }

    const res = saveProduct({
      id: editingProductId || undefined,
      code: formData.code,
      name: formData.name,
      brand: formData.brand,
      category: formData.category,
      subcategory: formData.subcategory,
      description: formData.description,
      price: Number(formData.price),
      cost: Number(formData.cost),
      status: formData.status,
      image: formData.image || PRODUCT_MEDIA_BY_CATEGORY[formData.category] || defaultImg,
      variants: formData.variants,
    });

    if (res.success) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        kicker="Catálogo & Variantes · CU-01"
        title="Catálogo de Productos"
        subtitle="Gestión de prendas, especificaciones, estructura de costos y variantes con SKU único."
        actions={
          <>
            <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-0.5">
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'TABLE' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-900'
                }`}
                title="Vista Tabla"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'GRID' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-900'
                }`}
                title="Vista Catálogo 3D"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          </>
        }
      />

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, nombre, marca o SKU..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/15 focus:border-red-600"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none text-zinc-800"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'TODAS' ? 'Todas las Categorías' : c}
            </option>
          ))}
        </select>

        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none text-zinc-800"
        >
          {brands.map((b) => (
            <option key={b} value={b}>
              {b === 'TODAS' ? 'Todas las Marcas' : b}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none text-zinc-800"
        >
          <option value="TODOS">Todos los Estados</option>
          <option value="ACTIVO">Activos</option>
          <option value="INACTIVO">Inactivos</option>
        </select>

        <div className="w-32">
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Precio Máx."
            className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none text-zinc-800 font-mono"
          />
        </div>
      </div>

      {/* GRID VIEW (3D Editorial Cards) */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
            return (
              <TiltCard3D
                key={p.id}
                elevation="subtle"
                maxTilt={4}
                className="bg-white rounded-xl border border-zinc-200 overflow-hidden flex flex-col group"
              >
                <div className="relative h-48 bg-zinc-100 overflow-hidden">
                  <SafeImage
                    src={p.image}
                    alt={p.name}
                    fallbackTitle={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-zinc-950/90 text-white text-xs font-mono font-bold px-2.5 py-1 rounded-md tabular-nums">
                    {storeSettings.currency} {p.price.toFixed(2)}
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 bg-white/95 text-zinc-900 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {p.brand}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>{p.code}</span>
                      <span>{p.category}</span>
                    </div>
                    <h3 className="text-xs font-bold text-zinc-950 mt-1 line-clamp-1">{p.name}</h3>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5">{p.description}</p>
                  </div>
                  <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-zinc-700 tabular-nums">
                      {totalStock} u. · {p.variants.length} vars
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(p.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </TiltCard3D>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Código</th>
                  <th className="px-3 py-3 font-semibold">Imagen</th>
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-3 py-3 font-semibold">Marca</th>
                  <th className="px-3 py-3 font-semibold">Categoría</th>
                  <th className="px-3 py-3 font-semibold text-right">Precio</th>
                  <th className="px-3 py-3 font-semibold text-right">Costo</th>
                  <th className="px-3 py-3 font-semibold text-center">Variantes</th>
                  <th className="px-3 py-3 font-semibold text-center">Stock Total</th>
                  <th className="px-3 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {filteredProducts.map((p) => {
                  const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);

                  return (
                    <tr key={p.id} className="hover:bg-zinc-50 transition">
                      <td className="px-4 py-3 font-mono font-bold text-red-600">{p.code}</td>
                      <td className="px-3 py-3">
                        <SafeImage
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-md border border-zinc-200"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-zinc-950">{p.name}</div>
                        <div className="text-[10px] text-zinc-400 line-clamp-1">{p.description}</div>
                      </td>
                      <td className="px-3 py-3 font-medium text-zinc-800">{p.brand}</td>
                      <td className="px-3 py-3 text-zinc-600">{p.category}</td>
                      <td className="px-3 py-3 text-right font-bold font-mono text-zinc-950 tabular-nums">
                        {storeSettings.currency} {p.price.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-zinc-500 tabular-nums">
                        {storeSettings.currency} {p.cost.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-semibold text-zinc-800 tabular-nums">
                        {p.variants.length}
                      </td>
                      <td className="px-3 py-3 text-center font-bold font-mono tabular-nums">
                        <span
                          className={
                            totalStock === 0
                              ? 'text-red-600'
                              : totalStock <= 10
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }
                        >
                          {totalStock} u.
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            p.status === 'ACTIVO'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {confirmDeleteId === p.id ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => {
                                deleteProduct(p.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded hover:bg-red-700"
                            >
                              Eliminar
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 bg-zinc-100 text-zinc-700 text-[10px] font-semibold rounded hover:bg-zinc-200"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition"
                              title="Editar producto y variantes"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(p.id)}
                              className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Registrar o Editar Producto y Variantes */}
      <ModalShell
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidthClass="max-w-3xl"
      >
        <div className="flex flex-col max-h-[88vh]">
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white shrink-0">
            <div>
              <h3 className="text-sm font-bold">
                {editingProductId ? 'Editar Producto' : 'Registrar Nuevo Producto'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                CU-01 Control de catálogo y variantes con SKU único
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Código de Producto *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg font-mono font-bold"
                  placeholder="PRD-1021"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-zinc-700 mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg"
                  placeholder="Ej: Camisa Lino Cuello Mao"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Marca</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setFormData({
                      ...formData,
                      category: cat,
                      image: editingProductId ? formData.image : PRODUCT_MEDIA_BY_CATEGORY[cat] || defaultImg,
                    });
                  }}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg"
                >
                  {formCategoryOptions.map((catName) => (
                    <option key={catName} value={catName}>
                      {catName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Subcategoría</label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Precio de Venta ({storeSettings.currency}) *
                </label>
                <input
                  type="number"
                  step="0.10"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Costo Unitario ({storeSettings.currency}) *
                </label>
                <input
                  type="number"
                  step="0.10"
                  required
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVO' | 'INACTIVO' })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg font-semibold"
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Imagen del Producto</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="flex-1 p-2 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-[11px]"
                />
                <SafeImage
                  src={formData.image}
                  alt="Preview"
                  className="w-9 h-9 rounded-md object-cover border border-zinc-200 shrink-0"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Descripción</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg"
                placeholder="Detalles de la tela, corte, cuidados..."
              />
            </div>

            {/* Variants Section */}
            <div className="pt-3 border-t border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-600" />
                  <span className="font-bold text-zinc-950 text-sm">Variantes del Producto</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariantRow}
                  className="px-2.5 py-1.5 bg-zinc-950 text-white hover:bg-red-600 rounded-lg font-semibold text-xs transition"
                >
                  + Agregar Variante
                </button>
              </div>

              <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 text-[11px]">
                    <tr>
                      <th className="px-2.5 py-2 font-semibold">Talla</th>
                      <th className="px-2.5 py-2 font-semibold">Color</th>
                      <th className="px-2.5 py-2 font-semibold">Modelo</th>
                      <th className="px-2.5 py-2 font-semibold">SKU Único *</th>
                      <th className="px-2 py-2 font-semibold text-center w-16">Stock</th>
                      <th className="px-2 py-2 font-semibold text-center w-16">Mín.</th>
                      <th className="px-2.5 py-2 font-semibold">Ubicación</th>
                      <th className="px-2 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {formData.variants.map((v, idx) => (
                      <tr key={idx}>
                        <td className="p-2">
                          <input
                            type="text"
                            required
                            value={v.size}
                            onChange={(e) => handleUpdateVariantField(idx, 'size', e.target.value)}
                            className="w-14 p-1 bg-white border border-zinc-200 rounded text-center font-bold"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            required
                            value={v.color}
                            onChange={(e) => handleUpdateVariantField(idx, 'color', e.target.value)}
                            className="w-24 p-1 bg-white border border-zinc-200 rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={v.model}
                            onChange={(e) => handleUpdateVariantField(idx, 'model', e.target.value)}
                            className="w-24 p-1 bg-white border border-zinc-200 rounded"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            required
                            value={v.sku}
                            onChange={(e) => handleUpdateVariantField(idx, 'sku', e.target.value.toUpperCase())}
                            className="w-36 p-1 bg-white border border-zinc-200 rounded font-mono font-semibold"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            required
                            value={v.stock}
                            onChange={(e) => handleUpdateVariantField(idx, 'stock', parseInt(e.target.value) || 0)}
                            className="w-16 p-1 bg-white border border-zinc-200 rounded text-center font-bold font-mono"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            required
                            value={v.minStock}
                            onChange={(e) => handleUpdateVariantField(idx, 'minStock', parseInt(e.target.value) || 0)}
                            className="w-16 p-1 bg-white border border-zinc-200 rounded text-center font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={v.location}
                            onChange={(e) => handleUpdateVariantField(idx, 'location', e.target.value)}
                            className="w-24 p-1 bg-white border border-zinc-200 rounded"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantRow(idx)}
                            className="p-1 text-zinc-400 hover:text-red-600 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200">
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
                Guardar Producto
              </button>
            </div>
          </form>
        </div>
      </ModalShell>
    </div>
  );
};
