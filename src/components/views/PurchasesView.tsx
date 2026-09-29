import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  Plus,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  FileCheck,
  Eye,
  X,
  Package,
  Calendar,
} from 'lucide-react';
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from '../../types';

export const PurchasesView: React.FC = () => {
  const {
    purchaseOrders,
    suppliers,
    products,
    receivePurchaseOrder,
    createPurchaseOrder,
    storeSettings,
    addToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');

  // Reception Modal (CU-02)
  const [selectedOrderForReception, setSelectedOrderForReception] = useState<PurchaseOrder | null>(null);
  const [receptionNotes, setReceptionNotes] = useState('');

  // New PO Modal
  const [isNewPoModalOpen, setIsNewPoModalOpen] = useState(false);
  const [newPoSupplierId, setNewPoSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [newPoExpectedDate, setNewPoExpectedDate] = useState<string>('2026-10-15');
  const [newPoNotes, setNewPoNotes] = useState<string>('');
  const [newPoItems, setNewPoItems] = useState<
    { productId: string; variantId: string; requestedQty: number; unitCost: number }[]
  >([]);

  // Filtered POs
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchSearch =
        po.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplierRuc.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = selectedStatus === 'TODOS' || po.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [purchaseOrders, searchTerm, selectedStatus]);

  // Handle reception confirmation (CU-02)
  const handleConfirmReception = () => {
    if (!selectedOrderForReception) return;

    const res = receivePurchaseOrder(selectedOrderForReception.id, receptionNotes);
    if (res.success) {
      setSelectedOrderForReception(null);
      setReceptionNotes('');
    }
  };

  // Helper for adding new item row to new PO
  const handleAddItemToNewPo = () => {
    if (products.length === 0) return;
    const firstProd = products[0];
    const firstVar = firstProd.variants[0];
    setNewPoItems((prev) => [
      ...prev,
      {
        productId: firstProd.id,
        variantId: firstVar?.id || '',
        requestedQty: 10,
        unitCost: firstProd.cost,
      },
    ]);
  };

  const handleCreateNewPoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = suppliers.find((s) => s.id === newPoSupplierId);
    if (!supplier) {
      addToast('error', 'Proveedor requerido', 'Seleccione un proveedor.');
      return;
    }

    if (newPoItems.length === 0) {
      addToast('error', 'Sin productos', 'Agregue al menos un producto a la orden de compra.');
      return;
    }

    const itemsFormatted: PurchaseOrderItem[] = newPoItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const variant = prod?.variants.find((v) => v.id === item.variantId);

      return {
        productId: item.productId,
        productName: prod?.name || 'Prenda',
        variantId: item.variantId,
        variantDesc: variant ? `${variant.size} / ${variant.color}` : 'Estándar',
        sku: variant?.sku || 'SKU',
        requestedQty: item.requestedQty,
        receivedQty: 0,
        unitCost: item.unitCost,
        subtotal: item.requestedQty * item.unitCost,
      };
    });

    const total = itemsFormatted.reduce((acc, it) => acc + it.subtotal, 0);

    createPurchaseOrder({
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierRuc: supplier.ruc,
      date: new Date().toISOString().split('T')[0],
      expectedDate: newPoExpectedDate,
      items: itemsFormatted,
      total,
      notes: newPoNotes,
    });

    setIsNewPoModalOpen(false);
    setNewPoItems([]);
    setNewPoNotes('');
  };

  return (
    <div className="space-y-5">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Módulo de Compras & Abastecimiento
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de órdenes de compra a proveedores y recepción en almacén (CU-02)
          </p>
        </div>

        <button
          onClick={() => {
            setIsNewPoModalOpen(true);
            if (newPoItems.length === 0) handleAddItemToNewPo();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Orden de Compra</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por N° orden, proveedor o RUC..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-medium"
        >
          <option value="TODOS">Todos los Estados</option>
          <option value="BORRADOR">Borrador</option>
          <option value="EMITIDA">Emitida</option>
          <option value="ENVIADA">Enviada</option>
          <option value="PARCIAL">Parcial</option>
          <option value="RECIBIDA">Recibida</option>
          <option value="CANCELADA">Cancelada</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">N.º Orden</th>
                <th className="px-4 py-3 font-semibold">Proveedor</th>
                <th className="px-3 py-3 font-semibold">Fecha Emisión</th>
                <th className="px-3 py-3 font-semibold">Fecha Esperada</th>
                <th className="px-4 py-3 font-semibold">Ítems / Variantes</th>
                <th className="px-3 py-3 font-semibold text-right">Total</th>
                <th className="px-3 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.map((po) => {
                let badgeClass = 'bg-slate-100 text-slate-700';
                if (po.status === 'RECIBIDA') {
                  badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                } else if (po.status === 'EMITIDA' || po.status === 'ENVIADA') {
                  badgeClass = 'bg-blue-100 text-blue-800 border border-blue-200';
                } else if (po.status === 'BORRADOR') {
                  badgeClass = 'bg-amber-100 text-amber-800 border border-amber-200';
                } else if (po.status === 'CANCELADA') {
                  badgeClass = 'bg-rose-100 text-rose-800 border border-rose-200';
                }

                const totalItemsQty = po.items.reduce((acc, it) => acc + it.requestedQty, 0);

                return (
                  <tr key={po.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">
                      {po.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{po.supplierName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        RUC: {po.supplierRuc}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-600 font-mono">{po.date}</td>
                    <td className="px-3 py-3 text-slate-600 font-mono">{po.expectedDate}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">
                        {po.items.length} productos ({totalItemsQty} unid.)
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-slate-900">
                      {storeSettings.currency} {po.total.toFixed(2)}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {po.status !== 'RECIBIDA' && po.status !== 'CANCELADA' ? (
                          <button
                            onClick={() => setSelectedOrderForReception(po)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-lg border border-emerald-200 transition"
                            title="CU-02 Confirmar recepción en almacén"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Recibir Mercadería</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedOrderForReception(po)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                            title="Ver detalles de la orden"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CU-02: Modal de Recepción de Mercadería */}
      {selectedOrderForReception && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    CU-02 Registrar Recepción de Mercadería
                  </h3>
                  <p className="text-xs text-slate-500">
                    Orden {selectedOrderForReception.orderNumber} • Proveedor:{' '}
                    {selectedOrderForReception.supplierName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForReception(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>RUC Proveedor:</span>
                  <span className="font-mono font-bold">{selectedOrderForReception.supplierRuc}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha Emisión:</span>
                  <span>{selectedOrderForReception.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estado Actual:</span>
                  <span className="font-bold">{selectedOrderForReception.status}</span>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Prendas y Variantes Solicitadas:</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-2.5 font-semibold">Producto</th>
                        <th className="p-2.5 font-semibold">Variante / SKU</th>
                        <th className="p-2.5 font-semibold text-center">Cant. Solicitada</th>
                        <th className="p-2.5 font-semibold text-center">Cant. a Recibir</th>
                        <th className="p-2.5 font-semibold text-right">Costo Unit.</th>
                        <th className="p-2.5 font-semibold text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrderForReception.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-semibold text-slate-900">{item.productName}</td>
                          <td className="p-2.5 text-slate-600">
                            <div>{item.variantDesc}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                          </td>
                          <td className="p-2.5 text-center font-bold text-slate-800">
                            {item.requestedQty}
                          </td>
                          <td className="p-2.5 text-center font-bold text-emerald-600">
                            {selectedOrderForReception.status === 'RECIBIDA'
                              ? item.receivedQty
                              : item.requestedQty}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-600">
                            {storeSettings.currency} {item.unitCost.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                            {storeSettings.currency} {item.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedOrderForReception.status !== 'RECIBIDA' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Guía de Remisión / Observaciones de Recepción
                  </label>
                  <input
                    type="text"
                    value={receptionNotes}
                    onChange={(e) => setReceptionNotes(e.target.value)}
                    placeholder="Ej: Guía de Remisión N° GR-003-82910, empaques conformes sin daños"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              )}

              {selectedOrderForReception.status === 'RECIBIDA' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <div className="font-bold">Mercadería ingresada previamente</div>
                    <div className="text-[11px]">
                      Recibido por {selectedOrderForReception.receivedBy || 'Almacén'} el{' '}
                      {selectedOrderForReception.receivedAt}.
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForReception(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
                >
                  Cerrar
                </button>
                {selectedOrderForReception.status !== 'RECIBIDA' &&
                  selectedOrderForReception.status !== 'CANCELADA' && (
                    <button
                      type="button"
                      onClick={handleConfirmReception}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-600/30 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirmar Recepción & Actualizar Stock</span>
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear Nueva Orden de Compra */}
      {isNewPoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Emitir Nueva Orden de Compra
              </h3>
              <button
                onClick={() => setIsNewPoModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPoSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Proveedor *
                  </label>
                  <select
                    value={newPoSupplierId}
                    onChange={(e) => setNewPoSupplierId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (RUC: {s.ruc})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fecha Esperada de Entrega
                  </label>
                  <input
                    type="date"
                    required
                    value={newPoExpectedDate}
                    onChange={(e) => setNewPoExpectedDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Prendas a solicitar:</span>
                  <button
                    type="button"
                    onClick={handleAddItemToNewPo}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    + Agregar Prenda
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {newPoItems.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const variants = prod?.variants || [];

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                      >
                        <div>
                          <label className="text-[10px] text-slate-400 block">Producto</label>
                          <select
                            value={item.productId}
                            onChange={(e) => {
                              const newProdId = e.target.value;
                              const p = products.find((pr) => pr.id === newProdId);
                              setNewPoItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        productId: newProdId,
                                        variantId: p?.variants[0]?.id || '',
                                        unitCost: p?.cost || 0,
                                      }
                                    : it
                                )
                              );
                            }}
                            className="w-full p-1 bg-white border border-slate-200 rounded text-xs"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block">Variante</label>
                          <select
                            value={item.variantId}
                            onChange={(e) => {
                              const vId = e.target.value;
                              setNewPoItems((prev) =>
                                prev.map((it, i) => (i === idx ? { ...it, variantId: vId } : it))
                              );
                            }}
                            className="w-full p-1 bg-white border border-slate-200 rounded text-xs"
                          >
                            {variants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.size} / {v.color}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-2">
                          <div className="w-1/2">
                            <label className="text-[10px] text-slate-400 block">Cant.</label>
                            <input
                              type="number"
                              min="1"
                              value={item.requestedQty}
                              onChange={(e) => {
                                const q = parseInt(e.target.value) || 1;
                                setNewPoItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, requestedQty: q } : it))
                                );
                              }}
                              className="w-full p-1 bg-white border border-slate-200 rounded text-xs text-center font-bold"
                            />
                          </div>
                          <div className="w-1/2">
                            <label className="text-[10px] text-slate-400 block">Costo U.</label>
                            <input
                              type="number"
                              step="0.10"
                              value={item.unitCost}
                              onChange={(e) => {
                                const c = parseFloat(e.target.value) || 0;
                                setNewPoItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, unitCost: c } : it))
                                );
                              }}
                              className="w-full p-1 bg-white border border-slate-200 rounded text-xs text-right font-mono"
                            />
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-slate-900 block font-mono">
                            {storeSettings.currency} {(item.requestedQty * item.unitCost).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setNewPoItems((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-[11px] text-rose-600 hover:underline"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas de la Orden</label>
                <textarea
                  rows={2}
                  value={newPoNotes}
                  onChange={(e) => setNewPoNotes(e.target.value)}
                  placeholder="Condiciones de pago a 30 días, entrega en almacén principal..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewPoModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Emitir Orden de Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
