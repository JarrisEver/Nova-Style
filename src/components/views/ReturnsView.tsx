import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RotateCcw,
  Search,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Clock,
  UserCheck,
  X,
  FileText,
} from 'lucide-react';
import { ReturnRecord, Sale, SaleItem } from '../../types';

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

  // Return Form State
  const [selectedItemVariantId, setSelectedItemVariantId] = useState<string>('');
  const [returnQuantity, setReturnQuantity] = useState<number>(1);
  const [returnReason, setReturnReason] = useState<string>('Talla inadecuada / cambio de modelo');
  const [returnResolution, setReturnResolution] = useState<'CAMBIO' | 'DEVOLUCION_EFECTIVO' | 'NOTA_CREDITO'>('CAMBIO');

  // Search matching sales
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

  // Selected item in sale
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
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Devoluciones, Cambios & Notas de Crédito (CU-06)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de cambios de mercadería con validación de venta de origen y reintegro al Kardex
          </p>
        </div>
      </div>

      {/* Grid: Left for Initiating return, Right for pending approvals / History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Search sale & Register Return */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Search className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase">
              1. Buscar Venta de Origen (Regla #3)
            </h2>
          </div>

          <div className="relative">
            <input
              type="text"
              value={saleSearchQuery}
              onChange={(e) => setSaleSearchQuery(e.target.value)}
              placeholder="Buscar por N° comprobante (ej: B001-000411) o DNI cliente..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick matched list */}
          {matchedSales.length > 0 && !selectedSale && (
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {matchedSales.map((sale) => (
                <div
                  key={sale.id}
                  onClick={() => handleSelectSale(sale)}
                  className="p-2.5 hover:bg-blue-50/60 cursor-pointer transition flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold font-mono text-blue-700">{sale.saleNumber}</span>
                    <span className="text-slate-500 text-[11px] ml-2">{sale.date}</span>
                    <div className="text-slate-800 font-medium">{sale.clientName}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-mono">
                      {storeSettings.currency} {sale.total.toFixed(2)}
                    </span>
                    <div className="text-[10px] text-blue-600 font-semibold flex items-center gap-0.5 justify-end">
                      <span>Seleccionar</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Sale Preview & Return Form */}
          {selectedSale ? (
            <form onSubmit={handleProcessReturnSubmit} className="space-y-4 pt-2 border-t border-slate-100 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-700 font-bold uppercase">
                    Comprobante Seleccionado
                  </span>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {selectedSale.saleNumber}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {selectedSale.clientName} ({selectedSale.clientDocType}: {selectedSale.clientDoc}) • Total: {storeSettings.currency} {selectedSale.total.toFixed(2)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSale(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Select Item */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Producto a Devolver *
                </label>
                <select
                  value={selectedItemVariantId}
                  onChange={(e) => {
                    setSelectedItemVariantId(e.target.value);
                    setReturnQuantity(1);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  {selectedSale.items.map((item) => (
                    <option key={item.variantId} value={item.variantId}>
                      {item.productName} ({item.variantDesc}) - Comprados: {item.quantity} unid. - P.Unit: {storeSettings.currency} {item.unitPrice.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cantidad a Devolver (Máx: {maxReturnQty})
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
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipo de Resolución
                  </label>
                  <select
                    value={returnResolution}
                    onChange={(e) => setReturnResolution(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="CAMBIO">Cambio por otra prenda</option>
                    <option value="NOTA_CREDITO">Emisión de Nota de Crédito</option>
                    <option value="DEVOLUCION_EFECTIVO">Reembolso en Efectivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Motivo de la Devolución *
                </label>
                <input
                  type="text"
                  required
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Ej: Falla de costura, cambio de talla, disconformidad..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              {/* Supervisor warning notice if > S/ 200 */}
              {estimatedRefund > 200 && !isSupervisorOrAdmin && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Requiere Autorización de Supervisor (Regla #6)</div>
                    <p className="text-[11px] mt-0.5">
                      El monto (S/ {estimatedRefund.toFixed(2)}) supera S/ 200.00. Quedará en estado &ldquo;Pendiente de aprobación&rdquo;.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-bold">
                <span>Monto a Reintegrar:</span>
                <span className="text-base text-blue-700 font-mono">
                  {storeSettings.currency} {estimatedRefund.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Registrar Solicitud de Devolución</span>
              </button>
            </form>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
              Ingrese un N° de comprobante arriba o busque un cliente para cargar la venta.
            </div>
          )}
        </div>

        {/* Right Section: Pending approvals & Return Records */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-900 uppercase">
                2. Historial de Devoluciones & Aprobaciones
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {returns.length} registros
              </span>
            </div>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {returns.map((ret) => (
                <div
                  key={ret.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 transition ${
                    ret.status === 'PENDIENTE_SUPERVISOR'
                      ? 'border-amber-300 bg-amber-50/50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-700 font-mono">
                        {ret.returnNumber}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        (Venta {ret.saleNumber})
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ret.status === 'APROBADA'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ret.status === 'PENDIENTE_SUPERVISOR'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ret.status === 'PENDIENTE_SUPERVISOR'
                        ? 'Pendiente de Supervisor'
                        : ret.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-700">
                    <div>
                      <div className="font-semibold text-slate-900">{ret.productName}</div>
                      <div className="text-[11px] text-slate-500">
                        {ret.variantDesc} • Cantidad: {ret.quantity} unid.
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900">
                        {storeSettings.currency} {ret.refundAmount.toFixed(2)}
                      </span>
                      <div className="text-[10px] text-slate-500">{ret.resolution}</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 italic bg-white/70 p-1.5 rounded border border-slate-100">
                    Motivo: &ldquo;{ret.reason}&rdquo;
                  </div>

                  {/* Supervisor action bar if pending */}
                  {ret.status === 'PENDIENTE_SUPERVISOR' && (
                    <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                      <span className="text-[11px] text-amber-900 font-medium">
                        Requiere visto bueno de jefatura
                      </span>
                      {isSupervisorOrAdmin ? (
                        <button
                          onClick={() => approveReturn(ret.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs"
                        >
                          ✓ Aprobar y Reintegrar Stock
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500">
                          (Cambiar a rol Supervisor para aprobar)
                        </span>
                      )}
                    </div>
                  )}

                  {ret.status === 'APROBADA' && (
                    <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                      <span>Procesado por: {ret.processedBy}</span>
                      <span>Aprobado por: {ret.approvedBy || 'Supervisor'}</span>
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
