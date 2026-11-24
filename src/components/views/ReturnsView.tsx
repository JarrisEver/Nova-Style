import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ModuleHeader } from '../ui/MotionPrimitives';
import {
  RotateCcw,
  Search,
  ShieldAlert,
  ArrowRight,
  X,
} from 'lucide-react';
import { Sale } from '../../types';

export const ReturnsView: React.FC = () => {
  const {
    sales,
    returns,
    processReturn,
    approveReturn,
    currentUser,
    storeSettings,
    addToast,
  } = useApp();

  const [saleSearchQuery, setSaleSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const [selectedItemVariantId, setSelectedItemVariantId] = useState<string>('');
  const [returnQuantity, setReturnQuantity] = useState<number>(1);
  const [returnReason, setReturnReason] = useState<string>('Talla inadecuada / cambio de modelo');
  const [returnResolution, setReturnResolution] = useState<'CAMBIO' | 'DEVOLUCION_EFECTIVO' | 'NOTA_CREDITO'>('CAMBIO');

  const matchedSales = useMemo(() => {
    if (!saleSearchQuery.trim()) return [];
    const q = saleSearchQuery.toLowerCase();
    return sales.filter(
      (s) =>
        s.saleNumber.toLowerCase().includes(q) ||
        s.clientName.toLowerCase().includes(q) ||
        s.clientDoc.includes(q)
    );
  }, [sales, saleSearchQuery]);

  const selectedSaleItem = selectedSale?.items.find(
    (it) => it.variantId === selectedItemVariantId
  );

  const maxReturnQty = selectedSaleItem ? selectedSaleItem.quantity : 1;
  const estimatedRefund = selectedSaleItem
    ? Number((selectedSaleItem.unitPrice * returnQuantity).toFixed(2))
    : 0;

  const handleSelectSale = (sale: Sale) => {
    setSelectedSale(sale);
    if (sale.items.length > 0) {
      setSelectedItemVariantId(sale.items[0].variantId);
    }
    setReturnQuantity(1);
  };

  const handleProcessReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale || !selectedItemVariantId) {
      addToast('error', 'Selección incompleta', 'Seleccione la venta y el producto a devolver.');
      return;
    }

    const res = processReturn({
      saleId: selectedSale.id,
      variantId: selectedItemVariantId,
      quantity: returnQuantity,
      reason: returnReason,
      resolution: returnResolution,
    });

    if (res.success) {
      setSelectedSale(null);
      setSaleSearchQuery('');
    }
  };

  const isSupervisorOrAdmin =
    currentUser?.role === 'SUPERVISOR' || currentUser?.role === 'ADMINISTRADOR';

  return (
    <div className="space-y-6">
      <ModuleHeader
        kicker="Postventa & Supervisión · CU-06"
        title="Devoluciones, Cambios & Notas de Crédito"
        subtitle="Validación de comprobante de origen, autorización de jefatura y reintegro automático al Kardex."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-zinc-200 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-200">
            <Search className="w-4 h-4 text-red-600" />
            <h2 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
              1. Buscar Venta de Origen
            </h2>
          </div>

          <input
            type="text"
            value={saleSearchQuery}
            onChange={(e) => setSaleSearchQuery(e.target.value)}
            placeholder="Buscar por N° comprobante (ej: B001-000411) o DNI..."
            className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/15 focus:border-red-600"
          />

          {matchedSales.length > 0 && !selectedSale && (
            <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100 max-h-48 overflow-y-auto">
              {matchedSales.map((sale) => (
                <div
                  key={sale.id}
                  onClick={() => handleSelectSale(sale)}
                  className="p-2.5 hover:bg-zinc-50 cursor-pointer transition flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold font-mono text-red-600">{sale.saleNumber}</span>
                    <span className="text-zinc-400 text-[11px] ml-2 font-mono">{sale.date}</span>
                    <div className="text-zinc-900 font-medium">{sale.clientName}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-zinc-950 font-mono tabular-nums">
                      {storeSettings.currency} {sale.total.toFixed(2)}
                    </span>
                    <div className="text-[10px] text-red-600 font-semibold flex items-center gap-0.5 justify-end">
                      <span>Seleccionar</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedSale ? (
            <form onSubmit={handleProcessReturnSubmit} className="space-y-4 pt-2 border-t border-zinc-100 text-xs">
              <div className="p-3 bg-zinc-950 text-white rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                    Comprobante Seleccionado
                  </span>
                  <div className="font-mono font-bold text-sm">{selectedSale.saleNumber}</div>
                  <div className="text-[11px] text-zinc-300">
                    {selectedSale.clientName} · {selectedSale.clientDocType}: {selectedSale.clientDoc}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSale(null)}
                  className="p-1 text-zinc-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Producto a Devolver *</label>
                <select
                  value={selectedItemVariantId}
                  onChange={(e) => {
                    setSelectedItemVariantId(e.target.value);
                    setReturnQuantity(1);
                  }}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs"
                >
                  {selectedSale.items.map((item) => (
                    <option key={item.variantId} value={item.variantId}>
                      {item.productName} ({item.variantDesc}) · Cant: {item.quantity} · {storeSettings.currency} {item.unitPrice.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Cantidad (Máx: {maxReturnQty})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxReturnQty}
                    required
                    value={returnQuantity}
                    onChange={(e) =>
                      setReturnQuantity(
                        Math.min(maxReturnQty, Math.max(1, parseInt(e.target.value) || 1))
                      )
                    }
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg font-bold font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Resolución</label>
                  <select
                    value={returnResolution}
                    onChange={(e) =>
                      setReturnResolution(e.target.value as 'CAMBIO' | 'DEVOLUCION_EFECTIVO' | 'NOTA_CREDITO')
                    }
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg font-semibold"
                  >
                    <option value="CAMBIO">Cambio por otra prenda</option>
                    <option value="NOTA_CREDITO">Emisión de Nota de Crédito</option>
                    <option value="DEVOLUCION_EFECTIVO">Reembolso en Efectivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Motivo *</label>
                <input
                  type="text"
                  required
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>

              {estimatedRefund > 200 && !isSupervisorOrAdmin && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Requiere Autorización de Supervisor</div>
                    <p className="text-[11px] mt-0.5">
                      Monto ({storeSettings.currency} {estimatedRefund.toFixed(2)}) supera S/ 200.00.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between font-bold tabular-nums">
                <span>Monto a Reintegrar:</span>
                <span className="text-base text-red-600 font-mono">
                  {storeSettings.currency} {estimatedRefund.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Registrar Solicitud de Devolución</span>
              </button>
            </form>
          ) : (
            <div className="p-8 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 rounded-lg">
              Ingrese un N° de comprobante arriba o busque un cliente para cargar la venta.
            </div>
          )}
        </div>

        {/* Right History */}
        <div className="lg:col-span-6">
          <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200">
              <h2 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                2. Historial & Aprobaciones
              </h2>
              <span className="text-xs font-mono font-semibold text-zinc-500 tabular-nums">
                {returns.length} registros
              </span>
            </div>

            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
              {returns.map((ret) => (
                <div
                  key={ret.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 transition ${
                    ret.status === 'PENDIENTE_SUPERVISOR'
                      ? 'border-amber-300 bg-amber-50/40'
                      : 'border-zinc-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-600 font-mono">{ret.returnNumber}</span>
                      <span className="text-zinc-400 font-mono text-[10px]">
                        ({ret.saleNumber})
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        ret.status === 'APROBADA'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : ret.status === 'PENDIENTE_SUPERVISOR'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {ret.status === 'PENDIENTE_SUPERVISOR' ? 'Pendiente Supervisor' : ret.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-zinc-700">
                    <div>
                      <div className="font-semibold text-zinc-950">{ret.productName}</div>
                      <div className="text-[11px] text-zinc-500">
                        {ret.variantDesc} · Cant: {ret.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-zinc-950 tabular-nums">
                        {storeSettings.currency} {ret.refundAmount.toFixed(2)}
                      </span>
                      <div className="text-[10px] text-zinc-500">{ret.resolution}</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-600 bg-zinc-50 p-2 rounded border border-zinc-100">
                    Motivo: "{ret.reason}"
                  </div>

                  {ret.status === 'PENDIENTE_SUPERVISOR' && (
                    <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                      <span className="text-[11px] text-amber-900 font-medium">
                        Requiere visto bueno de jefatura
                      </span>
                      {isSupervisorOrAdmin ? (
                        <button
                          onClick={() => approveReturn(ret.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-xs"
                        >
                          Aprobar y Reintegrar
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-zinc-500">
                          Cambiar a Supervisor para aprobar
                        </span>
                      )}
                    </div>
                  )}

                  {ret.status === 'APROBADA' && (
                    <div className="text-[10px] text-zinc-400 flex justify-between pt-1">
                      <span>Procesado: {ret.processedBy}</span>
                      <span>Aprobado: {ret.approvedBy || 'Supervisor'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
