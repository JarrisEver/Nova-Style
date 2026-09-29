import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  UserCheck,
  ShieldAlert,
  Boxes,
  RotateCcw,
  CheckCircle2,
  Landmark,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const {
    currentUser,
    logout,
    switchRole,
    cashRegister,
    products,
    onlineOrders,
    returns,
    setActiveView,
    resetAllData,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications calculation
  const lowStockItems = products.flatMap((p) =>
    p.variants
      .filter((v) => v.stock <= v.minStock)
      .map((v) => ({ product: p.name, variant: `${v.size} / ${v.color}`, stock: v.stock, min: v.minStock }))
  );

  const pendingReturns = returns.filter((r) => r.status === 'PENDIENTE_SUPERVISOR');
  const pendingOrders = onlineOrders.filter((o) => o.status === 'PENDIENTE');

  const totalNotifications =
    lowStockItems.length + pendingReturns.length + pendingOrders.length + (!cashRegister.isOpen ? 1 : 0);

  const rolesList: { role: Role; label: string; desc: string }[] = [
    { role: 'ADMINISTRADOR', label: 'Administrador', desc: 'Acceso total y configuración' },
    { role: 'VENDEDOR', label: 'Vendedor', desc: 'POS, Clientes, Ventas, Promociones' },
    { role: 'CAJERO', label: 'Cajero', desc: 'Caja, Pagos, Comprobantes, Cierre' },
    { role: 'ALMACENERO', label: 'Almacenero', desc: 'Inventario, Recepción, Kardex' },
    { role: 'COMPRADOR', label: 'Comprador', desc: 'Proveedores, Órdenes de compra' },
    { role: 'SUPERVISOR', label: 'Supervisor', desc: 'Autorizaciones, Devoluciones, Auditoría' },
    { role: 'GERENCIA', label: 'Gerencia', desc: 'Dashboard, Reportes, Indicadores' },
    { role: 'CLIENTE', label: 'Cliente', desc: 'Catálogo y Pedidos' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar productos, clientes, comprobantes..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Cash Register status badge */}
        <button
          onClick={() => setActiveView('cash-register')}
          className={`hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
            cashRegister.isOpen
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
          }`}
          title="Ver módulo de Caja"
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Caja {cashRegister.isOpen ? 'Abierta' : 'Cerrada'}</span>
        </button>

        {/* Demo reset data */}
        <button
          onClick={() => {
            if (window.confirm('¿Desea restaurar los datos iniciales de demostración de NOVAStyle?')) {
              resetAllData();
            }
          }}
          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
          title="Restaurar datos iniciales de demostración"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleMenu(false);
            }}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Notificaciones del Sistema</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {totalNotifications} alertas
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                {!cashRegister.isOpen && (
                  <div
                    onClick={() => {
                      setActiveView('cash-register');
                      setShowNotifications(false);
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer flex items-start gap-2.5 text-rose-800"
                  >
                    <Landmark className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-rose-900">Caja cerrada</div>
                      <p className="text-[11px] text-slate-500">
                        Debe abrir la caja para ventas presenciales.
                      </p>
                    </div>
                  </div>
                )}

                {pendingReturns.map((ret) => (
                  <div
                    key={ret.id}
                    onClick={() => {
                      setActiveView('returns');
                      setShowNotifications(false);
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer flex items-start gap-2.5"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-800">Autorización pendiente</div>
                      <p className="text-[11px] text-slate-500">
                        Devolución {ret.returnNumber} por S/ {ret.refundAmount.toFixed(2)} requiere aprobación.
                      </p>
                    </div>
                  </div>
                ))}

                {pendingOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      setActiveView('online-orders');
                      setShowNotifications(false);
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-800">Nuevo pedido online</div>
                      <p className="text-[11px] text-slate-500">
                        {ord.orderNumber} de {ord.clientName} pendiente de confirmación.
                      </p>
                    </div>
                  </div>
                ))}

                {lowStockItems.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveView('inventory');
                      setShowNotifications(false);
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer flex items-start gap-2.5"
                  >
                    <Boxes className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-800">Stock bajo: {item.product}</div>
                      <p className="text-[11px] text-slate-500">
                        Variante {item.variant}: {item.stock} disponibles (Mínimo: {item.min}).
                      </p>
                    </div>
                  </div>
                ))}

                {totalNotifications === 0 && (
                  <div className="p-6 text-center text-slate-400">
                    No hay alertas pendientes en este momento.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Quick Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-left"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentUser?.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-200"
            />
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {currentUser?.name}
              </div>
              <div className="text-[10px] font-semibold text-blue-600">
                {currentUser?.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase text-slate-400">
                  Simular Rol de Usuario
                </span>
                <p className="text-[11px] text-slate-500">
                  Prueba permisos según caso de uso
                </p>
              </div>

              <div className="py-1">
                {rolesList.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      switchRole(item.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                      currentUser?.role === item.role ? 'bg-blue-50/70 font-semibold text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.desc}</div>
                    </div>
                    {currentUser?.role === item.role && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
