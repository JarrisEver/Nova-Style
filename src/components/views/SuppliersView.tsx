import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';
import { Plus, Search, Edit2, X } from 'lucide-react';
import { ModuleHeader, StaggerSection, ModalShell } from '../ui/MotionPrimitives';

export const SuppliersView: React.FC = () => {
  const { suppliers, saveSupplier } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    ruc: string;
    contact: string;
    phone: string;
    email: string;
    address: string;
    category: string;
    status: 'ACTIVO' | 'INACTIVO';
  }>({
    name: '',
    ruc: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    category: 'Prendas y Telas',
    status: 'ACTIVO',
  });

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const q = searchTerm.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.ruc.includes(q) ||
        s.contact.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    });
  }, [suppliers, searchTerm]);

  const handleOpenCreateModal = () => {
    setEditingSupplierId(null);
    setFormData({
      name: '',
      ruc: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
      category: 'Prendas y Telas',
      status: 'ACTIVO',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sup: Supplier) => {
    setEditingSupplierId(sup.id);
    setFormData({
      name: sup.name,
      ruc: sup.ruc,
      contact: sup.contact,
      phone: sup.phone,
      email: sup.email,
      address: sup.address,
      category: sup.category,
      status: sup.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupplier({
      id: editingSupplierId || undefined,
      ...formData,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        kicker="CADENA DE SUMINISTRO • PROVEEDORES"
        title="Proveedores Homologados"
        subtitle="Registro maestro de fabricantes, distribuidores textiles, calzado y marcas autorizadas"
        actions={
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proveedor</span>
          </button>
        }
      />

      {/* Search */}
      <StaggerSection className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por razón social, RUC, persona de contacto o rubro..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
          />
        </div>
      </StaggerSection>

      {/* Table */}
      <StaggerSection delay={0.08} className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-300 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Razón Social</th>
                <th className="px-3 py-3 font-semibold">RUC</th>
                <th className="px-3 py-3 font-semibold">Rubro / Categoría</th>
                <th className="px-3 py-3 font-semibold">Contacto Directo</th>
                <th className="px-3 py-3 font-semibold">Teléfono</th>
                <th className="px-3 py-3 font-semibold">Correo</th>
                <th className="px-4 py-3 font-semibold">Dirección</th>
                <th className="px-3 py-3 font-semibold">Estado</th>
                <th className="px-3 py-3 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filteredSuppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-zinc-50 transition">
                  <td className="px-4 py-3 font-semibold text-zinc-950">{sup.name}</td>
                  <td className="px-3 py-3 font-mono tabular-nums font-bold text-red-600">{sup.ruc}</td>
                  <td className="px-3 py-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-medium border border-zinc-200">
                      {sup.category}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-medium text-zinc-800">{sup.contact}</td>
                  <td className="px-3 py-3 text-zinc-600 font-mono tabular-nums">{sup.phone}</td>
                  <td className="px-3 py-3 text-zinc-600">{sup.email}</td>
                  <td className="px-4 py-3 text-zinc-500 truncate max-w-[180px]">{sup.address}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        sup.status === 'ACTIVO'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                      }`}
                    >
                      {sup.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(sup)}
                      className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-zinc-100 rounded-lg transition"
                      title="Editar proveedor"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-zinc-400">
                    No hay proveedores registrados con ese criterio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </StaggerSection>

      {/* Modal: Crear / Editar Proveedor */}
      <ModalShell isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidthClass="max-w-md">
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-red-500 block">
              Registro de Proveedor
            </span>
            <h3 className="text-sm font-bold">
              {editingSupplierId ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="text-zinc-400 hover:text-white p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Razón Social *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Distribuidora Textil del Pacífico S.A.C."
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">RUC *</label>
              <input
                type="text"
                required
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                placeholder="20601928301"
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Rubro / Categoría</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Calzado, Prendas..."
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Contacto Comercial</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Nombre representante"
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="01 512 8800"
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ventas@textilpacifico.pe"
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Dirección Fiscal</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Av. Materiales 3050, Lima"
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition"
            >
              Guardar Proveedor
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
};
