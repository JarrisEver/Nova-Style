import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';
import {
  Users,
  Plus,
  Search,
  Eye,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  RotateCcw,
  X,
  CreditCard,
} from 'lucide-react';

export const ClientsView: React.FC = () => {
  const { clients, sales, onlineOrders, returns, saveClient, storeSettings } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null);

  // Modal Create/Edit
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

  // Client history
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
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Directorio de Clientes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de clientes, historial de compras, pedidos ecommerce y devoluciones
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Cliente</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente por nombre, documento (DNI/RUC), correo o teléfono..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-3 py-3 font-semibold">Documento</th>
                <th className="px-3 py-3 font-semibold">Contacto</th>
                <th className="px-4 py-3 font-semibold">Dirección</th>
                <th className="px-3 py-3 font-semibold text-center">N° Compras</th>
                <th className="px-3 py-3 font-semibold text-right">Total Gastado</th>
                <th className="px-3 py-3 font-semibold">Última Compra</th>
                <th className="px-3 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-center">Historial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {client.name}
                  </td>
                  <td className="px-3 py-3 font-mono">
                    <span className="font-semibold text-slate-500 mr-1">{client.documentType}:</span>
                    <span className="text-blue-700 font-bold">{client.document}</span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    <div>{client.phone}</div>
                    <div className="text-[10px] text-slate-400">{client.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 truncate max-w-[180px]">
                    {client.address}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-slate-800">
                    {client.totalPurchases || 0}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-slate-900 font-mono">
                    {storeSettings.currency} {(client.totalSpent || 0).toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-slate-500 font-mono text-[11px]">
                    {client.lastPurchaseDate || '—'}
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedClientDetail(client)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition text-xs"
                      title="Ver ficha e historial"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ficha</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Client Detail & Complete History */}
      {selectedClientDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Historial Integral del Cliente
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedClientDetail.name} • {selectedClientDetail.documentType}:{' '}
                  {selectedClientDetail.document}
                </p>
              </div>
              <button
                onClick={() => setSelectedClientDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Personal Data card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Teléfono</span>
                  <div className="font-semibold text-slate-800">{selectedClientDetail.phone}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Correo</span>
                  <div className="font-semibold text-slate-800 truncate">{selectedClientDetail.email}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Dirección</span>
                  <div className="font-semibold text-slate-800 truncate">{selectedClientDetail.address}</div>
                </div>
              </div>

              {/* 1. In-Store Sales History */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Ventas Presenciales Realizadas ({clientSales.length})</span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-2.5">N° Venta</th>
                        <th className="p-2.5">Fecha</th>
                        <th className="p-2.5">Método de Pago</th>
                        <th className="p-2.5 text-right">Total</th>
                        <th className="p-2.5">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clientSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-mono font-bold text-blue-700">{sale.saleNumber}</td>
                          <td className="p-2.5 text-slate-500 font-mono">{sale.date}</td>
                          <td className="p-2.5 text-slate-700">{sale.paymentMethod}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                            {storeSettings.currency} {sale.total.toFixed(2)}
                          </td>
                          <td className="p-2.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {sale.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {clientSales.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400 italic">
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
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <ShoppingBag className="w-4 h-4 text-indigo-600" />
                  <span>Pedidos Online Ecommerce ({clientOrders.length})</span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-2.5">N° Pedido</th>
                        <th className="p-2.5">Fecha</th>
                        <th className="p-2.5">Estado</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clientOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-mono font-bold text-blue-700">{ord.orderNumber}</td>
                          <td className="p-2.5 text-slate-500 font-mono">{ord.date}</td>
                          <td className="p-2.5 font-semibold text-slate-700">{ord.status}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                            {storeSettings.currency} {ord.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {clientOrders.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-400 italic">
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
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <RotateCcw className="w-4 h-4 text-purple-600" />
                  <span>Devoluciones Registradas ({clientReturns.length})</span>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-2.5">N° Devolución</th>
                        <th className="p-2.5">Producto</th>
                        <th className="p-2.5">Resolución</th>
                        <th className="p-2.5 text-right">Reembolso</th>
                        <th className="p-2.5">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clientReturns.map((ret) => (
                        <tr key={ret.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-mono font-bold text-purple-700">{ret.returnNumber}</td>
                          <td className="p-2.5 text-slate-700 font-medium">{ret.productName}</td>
                          <td className="p-2.5 text-slate-600">{ret.resolution}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                            {storeSettings.currency} {ret.refundAmount.toFixed(2)}
                          </td>
                          <td className="p-2.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {ret.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {clientReturns.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                            Sin registro de devoluciones.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedClientDetail(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingClientId ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doc.</label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                    <option value="CE">CE</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">N° Documento *</label>
                  <input
                    type="text"
                    required
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                    placeholder="47829103"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Completo o Razón Social *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="Ej: Gabriel Torres Morales"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholder="944 332 211"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholder="gabriel@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dirección de Entrega</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="Av. Javier Prado Este 2450, Lima"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
