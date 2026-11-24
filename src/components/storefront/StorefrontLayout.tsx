import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../ui/BrandLogo';
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ArrowRight,
  PackageCheck,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';

export const StorefrontLayout: React.FC = () => {
  const { cart, currentUser, hasAdminAccess, storeSettings } = useApp();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isClientSignedIn = currentUser !== null && currentUser.role === 'CLIENTE';

  const navLinks = [
    { to: '/', label: 'Inicio', end: true },
    { to: '/productos', label: 'Catálogo' },
    { to: '/categorias', label: 'Categorías' },
    { to: '/promociones', label: 'Promociones' },
    { to: '/contacto', label: 'Contacto' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    setSearchOpen(false);
    setMobileMenuOpen(false);
    navigate(q ? `/productos?q=${encodeURIComponent(q)}` : '/productos');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-950">
      {/* Subtle Top Promo Ribbon */}
      <div className="bg-zinc-950 text-zinc-200 text-[11px] py-2 px-4 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <span className="truncate font-medium">
            Envío gratis a Lima Metropolitana en compras desde{' '}
            <strong className="text-white font-mono">{storeSettings.currency} 299.00</strong>
          </span>
          <div className="hidden sm:flex items-center gap-4 shrink-0 text-zinc-400">
            <Link to="/promociones" className="hover:text-white transition whitespace-nowrap">
              Código <span className="text-red-500 font-mono font-bold">BIENVENIDO10</span> (-10%)
            </Link>
            <span>·</span>
            <Link to="/mis-pedidos" className="hover:text-white transition whitespace-nowrap">
              Seguimiento de pedidos
            </Link>
          </div>
        </div>
      </div>

      {/* 3-Zone Editorial Top Bar */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
              className="p-2 -ml-2 rounded-lg text-zinc-800 hover:bg-zinc-100 lg:hidden transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="focus:outline-none">
              <BrandLogo variant="dark" size="sm" showSubtitle={false} />
            </Link>
          </div>

          {/* Zone 2: Center Editorial Navigation */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Navegación principal">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `relative py-1 text-xs font-semibold uppercase tracking-[0.12em] whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'text-red-600'
                      : 'text-zinc-700 hover:text-zinc-950'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="storefront-nav-underline"
                        className="absolute inset-x-0 -bottom-1 h-0.5 bg-red-600"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Right Utility Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Buscar prendas"
              className="p-2 rounded-lg text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition whitespace-nowrap shrink-0"
            >
              <Search className="w-4 h-4" />
            </button>

            {isClientSignedIn && (
              <Link
                to="/mis-pedidos"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition whitespace-nowrap shrink-0"
              >
                <PackageCheck className="w-4 h-4 text-red-600" />
                <span>Mis Pedidos</span>
              </Link>
            )}

            <Link
              to="/mi-cuenta"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-800 hover:bg-zinc-100 transition whitespace-nowrap shrink-0"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isClientSignedIn ? currentUser.name.split(' ')[0] : 'Mi Cuenta'}
              </span>
            </Link>

            <Link
              to="/carrito"
              className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-red-600 text-white text-xs font-bold transition whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bolsa</span>
              <span className="font-mono tabular-nums text-[11px] bg-white/15 px-1.5 py-0.5 rounded">
                {totalCartItems}
              </span>
            </Link>
          </div>
        </div>

        {/* Expandable Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
              className="border-b border-zinc-200 bg-white px-4 sm:px-6 lg:px-8 py-3 shadow-lg"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="max-w-3xl mx-auto flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Buscar camisas, vestidos, zapatillas, marcas..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-600"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition whitespace-nowrap"
                >
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Cerrar buscador"
                  className="p-2 text-zinc-500 hover:text-zinc-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={shouldReduceMotion ? { x: 0 } : { x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-72 max-w-[85vw] h-full bg-zinc-950 text-white flex flex-col p-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <BrandLogo variant="light" size="sm" showSubtitle={false} />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="p-1.5 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-6 space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                        isActive
                          ? 'bg-red-600 text-white'
                          : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                      }`
                    }
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </NavLink>
                ))}
                <div className="pt-4 mt-4 border-t border-zinc-800 space-y-1">
                  <Link
                    to="/mi-cuenta"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  >
                    <User className="w-4 h-4 text-red-500" />
                    <span>Mi Cuenta</span>
                  </Link>
                  <Link
                    to="/mis-pedidos"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  >
                    <PackageCheck className="w-4 h-4 text-red-500" />
                    <span>Mis Pedidos</span>
                  </Link>
                </div>
              </nav>

              <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-500">
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                  <span>Portal Corporativo</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Editorial Footer */}
      <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <BrandLogo variant="light" size="md" showSubtitle={false} />
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
              Casa de moda contemporánea con curaduría internacional, sastrería urbana y experiencia omnicanal en tiempo real.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
              Tienda Online
            </div>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link to="/productos" className="hover:text-white transition">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link to="/categorias" className="hover:text-white transition">
                  Departamentos
                </Link>
              </li>
              <li>
                <Link to="/promociones" className="hover:text-white transition">
                  Campañas y Cupones
                </Link>
              </li>
              <li>
                <Link to="/carrito" className="hover:text-white transition">
                  Bolsa de Compras
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
              Atención al Cliente
            </div>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link to="/mi-cuenta" className="hover:text-white transition">
                  Mi Cuenta
                </Link>
              </li>
              <li>
                <Link to="/mis-pedidos" className="hover:text-white transition">
                  Seguimiento de Pedidos
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-white transition">
                  Boutique & Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
              Flagship San Isidro
            </div>
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <span>{storeSettings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{storeSettings.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{storeSettings.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
            <span>
              © 2026 {storeSettings.storeName}. Todos los derechos reservados.
            </span>
            <Link
              to={hasAdminAccess ? '/admin/dashboard' : '/admin/login'}
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              <span>{hasAdminAccess ? 'Ir al Panel Administrativo' : 'Portal Corporativo'}</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
