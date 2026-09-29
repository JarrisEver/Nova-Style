import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  Eye,
  MapPin,
  Phone,
  Mail,
  Clock,
  X,
  CheckCircle,
  Truck,
  RotateCcw,
  Ban,
  Package,
} from 'lucide-react';
import { OnlineOrder, OnlineOrderStatus } from '../../types';

export const OnlineOrdersView: React.FC = () => {
  const { onlineOrders, updateOrderStatus, storeSettings } = useApp();

  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);

  const columns: { status: OnlineOrderStatus; label: string; color: string; border: string }[] = [
    { status: 'PENDIENTE', label: 'Pendiente', color: 'bg-amber-500/10 text-amber-800', border: 'border-amber-200' },
    { status: 'CONFIRMADO', label: 'Confirmado', color: 'bg-blue-500/10 text-blue-800', border: 'border-blue-200' },
    { status: 'PREPARADO', label: 'Preparado', color: 'bg-indigo-500/10 text-indigo-800', border: 'border-indigo-200' },
    { status: 'ENVIADO', label: 'Enviado', color: 'bg-purple-500/10 text-purple-800', border: 'border-purple-200' },
    { status: 'ENTREGADO', label: 'Entregado', color: 'bg-emerald-500/10 text-emerald-800', border: 'border-emerald-200' },
    { status: 'CANCELADO', label: 'Cancelado', color: 'bg-slate-200 text-slate-700', border: 'border-slate-300' },
    { status: 'DEVUELTO', label: 'Devuelto', color: 'bg-rose-500/10 text-rose-800', border: 'border-rose-200' },
  ];

  // Next status transition mapper
  const getNextStatus = (current: OnlineOrderStatus): OnlineOrderStatus | null => {
    switch (current) {
      case 'PENDIENTE':
        return 'CONFIRMADO';
      case 'CONFIRMADO':
        return 'PREPARADO';
      case 'PREPARADO':
        return 'ENVIADO';
      case 'ENVIADO':
        return 'ENTREGADO';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Tablero Kanban de Pedidos Online (CU-09)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Flujo de despacho ecommerce: desde recepción de orden hasta entrega final al cliente
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          <ShoppingBag className="w-4 h-4 text-blue-600" />
          <span>Total en curso: {onlineOrders.length} pedidos</span>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 min-h-[600px] scrollbar-thin">
        {columns.map((col) => {
          const ordersInCol = onlineOrders.filter((o) => o.status === col.status);

          return (
            <div
              key={col.status}
              className="w-72 flex-shrink-0 flex flex-col bg-slate-100/70 border border-slate-200 rounded-2xl p-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.color}`}>
                    {col.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-600 font-mono">
                  {ordersInCol.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="flex-1 overflow-y-auto pt-3 space-y-3">
                {ordersInCol.map((order) => {
                  const nextStatus = getNextStatus(order.status);

                  return (
                    <div
                      key={order.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition space-y-2.5"
                    >
                      {/* Top Bar of card */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-700 font-mono">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {order.date.split(' ')[1] || order.date}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div>
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {order.clientName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{order.deliveryAddress}</span>
                        </div>
                      </div>

                      {/* Products preview */}
                      <div className="bg-slate-50 p-2 rounded-lg text-[11px] space-y-0.5 border border-slate-100">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700">
                            <span className="truncate max-w-[150px]">
                              {item.quantity}x {item.productName}
                            </span>
                            <span className="font-mono text-slate-500">
                              {storeSettings.currency} {item.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-[10px] text-blue-600 font-semibold pt-0.5">
                            +{order.items.length - 2} prenda(s) más
                          </div>
                        )}
                      </div>

                      {/* Price & Action footer */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <div>
                          <div className="text-[10px] text-slate-400">Total Pedido</div>
                          <div className="text-xs font-bold text-slate-900 font-mono">
                            {storeSettings.currency} {order.total.toFixed(2)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="Ver detalle"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {nextStatus && (
                            <button
                              onClick={() => updateOrderStatus(order.id, nextStatus)}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-xs transition"
                              title={`Avanzar a ${nextStatus}`}
                            >
                              <span>Avanzar</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {ordersInCol.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    Sin pedidos en esta fase
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Detalle del Pedido {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Fecha de registro: {selectedOrder.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Status and transition buttons */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Estado Actual
                  </span>
                  <div className="font-bold text-slate-900 text-sm">{selectedOrder.status}</div>
                </div>

                <div className="flex gap-1.5">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const newSt = e.target.value as OnlineOrderStatus;
                      updateOrderStatus(selectedOrder.id, newSt);
                      setSelectedOrder({ ...selectedOrder, status: newSt });
                    }}
                    className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    {columns.map((c) => (
                      <option key={c.status} value={c.status}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-1.5 border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-900 text-xs">Datos de Despacho</span>
                <div className="text-slate-700">
                  <strong className="text-slate-900">{selectedOrder.clientName}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedOrder.clientPhone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedOrder.clientEmail}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedOrder.deliveryAddress}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 text-xs">Prendas Compradas</span>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        <div className="text-[10px] text-slate-400">
                          {item.variantDesc} • Cantidad: {item.quantity}
                        </div>
                      </div>
                      <div className="font-bold font-mono text-slate-900">
                        {storeSettings.currency} {item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{storeSettings.currency} {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío a domicilio:</span>
                  <span>{storeSettings.currency} {selectedOrder.shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Pagado:</span>
                  <span className="text-blue-700">
                    {storeSettings.currency} {selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
