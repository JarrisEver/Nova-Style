import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ModalShell, ModuleHeader } from '../ui/MotionPrimitives';
import {
  ShoppingBag,
  ChevronRight,
  Eye,
  MapPin,
  Phone,
  Mail,
  Clock,
  X,
} from 'lucide-react';
import { OnlineOrder, OnlineOrderStatus } from '../../types';

export const OnlineOrdersView: React.FC = () => {
  const { onlineOrders, updateOrderStatus, storeSettings } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);

  const columns: { status: OnlineOrderStatus; label: string; badge: string }[] = [
    { status: 'PENDIENTE', label: 'Pendiente', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
    { status: 'CONFIRMADO', label: 'Confirmado', badge: 'bg-zinc-950 text-white border-zinc-900' },
    { status: 'PREPARADO', label: 'Preparado', badge: 'bg-zinc-800 text-white border-zinc-700' },
    { status: 'ENVIADO', label: 'Enviado', badge: 'bg-zinc-700 text-white border-zinc-600' },
    { status: 'ENTREGADO', label: 'Entregado', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { status: 'CANCELADO', label: 'Cancelado', badge: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
    { status: 'DEVUELTO', label: 'Devuelto', badge: 'bg-red-50 text-red-700 border-red-200' },
  ];

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
      <ModuleHeader
        kicker="Ecommerce & Despacho · CU-09"
        title="Tablero Kanban de Pedidos Online"
        subtitle="Seguimiento operativo desde la recepción web hasta la entrega al cliente final."
        actions={
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-800 bg-white px-3.5 py-2 rounded-lg border border-zinc-200 font-mono tabular-nums">
            <ShoppingBag className="w-4 h-4 text-red-600" />
            <span>{onlineOrders.length} pedidos</span>
          </div>
        }
      />

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 min-h-[580px]">
        {columns.map((col) => {
          const ordersInCol = onlineOrders.filter((o) => o.status === col.status);

          return (
            <div
              key={col.status}
              className="w-72 shrink-0 flex flex-col bg-zinc-200/60 border border-zinc-200 rounded-xl p-3"
            >
              <div className="flex items-center justify-between pb-3 px-1 border-b border-zinc-300/70">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${col.badge}`}>
                  {col.label}
                </span>
                <span className="text-xs font-bold text-zinc-700 font-mono tabular-nums">
                  {ordersInCol.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto pt-3 space-y-3">
                {ordersInCol.map((order) => {
                  const nextStatus = getNextStatus(order.status);

                  return (
                    <div
                      key={order.id}
                      className="bg-white p-3.5 rounded-xl border border-zinc-200 hover:border-red-500/70 hover:-translate-y-0.5 hover:shadow-md transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-600 font-mono">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 tabular-nums">
                          <Clock className="w-3 h-3" />
                          {order.date.split(' ')[1] || order.date}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-zinc-950 truncate">
                          {order.clientName}
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-1 truncate mt-0.5">
                          <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">{order.deliveryAddress}</span>
                        </div>
                      </div>

                      <div className="bg-zinc-50 p-2 rounded-lg text-[11px] space-y-0.5 border border-zinc-100">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-zinc-700">
                            <span className="truncate max-w-[145px]">
                              {item.quantity}x {item.productName}
                            </span>
                            <span className="font-mono text-zinc-500 tabular-nums">
                              {storeSettings.currency} {item.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-[10px] text-red-600 font-semibold pt-0.5">
                            +{order.items.length - 2} prenda(s) más
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                        <div>
                          <div className="text-[10px] text-zinc-400">Total</div>
                          <div className="text-xs font-bold text-zinc-950 font-mono tabular-nums">
                            {storeSettings.currency} {order.total.toFixed(2)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition"
                            title="Ver detalle"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {nextStatus && (
                            <button
                              onClick={() => updateOrderStatus(order.id, nextStatus)}
                              className="px-2.5 py-1 bg-zinc-950 hover:bg-red-600 text-white text-[10px] font-bold rounded-md flex items-center gap-1 transition"
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
                  <div className="py-12 text-center text-zinc-400 text-xs">
                    Sin pedidos en esta fase
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Detail Modal */}
      <ModalShell
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        maxWidthClass="max-w-lg"
      >
        {selectedOrder && (
          <div>
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
              <div>
                <h3 className="text-sm font-bold">Pedido {selectedOrder.orderNumber}</h3>
                <p className="text-[11px] text-zinc-400 font-mono">{selectedOrder.date}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                    Estado Actual
                  </span>
                  <div className="font-bold text-zinc-950 text-sm">{selectedOrder.status}</div>
                </div>

                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    const newSt = e.target.value as OnlineOrderStatus;
                    updateOrderStatus(selectedOrder.id, newSt);
                    setSelectedOrder({ ...selectedOrder, status: newSt });
                  }}
                  className="p-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-semibold"
                >
                  {columns.map((c) => (
                    <option key={c.status} value={c.status}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 border-b border-zinc-100 pb-3">
                <span className="font-bold text-zinc-950 text-xs">Datos de Despacho</span>
                <div className="font-semibold text-zinc-900">{selectedOrder.clientName}</div>
                <div className="flex items-center gap-1.5 text-zinc-600 font-mono">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{selectedOrder.clientPhone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-600">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{selectedOrder.clientEmail}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-600">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{selectedOrder.deliveryAddress}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-zinc-950 text-xs">Prendas Compradas</span>
                <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-zinc-950">{item.productName}</div>
                        <div className="text-[10px] text-zinc-500">
                          {item.variantDesc} · Cantidad: {item.quantity}
                        </div>
                      </div>
                      <div className="font-bold font-mono text-zinc-950 tabular-nums">
                        {storeSettings.currency} {item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1 font-mono tabular-nums">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal:</span>
                  <span>{storeSettings.currency} {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Envío a domicilio:</span>
                  <span>{storeSettings.currency} {selectedOrder.shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-950 pt-1 border-t border-zinc-200">
                  <span>Total Pagado:</span>
                  <span className="text-red-600">
                    {storeSettings.currency} {selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg font-semibold hover:bg-zinc-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalShell>
    </div>
  );
};
