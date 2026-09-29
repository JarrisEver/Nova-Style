import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductVariant } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Layers,
  Image,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { products, saveProduct, deleteProduct, storeSettings, addToast } = useApp();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [selectedBrand, setSelectedBrand] = useState('TODAS');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State
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
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500',
    variants: [],
  });

  const categories = useMemo(() => {
    return ['TODAS', ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

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
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
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
      image: formData.image,
      variants: formData.variants,
    });

    if (res.success) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Catálogo de Productos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de productos, especificaciones, costos y variantes con SKU
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Producto</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, nombre, marca o SKU..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
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
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
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
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
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
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.map((p) => {
                const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">
                      {p.code}
                    </td>
                    <td className="px-3 py-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {p.description}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-800">{p.brand}</td>
                    <td className="px-3 py-3 text-slate-600">{p.category}</td>
                    <td className="px-3 py-3 text-right font-bold text-slate-900">
                      {storeSettings.currency} {p.price.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right text-slate-500">
                      {storeSettings.currency} {p.cost.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-semibold text-slate-800">
                        {p.variants.length} vars
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-bold">
                      <span
                        className={
                          totalStock === 0
                            ? 'text-rose-600'
                            : totalStock <= 10
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }
                      >
                        {totalStock} unid.
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'ACTIVO'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar producto y variantes"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Seguro que desea eliminar el producto "${p.name}"?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar o Editar Producto y Variantes */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingProductId ? 'Editar Producto' : 'Registrar Nuevo Producto'}
                </h3>
                <p className="text-xs text-slate-500">
                  CU-01 Registrar producto y variantes con control estricto de SKU
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Código de Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                    placeholder="PRD-1021"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholder="Ej: Camisa Lino Cuello Mao"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marca</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholder="Ej: Zara, Lacoste..."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Ropa Hombre">Ropa Hombre</option>
                    <option value="Ropa Mujer">Ropa Mujer</option>
                    <option value="Calzado">Calzado</option>
                    <option value="Ropa Deportiva">Ropa Deportiva</option>
                    <option value="Accesorios">Accesorios</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subcategoría</label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholder="Ej: Camisas, Jeans..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Precio de Venta ({storeSettings.currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Costo Unitario ({storeSettings.currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  URL de Imagen del Producto
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholder="https://..."
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-8 h-8 rounded object-cover border border-slate-200"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="Detalles de la tela, corte, cuidados de lavado..."
                />
              </div>

              {/* Section: VARIANTES (CU-01 / Regla 9) */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-sm">
                      Variantes del Producto
                    </span>
                    <span className="text-[10px] text-slate-500">
                      (Tallas, colores, SKUs únicos y stock)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold text-xs transition"
                  >
                    + Agregar Variante
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Talla</th>
                        <th className="px-3 py-2 font-semibold">Color</th>
                        <th className="px-3 py-2 font-semibold">Modelo</th>
                        <th className="px-3 py-2 font-semibold">SKU Único *</th>
                        <th className="px-2 py-2 font-semibold text-center w-16">Stock</th>
                        <th className="px-2 py-2 font-semibold text-center w-16">Mín.</th>
                        <th className="px-3 py-2 font-semibold">Ubicación</th>
                        <th className="px-2 py-2 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.variants.map((v, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              value={v.size}
                              onChange={(e) => handleUpdateVariantField(idx, 'size', e.target.value)}
                              className="w-16 p-1 bg-white border border-slate-200 rounded text-center font-bold"
                              placeholder="M"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              value={v.color}
                              onChange={(e) => handleUpdateVariantField(idx, 'color', e.target.value)}
                              className="w-24 p-1 bg-white border border-slate-200 rounded"
                              placeholder="Azul"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={v.model}
                              onChange={(e) => handleUpdateVariantField(idx, 'model', e.target.value)}
                              className="w-24 p-1 bg-white border border-slate-200 rounded"
                              placeholder="Slim"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              value={v.sku}
                              onChange={(e) => handleUpdateVariantField(idx, 'sku', e.target.value.toUpperCase())}
                              className="w-36 p-1 bg-white border border-slate-200 rounded font-mono font-semibold"
                              placeholder="NS-CAM-01"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              min="0"
                              required
                              value={v.stock}
                              onChange={(e) => handleUpdateVariantField(idx, 'stock', parseInt(e.target.value) || 0)}
                              className="w-16 p-1 bg-white border border-slate-200 rounded text-center font-bold"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              min="0"
                              required
                              value={v.minStock}
                              onChange={(e) => handleUpdateVariantField(idx, 'minStock', parseInt(e.target.value) || 0)}
                              className="w-16 p-1 bg-white border border-slate-200 rounded text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={v.location}
                              onChange={(e) => handleUpdateVariantField(idx, 'location', e.target.value)}
                              className="w-24 p-1 bg-white border border-slate-200 rounded"
                              placeholder="Pasillo A-01"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantRow(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
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

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
