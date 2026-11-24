import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ModalShell, ModuleHeader } from '../ui/MotionPrimitives';
import {
  Boxes,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  FileText,
  Search,
  X,
  Truck,
} from 'lucide-react';

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

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'TRANSFERENCIA'>('ENTRADA');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [movementQty, setMovementQty] = useState<number>(1);
  const [movementReason, setMovementReason] = useState<string>('');

  const stockList = useMemo(() => {
    return products.flatMap((p) =>
      p.variants.map((v) => {
        let status: 'Disponible' | 'Stock bajo' | 'Agotado' = 'Disponible';
        if (v.stock === 0) status = 'Agotado';
        else if (v.stock <= v.minStock) status = 'Stock bajo';

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
      <ModuleHeader
        kicker="Logística & Trazabilidad"
        title="Control de Inventario & Kardex"
        subtitle="Seguimiento de existencias por variante en tiempo real y libro histórico de movimientos."
        actions={
          <>
            <button
              onClick={() => handleOpenMovementModal('ENTRADA')}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Entrada</span>
            </button>

            <button
              onClick={() => handleOpenMovementModal('SALIDA')}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Salida</span>
            </button>

            <button
              onClick={() => handleOpenMovementModal('AJUSTE')}
              className="px-3 py-2 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Ajuste</span>
            </button>

            <button
              onClick={() => handleOpenMovementModal('TRANSFERENCIA')}
              className="px-3 py-2 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Transferencia</span>
            </button>

            <button
              onClick={() => setActiveView('purchases')}
              className="px-3 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <Truck className="w-3.5 h-3.5 text-red-500" />
              <span>Recepción (OC)</span>
            </button>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('STOCK')}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'STOCK'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Existencias de Inventario</span>
          <span className="font-mono text-[11px] text-zinc-500 tabular-nums">({stockList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('KARDEX')}
          className={`px-5 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'KARDEX'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Libro Kardex</span>
          <span className="font-mono text-[11px] text-zinc-500 tabular-nums">
            ({inventoryMovements.length})
          </span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por producto, SKU, variante o referencia..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/15 focus:border-red-600"
          />
        </div>

        {activeTab === 'STOCK' ? (
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none text-zinc-800"
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
            className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none text-zinc-800"
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

      {/* TAB 1: Existencias */}
      {activeTab === 'STOCK' && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">Variante</th>
                  <th className="px-3 py-3 font-semibold">SKU</th>
                  <th className="px-3 py-3 font-semibold">Ubicación</th>
                  <th className="px-3 py-3 font-semibold text-center">Stock</th>
                  <th className="px-3 py-3 font-semibold text-center">Mínimo</th>
                  <th className="px-3 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Último Movimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {filteredStockList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-950">{item.productName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{item.code}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-800">{item.variantDesc}</td>
                    <td className="px-3 py-3 font-mono text-red-600 font-bold">{item.sku}</td>
                    <td className="px-3 py-3 text-zinc-500">{item.location}</td>
                    <td className="px-3 py-3 text-center font-bold font-mono text-sm tabular-nums">
                      <span
                        className={
                          item.stock === 0
                            ? 'text-red-600'
                            : item.stock <= item.minStock
                            ? 'text-amber-600'
                            : 'text-zinc-950'
                        }
                      >
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-zinc-500 tabular-nums">
                      {item.minStock}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          item.status === 'Disponible'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : item.status === 'Stock bajo'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 font-mono text-[11px]">{item.lastMovement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Kardex */}
      {activeTab === 'KARDEX' && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Fecha / Hora</th>
                  <th className="px-3 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Producto y Variante</th>
                  <th className="px-3 py-3 font-semibold">SKU</th>
                  <th className="px-3 py-3 font-semibold text-center">Cant.</th>
                  <th className="px-3 py-3 font-semibold text-center">Previo</th>
                  <th className="px-3 py-3 font-semibold text-center">Nuevo</th>
                  <th className="px-3 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Referencia / Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {filteredKardex.map((mov) => {
                  let badgeColor = 'bg-zinc-100 text-zinc-700 border-zinc-200';
                  if (mov.type === 'RECEPCION' || mov.type === 'ENTRADA') {
                    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  } else if (mov.type === 'VENTA' || mov.type === 'SALIDA') {
                    badgeColor = 'bg-zinc-950 text-white border-zinc-900';
                  } else if (mov.type === 'DEVOLUCION') {
                    badgeColor = 'bg-red-50 text-red-700 border-red-200';
                  } else if (mov.type === 'AJUSTE') {
                    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                  }

                  return (
                    <tr key={mov.id} className="hover:bg-zinc-50 transition">
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-zinc-600 tabular-nums">
                        {mov.date} {mov.time}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                          {mov.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-zinc-950">{mov.productName}</div>
                        <div className="text-[10px] text-zinc-400">{mov.variantDesc}</div>
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-zinc-800">{mov.sku}</td>
                      <td className="px-3 py-3 text-center font-bold font-mono tabular-nums">
                        <span className={mov.quantity > 0 ? 'text-emerald-700' : 'text-red-600'}>
                          {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-mono text-zinc-500 tabular-nums">
                        {mov.previousStock}
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-zinc-950 tabular-nums">
                        {mov.newStock}
                      </td>
                      <td className="px-3 py-3 text-zinc-700 font-medium">{mov.userName}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-red-600 font-mono text-[11px]">
                          {mov.reference}
                        </div>
                        {mov.reason && (
                          <div className="text-[10px] text-zinc-500 line-clamp-1">{mov.reason}</div>
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
      <ModalShell
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        maxWidthClass="max-w-md"
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
          <h3 className="text-sm font-bold">Registrar Movimiento: {movementType}</h3>
          <button
            onClick={() => setIsMovementModalOpen(false)}
            className="text-zinc-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirmManualMovement} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Producto</label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const prod = products.find((p) => p.id === e.target.value);
                if (prod && prod.variants.length > 0) {
                  setSelectedVariantId(prod.variants[0].id);
                }
              }}
              className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Variante / SKU</label>
            <select
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg"
            >
              {availableVariants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.size} / {v.color} (Stock: {v.stock}) · {v.sku}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Cantidad *</label>
            <input
              type="number"
              min="1"
              required
              value={movementQty}
              onChange={(e) => setMovementQty(parseInt(e.target.value) || 1)}
              className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Motivo / Observaciones *</label>
            <textarea
              rows={2}
              required
              value={movementReason}
              onChange={(e) => setMovementReason(e.target.value)}
              placeholder="Ej: Conteo cíclico, merma justificada, traslado..."
              className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => setIsMovementModalOpen(false)}
              className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg font-semibold hover:bg-zinc-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
            >
              Confirmar Movimiento
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
};
