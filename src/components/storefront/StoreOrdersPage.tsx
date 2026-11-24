import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { OnlineOrderStatus } from '../../types';
import { PackageCheck, ArrowRight, User, Truck, Check } from 'lucide-react';

const ORDER_STEPS: { status: OnlineOrderStatus; label: string }[] = [
  { status: 'PENDIENTE', label: 'Recibido' },
  { status: 'CONFIRMADO', label: 'Confirmado' },
  { status: 'PREPARADO', label: 'Preparado' },
  { status: 'ENVIADO', label: 'En Camino' },
  { status: 'ENTREGADO', label: 'Entregado' },
];

export const StoreOrdersPage: React.FC = () => {
  const { currentUser, clients, onlineOrders, storeSettings, loginClient } = useApp();

  const isClient = currentUser !== null && currentUser.role === 'CLIENTE';

  if (!isClient) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h1 className="font-editorial text-2xl font-bold text-zinc-950">
            Inicia sesión para consultar tus pedidos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Por seguridad, el historial y rastreo de entregas está disponible únicamente para clientes autenticados.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/mi-cuenta"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition"
            >
              <span>Ir a Mi Cuenta</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => loginClient('cliente')}
              className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition"
            >
              Entrar como Gabriel Torres (Demo)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const matchedClient = clients.find(
    (c) => c.email.toLowerCase() === currentUser.email.toLowerCase()
  );

  const customerOrders = onlineOrders.filter(
    (o) =>
      o.clientEmail.toLowerCase() === currentUser.email.toLowerCase() ||
      (matchedClient && o.clientId === matchedClient.id)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">
            Seguimiento Omnicanal
          </div>
          <h1 className="font-editorial text-3xl font-bold text-zinc-950 mt-1">
            Mis Pedidos
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Estado logístico en tiempo real de tus compras en NOVAStyle.
          </p>
        </div>
        <Link
          to="/productos"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition self-start"
        >
          <span>Explorar Catálogo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {customerOrders.length === 0 ? (
        <div className="p-12 text-center bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
          <PackageCheck className="w-8 h-8 text-zinc-400 mx-auto" />
          <div className="text-sm font-bold text-zinc-900">Aún no tienes pedidos registrados</div>
          <p className="text-xs text-zinc-500">
            Cuando confirmes una compra en tu bolsa, aparecerá aquí con su progreso paso a paso.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {customerOrders.map((order) => {
            const currentStepIdx = ORDER_STEPS.findIndex((s) => s.status === order.status);
            const isCancelledOrReturned =
              order.status === 'CANCELADO' || order.status === 'DEVUELTO';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs"
              >
                <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-zinc-500">Pedido</span>
                      <div className="font-mono font-bold text-red-600 text-sm">
                        {order.orderNumber}
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-500">Fecha</span>
                      <div className="font-mono font-semibold text-zinc-900 tabular-nums">
                        {order.date}
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-500">Pago</span>
                      <div className="font-semibold text-zinc-900">{order.paymentMethod}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-zinc-500">Total</span>
                    <div className="font-mono font-extrabold text-zinc-950 text-base tabular-nums">
                      {storeSettings.currency} {order.total.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Live 5-Stage Progress Bar */}
                <div className="px-6 py-5 border-b border-zinc-100">
                  {isCancelledOrReturned ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                      <span>Estado actual: {order.status}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 gap-2">
                      {ORDER_STEPS.map((step, idx) => {
                        const completed = currentStepIdx >= idx;
                        return (
                          <div key={step.status} className="space-y-2">
                            <div
                              className={`h-1.5 rounded-full transition-colors ${
                                completed ? 'bg-red-600' : 'bg-zinc-200'
                              }`}
                            />
                            <div className="flex items-center gap-1 text-[11px] font-semibold">
                              {completed && <Check className="w-3 h-3 text-red-600 shrink-0" />}
                              <span className={completed ? 'text-zinc-950' : 'text-zinc-400'}>
                                {step.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {order.trackingCode && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-zinc-600">
                      <Truck className="w-3.5 h-3.5 text-red-600" />
                      <span>
                        Código de seguimiento:{' '}
                        <strong className="font-mono text-zinc-950">{order.trackingCode}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Order Line Items */}
                <div className="px-6 py-4 divide-y divide-zinc-100 text-xs">
                  {order.items.map((item) => (
                    <div key={item.variantId} className="py-2.5 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-zinc-950">{item.productName}</div>
                        <div className="text-zinc-500">
                          {item.variantDesc} · SKU <span className="font-mono">{item.sku}</span> · x{item.quantity}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-zinc-950 tabular-nums">
                        {storeSettings.currency} {item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 text-[11px] text-zinc-500">
                    Entrega en: <span className="font-semibold text-zinc-800">{order.deliveryAddress}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
