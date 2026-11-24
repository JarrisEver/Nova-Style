import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';
import {
  Plus,
  Search,
  Eye,
  ShoppingBag,
  RotateCcw,
  X,
  CreditCard,
  Edit2,
} from 'lucide-react';
import { ModuleHeader, StaggerSection, ModalShell } from '../ui/MotionPrimitives';

export const ClientsView: React.FC = () => {
  const { clients, sales, onlineOrders, returns, saveClient, storeSettings } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    documentType: 'DNI' | 'RUC' | 'CE';
    document: string;
    phone: string;
    email: string;
    address: string;
    status: 'ACTIVO' | 'INACTIVO';
  }>({
    name: '',
    documentType: 'DNI',
    document: '',
    phone: '',
    email: '',
    address: '',
    status: 'ACTIVO',
  });

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.document.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    });
  }, [clients, searchTerm]);

  const clientSales = useMemo(() => {
    if (!selectedClientDetail) return [];
    return sales.filter((s) => s.clientId === selectedClientDetail.id);
  }, [sales, selectedClientDetail]);

  const clientOrders = useMemo(() => {
    if (!selectedClientDetail) return [];
    return onlineOrders.filter((o) => o.clientId === selectedClientDetail.id);
  }, [onlineOrders, selectedClientDetail]);

  const clientReturns = useMemo(() => {
    if (!selectedClientDetail) return [];
    return returns.filter((r) => r.clientId === selectedClientDetail.id);
  }, [returns, selectedClientDetail]);

  const handleOpenCreateModal = () => {
    setEditingClientId(null);
    setFormData({
      name: '',
      documentType: 'DNI',
      document: '',
      phone: '',
      email: '',
      address: '',
      status: 'ACTIVO',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClientId(client.id);
    setFormData({
      name: client.name,
      documentType: client.documentType,
      document: client.document,
      phone: client.phone,
      email: client.email,
      address: client.address,
      status: client.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveClient({
      id: editingClientId || undefined,
      ...formData,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <ModuleHeader
        kicker="CRM COMERCIAL • CARTERA DE CLIENTES"
        title="Directorio de Clientes"
        subtitle="Gestión de cartera, trazabilidad de compras en tienda, pedidos ecommerce y devoluciones"
        actions={
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
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
            placeholder="Buscar cliente por nombre, documento (DNI/RUC), correo o teléfono..."
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
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-3 py-3 font-semibold">Documento</th>
                <th className="px-3 py-3 font-semibold">Contacto</th>
                <th className="px-4 py-3 font-semibold">Dirección</th>
                <th className="px-3 py-3 font-semibold text-center">N° Compras</th>
                <th className="px-3 py-3 font-semibold text-right">Total Gastado</th>
                <th className="px-3 py-3 font-semibold">Última Compra</th>
                <th className="px-3 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-zinc-50 transition">
                  <td className="px-4 py-3 font-semibold text-zinc-950">{client.name}</td>
                  <td className="px-3 py-3 font-mono tabular-nums">
                    <span className="font-semibold text-zinc-500 mr-1">{client.documentType}:</span>
                    <span className="text-red-600 font-bold">{client.document}</span>
                  </td>
                  <td className="px-3 py-3 text-zinc-600">
                    <div className="font-mono tabular-nums">{client.phone}</div>
                    <div className="text-[10px] text-zinc-400">{client.email}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 truncate max-w-[180px]">{client.address}</td>
                  <td className="px-3 py-3 text-center font-mono tabular-nums font-bold text-zinc-900">
                    {client.totalPurchases || 0}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-zinc-950 font-mono tabular-nums">
                    {storeSettings.currency} {(client.totalSpent || 0).toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-zinc-500 font-mono tabular-nums text-[11px]">
                    {client.lastPurchaseDate || '—'}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        client.status === 'ACTIVO'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedClientDetail(client)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-950 text-white hover:bg-red-600 font-semibold transition text-xs"
                        title="Ver ficha e historial"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ficha</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(client)}
                        className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-zinc-100 rounded-lg transition"
                        title="Editar cliente"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-zinc-400">
                    No se encontraron clientes que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </StaggerSection>

      {/* Modal: Client Detail & Complete History */}
      <ModalShell
        isOpen={Boolean(selectedClientDetail)}
        onClose={() => setSelectedClientDetail(null)}
        maxWidthClass="max-w-3xl"
      >
        {selectedClientDetail && (
          <div className="flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-red-500 block">
                  Ficha 360° de Cliente
                </span>
                <h3 className="text-sm font-bold">Historial Integral del Cliente</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {selectedClientDetail.name} • {selectedClientDetail.documentType}:{' '}
                  <span className="font-mono text-zinc-200">{selectedClientDetail.document}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClientDetail(null)}
                className="text-zinc-400 hover:text-white p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Personal Data card */}
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                    Teléfono
                  </span>
                  <div className="font-semibold font-mono text-zinc-900 mt-0.5">
                    {selectedClientDetail.phone}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                    Correo
                  </span>
                  <div className="font-semibold text-zinc-900 truncate mt-0.5">
                    {selectedClientDetail.email}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                    Dirección
                  </span>
                  <div className="font-semibold text-zinc-900 truncate mt-0.5">
                    {selectedClientDetail.address}
                  </div>
                </div>
              </div>

              {/* 1. In-Store Sales History */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-zinc-950 text-xs">
                  <CreditCard className="w-4 h-4 text-red-600" />
                  <span>Ventas Presenciales Realizadas ({clientSales.length})</span>
                </div>
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-100 text-zinc-600 border-b border-zinc-200 text-[11px]">
                      <tr>
                        <th className="p-2.5 font-semibold">N° Venta</th>
                        <th className="p-2.5 font-semibold">Fecha</th>
                        <th className="p-2.5 font-semibold">Método de Pago</th>
                        <th className="p-2.5 font-semibold text-right">Total</th>
                        <th className="p-2.5 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {clientSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-zinc-50">
                          <td className="p-2.5 font-mono font-bold text-red-600">{sale.saleNumber}</td>
                          <td className="p-2.5 text-zinc-500 font-mono tabular-nums">{sale.date}</td>
                          <td className="p-2.5 text-zinc-700">{sale.paymentMethod}</td>
                          <td className="p-2.5 text-right font-bold text-zinc-950 font-mono tabular-nums">
                            {storeSettings.currency} {sale.total.toFixed(2)}
                          </td>
                          <td className="p-2.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {sale.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {clientSales.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-zinc-400">
                            No registra compras presenciales aún.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Online Orders */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-zinc-950 text-xs">
                  <ShoppingBag className="w-4 h-4 text-zinc-900" />
                  <span>Pedidos Online Ecommerce ({clientOrders.length})</span>
                </div>
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-100 text-zinc-600 border-b border-zinc-200 text-[11px]">
                      <tr>
                        <th className="p-2.5 font-semibold">N° Pedido</th>
                        <th className="p-2.5 font-semibold">Fecha</th>
                        <th className="p-2.5 font-semibold">Estado</th>
                        <th className="p-2.5 font-semibold text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {clientOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-zinc-50">
                          <td className="p-2.5 font-mono font-bold text-zinc-950">{ord.orderNumber}</td>
                          <td className="p-2.5 text-zinc-500 font-mono tabular-nums">{ord.date}</td>
                          <td className="p-2.5 font-semibold text-zinc-700">{ord.status}</td>
                          <td className="p-2.5 text-right font-bold text-zinc-950 font-mono tabular-nums">
                            {storeSettings.currency} {ord.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {clientOrders.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-zinc-400">
                            No registra pedidos online.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Returns */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-zinc-950 text-xs">
                  <RotateCcw className="w-4 h-4 text-red-600" />
                  <span>Devoluciones Registradas ({clientReturns.length})</span>
                </div>
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-100 text-zinc-600 border-b border-zinc-200 text-[11px]">
                      <tr>
                        <th className="p-2.5 font-semibold">N° Devolución</th>
                        <th className="p-2.5 font-semibold">Producto</th>
                        <th className="p-2.5 font-semibold">Resolución</th>
                        <th className="p-2.5 font-semibold text-right">Reembolso</th>
                        <th className="p-2.5 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {clientReturns.map((ret) => (
                        <tr key={ret.id} className="hover:bg-zinc-50">
                          <td className="p-2.5 font-mono font-bold text-red-600">{ret.returnNumber}</td>
                          <td className="p-2.5 text-zinc-800 font-medium">{ret.productName}</td>
                          <td className="p-2.5 text-zinc-600">{ret.resolution}</td>
                          <td className="p-2.5 text-right font-bold text-zinc-950 font-mono tabular-nums">
                            {storeSettings.currency} {ret.refundAmount.toFixed(2)}
                          </td>
                          <td className="p-2.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                              {ret.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {clientReturns.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-zinc-400">
                            Sin registro de devoluciones.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedClientDetail(null)}
                className="px-4 py-2 bg-zinc-950 text-white rounded-lg font-semibold hover:bg-zinc-800 text-xs transition"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        )}
      </ModalShell>

      {/* Modal: Crear / Editar Cliente */}
      <ModalShell isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidthClass="max-w-md">
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-red-500 block">
              Cartera de Clientes
            </span>
            <h3 className="text-sm font-bold">
              {editingClientId ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Doc.</label>
              <select
                value={formData.documentType}
                onChange={(e) =>
                  setFormData({ ...formData, documentType: e.target.value as 'DNI' | 'RUC' | 'CE' })
                }
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              >
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="CE">CE</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block font-semibold text-zinc-700 mb-1">N° Documento *</label>
              <input
                type="text"
                required
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                placeholder="47829103"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              Nombre Completo o Razón Social *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              placeholder="Ej: Gabriel Torres Morales"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                placeholder="944 332 211"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                placeholder="gabriel@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Dirección de Entrega</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              placeholder="Av. Javier Prado Este 2450, Lima"
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
              Guardar Cliente
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
};
