import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ModalShell, ModuleHeader } from '../ui/MotionPrimitives';
import {
  Truck,
  Plus,
  Search,
  CheckCircle,
  FileCheck,
  Eye,
  X,
} from 'lucide-react';
import { PurchaseOrder, PurchaseOrderItem } from '../../types';

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

  const [selectedOrderForReception, setSelectedOrderForReception] = useState<PurchaseOrder | null>(null);
  const [receptionNotes, setReceptionNotes] = useState('');

  const [isNewPoModalOpen, setIsNewPoModalOpen] = useState(false);
  const [newPoSupplierId, setNewPoSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [newPoExpectedDate, setNewPoExpectedDate] = useState<string>('2026-10-15');
  const [newPoNotes, setNewPoNotes] = useState<string>('');
  const [newPoItems, setNewPoItems] = useState<
    { productId: string; variantId: string; requestedQty: number; unitCost: number }[]
  >([]);

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

  const handleConfirmReception = () => {
    if (!selectedOrderForReception) return;
    const res = receivePurchaseOrder(selectedOrderForReception.id, receptionNotes);
    if (res.success) {
      setSelectedOrderForReception(null);
      setReceptionNotes('');
    }
  };

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
      <ModuleHeader
        kicker="Abastecimiento · CU-02 & CU-10"
        title="Compras & Recepciones"
        subtitle="Gestión de órdenes de compra a proveedores y recepción de mercadería en almacén."
        actions={
          <button
            onClick={() => {
              setIsNewPoModalOpen(true);
              if (newPoItems.length === 0) handleAddItemToNewPo();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Orden de Compra</span>
          </button>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por N° orden, proveedor o RUC..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/15 focus:border-red-600"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none text-zinc-800 font-medium"
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

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 font-semibold">N° Orden</th>
                <th className="px-4 py-3 font-semibold">Proveedor</th>
                <th className="px-3 py-3 font-semibold">Emisión</th>
                <th className="px-3 py-3 font-semibold">Entrega Est.</th>
                <th className="px-4 py-3 font-semibold">Ítems</th>
                <th className="px-3 py-3 font-semibold text-right">Total</th>
                <th className="px-3 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filteredOrders.map((po) => {
                let badgeClass = 'bg-zinc-100 text-zinc-700 border-zinc-200';
                if (po.status === 'RECIBIDA') {
                  badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                } else if (po.status === 'EMITIDA' || po.status === 'ENVIADA') {
                  badgeClass = 'bg-zinc-950 text-white border-zinc-900';
                } else if (po.status === 'BORRADOR') {
                  badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                } else if (po.status === 'CANCELADA') {
                  badgeClass = 'bg-red-50 text-red-700 border-red-200';
                }

                const totalItemsQty = po.items.reduce((acc, it) => acc + it.requestedQty, 0);

                return (
                  <tr key={po.id} className="hover:bg-zinc-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-red-600">{po.orderNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-950">{po.supplierName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">RUC: {po.supplierRuc}</div>
                    </td>
                    <td className="px-3 py-3 text-zinc-600 font-mono tabular-nums">{po.date}</td>
                    <td className="px-3 py-3 text-zinc-600 font-mono tabular-nums">{po.expectedDate}</td>
                    <td className="px-4 py-3 tabular-nums">
                      <span className="font-semibold text-zinc-800">
                        {po.items.length} prods · {totalItemsQty} u.
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-bold font-mono text-zinc-950 tabular-nums">
                      {storeSettings.currency} {po.total.toFixed(2)}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {po.status !== 'RECIBIDA' && po.status !== 'CANCELADA' ? (
                          <button
                            onClick={() => setSelectedOrderForReception(po)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold rounded-lg transition whitespace-nowrap"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Recibir</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedOrderForReception(po)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition"
                            title="Ver detalles"
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

      {/* CU-02: Reception Modal */}
      <ModalShell
        isOpen={!!selectedOrderForReception}
        onClose={() => setSelectedOrderForReception(null)}
        maxWidthClass="max-w-2xl"
      >
        {selectedOrderForReception && (
          <div>
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="text-sm font-bold">CU-02 Recepción de Mercadería</h3>
                  <p className="text-[11px] text-zinc-400">
                    {selectedOrderForReception.orderNumber} · {selectedOrderForReception.supplierName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForReception(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1 text-zinc-700">
                <div className="flex justify-between">
                  <span>RUC Proveedor:</span>
                  <span className="font-mono font-bold">{selectedOrderForReception.supplierRuc}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha Emisión:</span>
                  <span className="font-mono">{selectedOrderForReception.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estado Actual:</span>
                  <span className="font-bold text-red-600">{selectedOrderForReception.status}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 mb-2">Detalle de Variantes</h4>
                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200 text-[11px]">
                      <tr>
                        <th className="p-2.5 font-semibold">Producto</th>
                        <th className="p-2.5 font-semibold">Variante / SKU</th>
                        <th className="p-2.5 font-semibold text-center">Solic.</th>
                        <th className="p-2.5 font-semibold text-center">A Recibir</th>
                        <th className="p-2.5 font-semibold text-right">Costo U.</th>
                        <th className="p-2.5 font-semibold text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {selectedOrderForReception.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-semibold text-zinc-950">{item.productName}</td>
                          <td className="p-2.5 text-zinc-600">
                            <div>{item.variantDesc}</div>
                            <div className="text-[10px] text-zinc-400 font-mono">{item.sku}</div>
                          </td>
                          <td className="p-2.5 text-center font-bold font-mono tabular-nums">
                            {item.requestedQty}
                          </td>
                          <td className="p-2.5 text-center font-bold font-mono text-emerald-700 tabular-nums">
                            {selectedOrderForReception.status === 'RECIBIDA'
                              ? item.receivedQty
                              : item.requestedQty}
                          </td>
                          <td className="p-2.5 text-right font-mono text-zinc-600 tabular-nums">
                            {storeSettings.currency} {item.unitCost.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right font-bold text-zinc-950 font-mono tabular-nums">
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
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Guía de Remisión / Observaciones
                  </label>
                  <input
                    type="text"
                    value={receptionNotes}
                    onChange={(e) => setReceptionNotes(e.target.value)}
                    placeholder="Ej: Guía de Remisión N° GR-003-82910, empaques conformes"
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                  />
                </div>
              )}

              {selectedOrderForReception.status === 'RECIBIDA' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                  <div>
                    <div className="font-bold">Mercadería ingresada previamente</div>
                    <div className="text-[11px]">
                      Recibido por {selectedOrderForReception.receivedBy || 'Almacén'} el{' '}
                      {selectedOrderForReception.receivedAt}.
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForReception(null)}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 font-semibold rounded-lg hover:bg-zinc-200"
                >
                  Cerrar
                </button>
                {selectedOrderForReception.status !== 'RECIBIDA' &&
                  selectedOrderForReception.status !== 'CANCELADA' && (
                    <button
                      type="button"
                      onClick={handleConfirmReception}
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirmar Recepción & Stock</span>
                    </button>
                  )}
              </div>
            </div>
          </div>
        )}
      </ModalShell>

      {/* New PO Modal */}
      <ModalShell
        isOpen={isNewPoModalOpen}
        onClose={() => setIsNewPoModalOpen(false)}
        maxWidthClass="max-w-2xl"
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
          <h3 className="text-sm font-bold">Emitir Nueva Orden de Compra</h3>
          <button
            onClick={() => setIsNewPoModalOpen(false)}
            className="text-zinc-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreateNewPoSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Proveedor *</label>
              <select
                value={newPoSupplierId}
                onChange={(e) => setNewPoSupplierId(e.target.value)}
                className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (RUC: {s.ruc})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Fecha Esperada de Entrega</label>
              <input
                type="date"
                required
                value={newPoExpectedDate}
                onChange={(e) => setNewPoExpectedDate(e.target.value)}
                className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900">Prendas a solicitar</span>
              <button
                type="button"
                onClick={handleAddItemToNewPo}
                className="text-red-600 font-semibold hover:underline"
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
                    className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                  >
                    <div>
                      <label className="text-[10px] text-zinc-500 block">Producto</label>
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
                        className="w-full p-1 bg-white border border-zinc-200 rounded text-xs"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-500 block">Variante</label>
                      <select
                        value={item.variantId}
                        onChange={(e) => {
                          const vId = e.target.value;
                          setNewPoItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, variantId: vId } : it))
                          );
                        }}
                        className="w-full p-1 bg-white border border-zinc-200 rounded text-xs"
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
                        <label className="text-[10px] text-zinc-500 block">Cant.</label>
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
                          className="w-full p-1 bg-white border border-zinc-200 rounded text-xs text-center font-bold font-mono"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="text-[10px] text-zinc-500 block">Costo U.</label>
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
                          className="w-full p-1 bg-white border border-zinc-200 rounded text-xs text-right font-mono"
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-zinc-950 block font-mono tabular-nums">
                        {storeSettings.currency} {(item.requestedQty * item.unitCost).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setNewPoItems((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-[11px] text-red-600 hover:underline"
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
            <label className="block font-semibold text-zinc-700 mb-1">Notas de la Orden</label>
            <textarea
              rows={2}
              value={newPoNotes}
              onChange={(e) => setNewPoNotes(e.target.value)}
              placeholder="Condiciones de pago, entrega en almacén..."
              className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => setIsNewPoModalOpen(false)}
              className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
            >
              Emitir Orden de Compra
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
};
