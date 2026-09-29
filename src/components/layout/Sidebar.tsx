import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveView } from '../../types';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Truck,
  Building2,
  Users,
  Tag,
  Landmark,
  ShoppingBag,
  RotateCcw,
  BarChart3,
  UserCog,
  ShieldCheck,
  Settings,
  Sparkles,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeView,
    setActiveView,
    hasAccessToView,
    currentUser,
    cashRegister,
    products,
    onlineOrders,
    returns,
  } = useApp();

  // Metrics for badges
  const lowStockCount = products.reduce((acc, p) => {
    return acc + p.variants.filter((v) => v.stock <= v.minStock).length;
  }, 0);

  const pendingOrdersCount = onlineOrders.filter((o) => o.status === 'PENDIENTE').length;
  const pendingReturnsCount = returns.filter((r) => r.status === 'PENDIENTE_SUPERVISOR').length;

  const menuItems: {
    id: ActiveView;
    label: string;
    icon: React.ElementType;
    badge?: React.ReactNode;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Ventas / POS', icon: ShoppingCart },
    { id: 'products', label: 'Productos', icon: Package },
    {
      id: 'inventory',
      label: 'Inventario & Kardex',
      icon: Boxes,
      badge: lowStockCount > 0 ? (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {lowStockCount}
        </span>
      ) : null,
    },
    { id: 'purchases', label: 'Compras', icon: Truck },
    { id: 'suppliers', label: 'Proveedores', icon: Building2 },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'promotions', label: 'Promociones', icon: Tag },
    {
      id: 'cash-register',
      label: 'Caja',
      icon: Landmark,
      badge: (
        <span
          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${
            cashRegister.isOpen
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}
        >
          {cashRegister.isOpen ? 'ABIERTA' : 'CERRADA'}
        </span>
      ),
    },
    {
      id: 'online-orders',
      label: 'Pedidos Online',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
          {pendingOrdersCount}
        </span>
      ) : null,
    },
    {
      id: 'returns',
      label: 'Devoluciones',
      icon: RotateCcw,
      badge: pendingReturnsCount > 0 ? (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
          {pendingReturnsCount}
        </span>
      ) : null,
    },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'users', label: 'Usuarios & Roles', icon: UserCog },
    { id: 'audit', label: 'Auditoría', icon: ShieldCheck },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const filteredMenuItems = menuItems.filter((item) => hasAccessToView(item.id));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-900/50">
              <span className="text-white font-extrabold text-lg tracking-wider font-mono">NS</span>
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                NOVAStyle
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                NS-Management
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Role Indicator Pill */}
        <div className="px-4 py-3 bg-slate-950/20 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Perfil en sesión:</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 border border-blue-800/60 text-blue-300">
              {currentUser?.role || 'INVITADO'}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-1">
            Módulos del Sistema
          </div>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] text-slate-400 font-mono">Servidor POS Activo</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            v2.4.0 • Tienda Departamental
          </div>
        </div>
      </aside>
    </>
  );
};
