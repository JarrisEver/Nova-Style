import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  FileText,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  Truck,
} from 'lucide-react';
import { MovementType } from '../../types';

export const InventoryView: React.FC = () => {
  const {
    products,
    inventoryMovements,
    addManualInventoryMovement,
    setActiveView,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'STOCK' | 'KARDEX'>('STOCK');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [selectedMovementType, setSelectedMovementType] = useState<string>('TODOS');

  // Manual Movement Modal
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'TRANSFERENCIA'>('ENTRADA');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [movementQty, setMovementQty] = useState<number>(1);
  const [movementReason, setMovementReason] = useState<string>('');

  // Flattened stock list by variant
  const stockList = useMemo(() => {
    return products.flatMap((p) =>
      p.variants.map((v) => {
        let status: 'Disponible' | 'Stock bajo' | 'Agotado' = 'Disponible';
        if (v.stock === 0) status = 'Agotado';
        else if (v.stock <= v.minStock) status = 'Stock bajo';

        // Find last movement for this variant
        const lastMov = inventoryMovements.find((m) => m.variantId === v.id || m.sku === v.sku);

        return {
          productId: p.id,
          productName: p.name,
          code: p.code,
          category: p.category,
          variantId: v.id,
          variantDesc: `${v.size} / ${v.color}`,
          sku: v.sku,
          location: v.location || 'Almacén Central',
          stock: v.stock,
          minStock: v.minStock,
          status,
          lastMovement: lastMov
            ? `${lastMov.date} (${lastMov.type})`
            : 'Sin registro reciente',
        };
      })
    );
  }, [products, inventoryMovements]);

  // Filtered Stock list
  const filteredStockList = useMemo(() => {
    return stockList.filter((item) => {
      const matchSearch =
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variantDesc.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = selectedStatus === 'TODOS' || item.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [stockList, searchTerm, selectedStatus]);

  // Filtered Kardex list
  const filteredKardex = useMemo(() => {
    return inventoryMovements.filter((mov) => {
      const matchSearch =
        mov.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.userName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = selectedMovementType === 'TODOS' || mov.type === selectedMovementType;

      return matchSearch && matchType;
    });
  }, [inventoryMovements, searchTerm, selectedMovementType]);

  // Variants for selected product in modal
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const availableVariants = selectedProduct?.variants || [];

  const handleOpenMovementModal = (type: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'TRANSFERENCIA') => {
    setMovementType(type);
    if (products.length > 0) {
      setSelectedProductId(products[0].id);
      setSelectedVariantId(products[0].variants[0]?.id || '');
    }
    setMovementQty(1);
    setMovementReason('');
    setIsMovementModalOpen(true);
  };

  const handleConfirmManualMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedVariantId) {
      addToast('error', 'Selección incompleta', 'Seleccione un producto y su variante.');
      return;
    }

    if (movementQty <= 0) {
      addToast('error', 'Cantidad inválida', 'La cantidad debe ser mayor a cero.');
      return;
    }

    const res = addManualInventoryMovement({
      type: movementType,
      productId: selectedProductId,
      variantId: selectedVariantId,
      quantity: movementQty,
      reason: movementReason || `Movimiento manual de ${movementType}`,
    });

    if (res.success) {
      setIsMovementModalOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Control de Inventario & Kardex
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Seguimiento de existencias por variante en tiempo real y registro histórico de movimientos
          </p>
        </div>

        {/* Action Buttons for Movements */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenMovementModal('ENTRADA')}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Entrada</span>
          </button>

          <button
            onClick={() => handleOpenMovementModal('SALIDA')}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Salida</span>
          </button>

          <button
            onClick={() => handleOpenMovementModal('AJUSTE')}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Ajuste</span>
          </button>

          <button
            onClick={() => handleOpenMovementModal('TRANSFERENCIA')}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Transferencia</span>
          </button>

          <button
            onClick={() => setActiveView('purchases')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Recepción (OC)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('STOCK')}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'STOCK'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Existencias de Inventario</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px]">
            {stockList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('KARDEX')}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'KARDEX'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Libro Kardex de Movimientos</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px]">
            {inventoryMovements.length}
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por producto, SKU, variante o referencia..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {activeTab === 'STOCK' ? (
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Stock bajo">Stock Bajo</option>
            <option value="Agotado">Agotado</option>
          </select>
        ) : (
          <select
            value={selectedMovementType}
            onChange={(e) => setSelectedMovementType(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
          >
            <option value="TODOS">Todos los Tipos</option>
            <option value="VENTA">Ventas</option>
            <option value="RECEPCION">Recepciones de Compras</option>
            <option value="ENTRADA">Entradas Manuales</option>
            <option value="SALIDA">Salidas</option>
            <option value="AJUSTE">Ajustes</option>
            <option value="DEVOLUCION">Devoluciones</option>
            <option value="TRANSFERENCIA">Transferencias</option>
          </select>
        )}
      </div>

      {/* TAB CONTENT 1: Existencias */}
      {activeTab === 'STOCK' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">Variante (Talla / Color)</th>
                  <th className="px-3 py-3 font-semibold">SKU</th>
                  <th className="px-3 py-3 font-semibold">Ubicación</th>
                  <th className="px-3 py-3 font-semibold text-center">Stock Actual</th>
                  <th className="px-3 py-3 font-semibold text-center">Stock Mínimo</th>
                  <th className="px-3 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Último Movimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStockList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.code}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {item.variantDesc}
                    </td>
                    <td className="px-3 py-3 font-mono text-blue-700 font-bold">
                      {item.sku}
                    </td>
                    <td className="px-3 py-3 text-slate-500">{item.location}</td>
                    <td className="px-3 py-3 text-center font-bold text-sm">
                      <span
                        className={
                          item.stock === 0
                            ? 'text-rose-600'
                            : item.stock <= item.minStock
                            ? 'text-amber-600'
                            : 'text-slate-900'
                        }
                      >
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-slate-500">
                      {item.minStock}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'Disponible'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : item.status === 'Stock bajo'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {item.lastMovement}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Kardex */}
      {activeTab === 'KARDEX' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Fecha / Hora</th>
                  <th className="px-3 py-3 font-semibold">Tipo Movimiento</th>
                  <th className="px-4 py-3 font-semibold">Producto y Variante</th>
                  <th className="px-3 py-3 font-semibold">SKU</th>
                  <th className="px-3 py-3 font-semibold text-center">Cantidad</th>
                  <th className="px-3 py-3 font-semibold text-center">Previo</th>
                  <th className="px-3 py-3 font-semibold text-center">Nuevo</th>
                  <th className="px-3 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Referencia / Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredKardex.map((mov) => {
                  let badgeColor = 'bg-slate-100 text-slate-700';
                  if (mov.type === 'RECEPCION' || mov.type === 'ENTRADA') {
                    badgeColor = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                  } else if (mov.type === 'VENTA' || mov.type === 'SALIDA') {
                    badgeColor = 'bg-blue-100 text-blue-800 border border-blue-200';
                  } else if (mov.type === 'DEVOLUCION') {
                    badgeColor = 'bg-purple-100 text-purple-800 border border-purple-200';
                  } else if (mov.type === 'AJUSTE') {
                    badgeColor = 'bg-amber-100 text-amber-800 border border-amber-200';
                  }

                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {mov.date} {mov.time}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                          {mov.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{mov.productName}</div>
                        <div className="text-[10px] text-slate-400">{mov.variantDesc}</div>
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-slate-700">
                        {mov.sku}
                      </td>
                      <td className="px-3 py-3 text-center font-bold">
                        <span className={mov.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-slate-500">{mov.previousStock}</td>
                      <td className="px-3 py-3 text-center font-bold text-slate-900">{mov.newStock}</td>
                      <td className="px-3 py-3 text-slate-700 font-medium">{mov.userName}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-blue-700 font-mono text-[11px]">
                          {mov.reference}
                        </div>
                        {mov.reason && (
                          <div className="text-[10px] text-slate-500 line-clamp-1">{mov.reason}</div>
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

      {/* Manual Movement Modal */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Registrar Movimiento: {movementType}
              </h3>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmManualMovement} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Producto</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod && prod.variants.length > 0) {
                      setSelectedVariantId(prod.variants[0].id);
                    }
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Variante / SKU</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {availableVariants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.size} / {v.color} (Stock actual: {v.stock}) - {v.sku}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={movementQty}
                  onChange={(e) => setMovementQty(parseInt(e.target.value) || 1)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Motivo / Observaciones *</label>
                <textarea
                  rows={2}
                  required
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="Ej: Conteo cíclico, merma justificada, traslado entre almacenes..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm"
                >
                  Confirmar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
