import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Role, ActiveView } from '../../types';
import { resolveSafeAvatarUrl } from '../../assets/media';
import { Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Boxes,
  RotateCcw,
  CheckCircle2,
  Landmark,
  RefreshCw,
  Package,
  Users,
  ArrowRight,
  Check,
  Store,
  X,
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
    clients,
    onlineOrders,
    returns,
    setActiveView,
    hasAccessToView,
    resetAllData,
  } = useApp();

  const shouldReduceMotion = useReducedMotion();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  ];

  const moduleShortcuts: { id: ActiveView; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard Gerencial' },
    { id: 'pos', label: 'Punto de Venta (POS)' },
    { id: 'products', label: 'Catálogo de Productos' },
    { id: 'categories', label: 'Categorías' },
    { id: 'inventory', label: 'Inventario & Kardex' },
    { id: 'purchases', label: 'Compras & Recepciones' },
    { id: 'suppliers', label: 'Proveedores' },
    { id: 'clients', label: 'Clientes' },
    { id: 'promotions', label: 'Promociones' },
    { id: 'cash-register', label: 'Caja & Arqueo' },
    { id: 'online-orders', label: 'Pedidos Online' },
    { id: 'returns', label: 'Devoluciones & Cambios' },
    { id: 'reports', label: 'Reportes & Analítica' },
    { id: 'users', label: 'Usuarios & Roles' },
    { id: 'audit', label: 'Auditoría' },
    { id: 'settings', label: 'Configuración' },
  ];

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { modules: [], products: [], clients: [] };

    return {
      modules: moduleShortcuts
        .filter((m) => hasAccessToView(m.id) && m.label.toLowerCase().includes(q))
        .slice(0, 3),
      products: products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.variants.some((v) => v.sku.toLowerCase().includes(q))
        )
        .slice(0, 4),
      clients: clients
        .filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.document.includes(q)
        )
        .slice(0, 3),
    };
  }, [searchQuery, products, clients, hasAccessToView]);

  const hasSearchResults =
    searchResults.modules.length > 0 ||
    searchResults.products.length > 0 ||
    searchResults.clients.length > 0;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-zinc-200 px-4 lg:px-6 flex items-center justify-between gap-3">
      {/* Left: Mobile menu button + Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          aria-label="Abrir menú lateral"
          className="p-2 -ml-2 rounded-lg text-zinc-700 hover:bg-zinc-100 lg:hidden transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div ref={searchContainerRef} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            placeholder="Buscar productos, SKU, clientes o módulos..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/15 focus:border-red-600 transition placeholder:text-zinc-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Search Results Popover */}
          <AnimatePresence>
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden"
              >
                {!hasSearchResults ? (
                  <div className="p-4 text-xs text-zinc-500 text-center">
                    Sin coincidencias para "{searchQuery}".
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100">
                    {searchResults.modules.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          Módulos
                        </div>
                        {searchResults.modules.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setActiveView(m.id);
                              setIsSearchFocused(false);
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-zinc-800 hover:bg-zinc-50 rounded-lg transition-colors"
                          >
                            <span className="font-medium">{m.label}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.products.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          Catálogo & SKUs
                        </div>
                        {searchResults.products.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setActiveView(hasAccessToView('products') ? 'products' : 'pos');
                              setIsSearchFocused(false);
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-zinc-800 hover:bg-zinc-50 rounded-lg transition-colors text-left"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Package className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <div className="truncate">
                                <span className="font-semibold text-zinc-900">{p.name}</span>
                                <span className="ml-2 text-[10px] font-mono text-zinc-500">{p.code}</span>
                              </div>
                            </div>
                            <span className="font-mono font-semibold text-zinc-900 tabular-nums shrink-0 ml-2">
                              S/ {p.price.toFixed(2)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.clients.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          Clientes
                        </div>
                        {searchResults.clients.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setActiveView(hasAccessToView('clients') ? 'clients' : 'pos');
                              setIsSearchFocused(false);
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-zinc-800 hover:bg-zinc-50 rounded-lg transition-colors text-left"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span className="font-medium truncate">{c.name}</span>
                            </div>
                            <span className="font-mono text-[11px] text-zinc-500 tabular-nums shrink-0 ml-2">
                              {c.document}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Ver Tienda Online Link */}
        <Link
          to="/"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 text-xs font-semibold text-zinc-800 transition whitespace-nowrap shrink-0"
          title="Abrir Tienda Online Pública"
        >
          <Store className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span>Ver Tienda</span>
        </Link>

        {/* Cash Register Status Button */}
        <button
          onClick={() => setActiveView('cash-register')}
          className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition whitespace-nowrap shrink-0 ${
            cashRegister.isOpen
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
          }`}
          title="Ver módulo de Caja"
        >
          <Landmark className="w-3.5 h-3.5 shrink-0" />
          <span>Caja {cashRegister.isOpen ? 'Abierta' : 'Cerrada'}</span>
        </button>

        {/* Demo Reset Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setShowResetConfirm(!showResetConfirm);
              setShowNotifications(false);
              setShowRoleMenu(false);
            }}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition"
            title="Restaurar datos iniciales de demostración"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showResetConfirm && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-zinc-200 p-3.5 z-50"
              >
                <div className="text-xs font-bold text-zinc-950">Restaurar entorno demo</div>
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                  Reinicia inventario, ventas, caja y bitácora a su estado inicial.
                </p>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2.5 py-1.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      resetAllData();
                      setShowResetConfirm(false);
                    }}
                    className="px-2.5 py-1.5 text-[11px] font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg transition"
                  >
                    Restaurar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleMenu(false);
              setShowResetConfirm(false);
            }}
            aria-label="Notificaciones"
            className="relative p-2 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-md bg-red-600 text-white text-[9px] font-mono font-bold tabular-nums flex items-center justify-center ring-2 ring-white">
                {totalNotifications}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-zinc-200 py-3 z-50"
              >
                <div className="px-4 pb-2.5 border-b border-zinc-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-950">Alertas Operativas</span>
                  <span className="text-[11px] font-mono font-semibold text-red-600 tabular-nums">
                    {totalNotifications} pendientes
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 text-xs">
                  {!cashRegister.isOpen && (
                    <div
                      onClick={() => {
                        setActiveView('cash-register');
                        setShowNotifications(false);
                      }}
                      className="p-3 hover:bg-zinc-50 cursor-pointer flex items-start gap-2.5"
                    >
                      <Landmark className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-zinc-950">Caja cerrada</div>
                        <p className="text-[11px] text-zinc-500">
                          Abra la caja para habilitar ventas presenciales.
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
                      className="p-3 hover:bg-zinc-50 cursor-pointer flex items-start gap-2.5"
                    >
                      <RotateCcw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-zinc-900">Autorización pendiente</div>
                        <p className="text-[11px] text-zinc-500">
                          {ret.returnNumber} · S/ {ret.refundAmount.toFixed(2)} requiere supervisión.
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
                      className="p-3 hover:bg-zinc-50 cursor-pointer flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-zinc-800 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-zinc-900">Nuevo pedido online</div>
                        <p className="text-[11px] text-zinc-500">
                          {ord.orderNumber} de {ord.clientName} por confirmar.
                        </p>
                      </div>
                    </div>
                  ))}

                  {lowStockItems.slice(0, 4).map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveView('inventory');
                        setShowNotifications(false);
                      }}
                      className="p-3 hover:bg-zinc-50 cursor-pointer flex items-start gap-2.5"
                    >
                      <Boxes className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-zinc-900">Stock bajo · {item.product}</div>
                        <p className="text-[11px] text-zinc-500 tabular-nums">
                          {item.variant}: {item.stock} u. (Mín: {item.min})
                        </p>
                      </div>
                    </div>
                  ))}

                  {totalNotifications === 0 && (
                    <div className="p-6 text-center text-zinc-400">
                      Operación sin alertas pendientes.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User & Role Quick Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifications(false);
              setShowResetConfirm(false);
            }}
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition text-left whitespace-nowrap shrink-0"
          >
            <img
              src={resolveSafeAvatarUrl(currentUser?.avatar)}
              alt={currentUser?.name || 'Usuario'}
              className="w-7 h-7 rounded-md object-cover border border-zinc-200 shrink-0"
            />
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-zinc-950 leading-tight">
                {currentUser?.name}
              </div>
              <div className="text-[10px] font-bold tracking-wider uppercase text-red-600 leading-tight">
                {currentUser?.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          </button>

          <AnimatePresence>
            {showRoleMenu && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-zinc-200 py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-zinc-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Cambiar Perfil Operativo
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Matriz de acceso por rol RBAC
                  </p>
                </div>

                <div className="py-1 max-h-72 overflow-y-auto">
                  {rolesList.map((item) => {
                    const isCurrent = currentUser?.role === item.role;
                    return (
                      <button
                        key={item.role}
                        onClick={() => {
                          switchRole(item.role);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition ${
                          isCurrent ? 'bg-red-50/70 text-red-700 font-semibold' : 'text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-[10px] text-zinc-400">{item.desc}</div>
                        </div>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-zinc-100 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
