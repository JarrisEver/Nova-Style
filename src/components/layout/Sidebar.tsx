import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { ActiveView } from '../../types';
import { BrandLogo } from '../ui/BrandLogo';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderTree,
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
  ChevronRight,
  Store,
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
  const shouldReduceMotion = useReducedMotion();

  const lowStockCount = products.reduce((acc, p) => {
    return acc + p.variants.filter((v) => v.stock <= v.minStock).length;
  }, 0);

  const pendingOrdersCount = onlineOrders.filter((o) => o.status === 'PENDIENTE').length;
  const pendingReturnsCount = returns.filter((r) => r.status === 'PENDIENTE_SUPERVISOR').length;

  const menuItems: {
    id: ActiveView;
    label: string;
    icon: React.ElementType;
    counter?: string;
    counterTone?: 'amber' | 'crimson' | 'emerald' | 'neutral';
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Ventas / POS', icon: ShoppingCart },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'categories', label: 'Categorías', icon: FolderTree },
    {
      id: 'inventory',
      label: 'Inventario & Kardex',
      icon: Boxes,
      counter: lowStockCount > 0 ? String(lowStockCount) : undefined,
      counterTone: 'amber',
    },
    { id: 'purchases', label: 'Compras', icon: Truck },
    { id: 'suppliers', label: 'Proveedores', icon: Building2 },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'promotions', label: 'Promociones', icon: Tag },
    {
      id: 'cash-register',
      label: 'Caja',
      icon: Landmark,
      counter: cashRegister.isOpen ? 'ON' : 'OFF',
      counterTone: cashRegister.isOpen ? 'emerald' : 'crimson',
    },
    {
      id: 'online-orders',
      label: 'Pedidos Online',
      icon: ShoppingBag,
      counter: pendingOrdersCount > 0 ? String(pendingOrdersCount) : undefined,
      counterTone: 'neutral',
    },
    {
      id: 'returns',
      label: 'Devoluciones',
      icon: RotateCcw,
      counter: pendingReturnsCount > 0 ? String(pendingReturnsCount) : undefined,
      counterTone: 'crimson',
    },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'users', label: 'Usuarios & Roles', icon: UserCog },
    { id: 'audit', label: 'Auditoría', icon: ShieldCheck },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const filteredMenuItems = menuItems.filter((item) => hasAccessToView(item.id));

  const getCounterStyle = (tone: 'amber' | 'crimson' | 'emerald' | 'neutral' | undefined, isActive: boolean) => {
    if (isActive) {
      return 'bg-white/15 text-white border-white/25';
    }
    switch (tone) {
      case 'amber':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'crimson':
        return 'bg-red-600/20 text-red-300 border-red-500/35';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-zinc-950/75 backdrop-blur-xs lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-800/90 text-zinc-200 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Subtle top crimson accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-red-600 via-red-500 to-zinc-900 shrink-0" />

        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800/80 bg-zinc-950 shrink-0">
          <button
            onClick={() => {
              setActiveView('dashboard');
              onClose();
            }}
            className="text-left focus:outline-none"
          >
            <BrandLogo variant="light" size="md" showSubtitle />
          </button>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Session Profile Strip (Clean typographic metadata, zero pill clutter) */}
        <div className="px-4 py-3 border-b border-zinc-800/70 bg-zinc-900/50 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] font-medium text-zinc-400 whitespace-nowrap">
            Perfil activo
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 font-mono truncate">
            {currentUser?.role || 'INVITADO'}
          </span>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500 px-3 pb-2">
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
                className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white font-semibold shadow-[0_8px_20px_-6px_rgba(220,38,38,0.55)]'
                    : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-red-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.counter && (
                    <span
                      className={`text-[10px] font-mono font-bold tabular-nums px-1.5 py-0.5 rounded border ${getCounterStyle(
                        item.counterTone,
                        isActive
                      )}`}
                    >
                      {item.counter}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-red-100 shrink-0" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Corporate Footer & Storefront Link */}
        <div className="px-4 py-3.5 border-t border-zinc-800/80 bg-zinc-950 text-xs shrink-0 space-y-2.5">
          <Link
            to="/"
            onClick={onClose}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white transition text-xs font-semibold"
          >
            <span className="inline-flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-red-500" />
              <span>Ir a Tienda Online</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </Link>
          <div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>NS-Management</span>
              <span className="text-zinc-500">v2.5</span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
              Sede San Isidro · Omnicanal
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
