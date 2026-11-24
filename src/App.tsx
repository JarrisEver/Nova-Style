import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ActiveView, Role } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { PageTransition } from './components/ui/MotionPrimitives';
import { ArrowLeft, ChevronRight, Loader2, ShieldAlert } from 'lucide-react';

// Lazy-loaded Storefront Layout & Pages
const StorefrontLayout = lazy(() =>
  import('./components/storefront/StorefrontLayout').then((m) => ({ default: m.StorefrontLayout }))
);
const StoreHomePage = lazy(() =>
  import('./components/storefront/StoreHomePage').then((m) => ({ default: m.StoreHomePage }))
);
const StoreCatalogPage = lazy(() =>
  import('./components/storefront/StoreCatalogPage').then((m) => ({ default: m.StoreCatalogPage }))
);
const StoreProductDetailPage = lazy(() =>
  import('./components/storefront/StoreProductDetailPage').then((m) => ({
    default: m.StoreProductDetailPage,
  }))
);
const StoreCategoriesPage = lazy(() =>
  import('./components/storefront/StoreCategoriesPage').then((m) => ({
    default: m.StoreCategoriesPage,
  }))
);
const StorePromotionsPage = lazy(() =>
  import('./components/storefront/StorePromotionsPage').then((m) => ({
    default: m.StorePromotionsPage,
  }))
);
const StoreCartPage = lazy(() =>
  import('./components/storefront/StoreCartPage').then((m) => ({ default: m.StoreCartPage }))
);
const StoreAccountPage = lazy(() =>
  import('./components/storefront/StoreAccountPage').then((m) => ({ default: m.StoreAccountPage }))
);
const StoreOrdersPage = lazy(() =>
  import('./components/storefront/StoreOrdersPage').then((m) => ({ default: m.StoreOrdersPage }))
);
const StoreContactPage = lazy(() =>
  import('./components/storefront/StoreContactPage').then((m) => ({ default: m.StoreContactPage }))
);

// Lazy-loaded Admin Login & ERP/POS Modules
const LoginView = lazy(() =>
  import('./components/views/LoginView').then((m) => ({ default: m.LoginView }))
);
const DashboardView = lazy(() =>
  import('./components/views/DashboardView').then((m) => ({ default: m.DashboardView }))
);
const PosView = lazy(() =>
  import('./components/views/PosView').then((m) => ({ default: m.PosView }))
);
const ProductsView = lazy(() =>
  import('./components/views/ProductsView').then((m) => ({ default: m.ProductsView }))
);
const CategoriesView = lazy(() =>
  import('./components/views/CategoriesView').then((m) => ({ default: m.CategoriesView }))
);
const InventoryView = lazy(() =>
  import('./components/views/InventoryView').then((m) => ({ default: m.InventoryView }))
);
const PurchasesView = lazy(() =>
  import('./components/views/PurchasesView').then((m) => ({ default: m.PurchasesView }))
);
const SuppliersView = lazy(() =>
  import('./components/views/SuppliersView').then((m) => ({ default: m.SuppliersView }))
);
const ClientsView = lazy(() =>
  import('./components/views/ClientsView').then((m) => ({ default: m.ClientsView }))
);
const PromotionsView = lazy(() =>
  import('./components/views/PromotionsView').then((m) => ({ default: m.PromotionsView }))
);
const CashRegisterView = lazy(() =>
  import('./components/views/CashRegisterView').then((m) => ({ default: m.CashRegisterView }))
);
const OnlineOrdersView = lazy(() =>
  import('./components/views/OnlineOrdersView').then((m) => ({ default: m.OnlineOrdersView }))
);
const ReturnsView = lazy(() =>
  import('./components/views/ReturnsView').then((m) => ({ default: m.ReturnsView }))
);
const ReportsView = lazy(() =>
  import('./components/views/ReportsView').then((m) => ({ default: m.ReportsView }))
);
const UsersView = lazy(() =>
  import('./components/views/UsersView').then((m) => ({ default: m.UsersView }))
);
const AuditView = lazy(() =>
  import('./components/views/AuditView').then((m) => ({ default: m.AuditView }))
);
const SettingsView = lazy(() =>
  import('./components/views/SettingsView').then((m) => ({ default: m.SettingsView }))
);

const VIEW_TO_SLUG: Record<ActiveView, string> = {
  dashboard: 'dashboard',
  pos: 'pos',
  products: 'productos',
  categories: 'categorias',
  inventory: 'inventario',
  purchases: 'compras',
  suppliers: 'proveedores',
  clients: 'clientes',
  promotions: 'promociones',
  'cash-register': 'caja',
  'online-orders': 'pedidos',
  returns: 'devoluciones',
  reports: 'reportes',
  users: 'usuarios',
  audit: 'auditoria',
  settings: 'configuracion',
};

const SLUG_TO_VIEW: Record<string, ActiveView> = Object.entries(VIEW_TO_SLUG).reduce(
  (acc, [view, slug]) => {
    acc[slug] = view as ActiveView;
    return acc;
  },
  {} as Record<string, ActiveView>
);

const VIEW_LABELS: Record<ActiveView, string> = {
  dashboard: 'Dashboard Gerencial',
  pos: 'Punto de Venta (POS)',
  products: 'Catálogo de Productos',
  categories: 'Gestión de Categorías',
  inventory: 'Inventario & Kardex',
  purchases: 'Compras & Recepciones',
  suppliers: 'Directorio de Proveedores',
  clients: 'Directorio de Clientes',
  promotions: 'Campañas Promocionales',
  'cash-register': 'Gestión de Caja & Arqueo',
  'online-orders': 'Pedidos Online (Kanban)',
  returns: 'Devoluciones & Cambios',
  reports: 'Reportes & Estadísticas',
  users: 'Usuarios & Permisos',
  audit: 'Bitácora de Auditoría',
  settings: 'Configuración General',
};

function getDefaultViewForRole(role: Role): ActiveView {
  if (role === 'CAJERO') return 'cash-register';
  if (role === 'ALMACENERO') return 'inventory';
  if (role === 'COMPRADOR') return 'purchases';
  return 'dashboard';
}

const RouteFallback: React.FC<{ dark?: boolean }> = ({ dark = false }) => (
  <div
    className={`min-h-[60vh] flex flex-col items-center justify-center gap-3 ${
      dark ? 'bg-zinc-950 text-zinc-300 min-h-screen' : 'text-zinc-500'
    }`}
  >
    <Loader2 className="w-6 h-6 animate-spin text-red-600" />
    <span className="text-xs font-medium tracking-wide uppercase">Cargando módulo...</span>
  </div>
);

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

const AdminLoginRoute: React.FC = () => {
  const { currentUser, hasAdminAccess } = useApp();

  if (hasAdminAccess && currentUser) {
    const defaultSlug = VIEW_TO_SLUG[getDefaultViewForRole(currentUser.role)];
    return <Navigate to={`/admin/${defaultSlug}`} replace />;
  }

  return (
    <Suspense fallback={<RouteFallback dark />}>
      <LoginView />
    </Suspense>
  );
};

const AdminRootRedirect: React.FC = () => {
  const { currentUser, hasAdminAccess } = useApp();

  if (!hasAdminAccess || !currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  const defaultSlug = VIEW_TO_SLUG[getDefaultViewForRole(currentUser.role)];
  return <Navigate to={`/admin/${defaultSlug}`} replace />;
};

const AdminShell: React.FC = () => {
  const { currentUser, hasAdminAccess, activeView, setActiveView, hasAccessToView } = useApp();
  const { section } = useParams<{ section: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const routeView = section ? SLUG_TO_VIEW[section] : undefined;
  const prevPathRef = useRef<string>('');
  const prevViewRef = useRef<ActiveView>(activeView);

  useEffect(() => {
    if (!hasAdminAccess || !currentUser) return;

    const pathChanged = location.pathname !== prevPathRef.current;
    const viewChanged = activeView !== prevViewRef.current;

    if (pathChanged) {
      prevPathRef.current = location.pathname;
      if (routeView && routeView !== activeView) {
        prevViewRef.current = routeView;
        setActiveView(routeView);
      }
      return;
    }

    if (viewChanged) {
      prevViewRef.current = activeView;
      const targetPath = `/admin/${VIEW_TO_SLUG[activeView]}`;
      if (location.pathname !== targetPath) {
        prevPathRef.current = targetPath;
        navigate(targetPath);
      }
    }
  }, [
    hasAdminAccess,
    currentUser,
    location.pathname,
    activeView,
    routeView,
    navigate,
    setActiveView,
  ]);

  // Strict separation: unauthenticated users or CLIENTE accounts never enter Admin UI
  if (!hasAdminAccess || !currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // Unknown /admin/:section slug redirects to role default module
  if (!routeView) {
    const defaultSlug = VIEW_TO_SLUG[getDefaultViewForRole(currentUser.role)];
    return <Navigate to={`/admin/${defaultSlug}`} replace />;
  }

  const currentView = routeView;
  const isAuthorized = hasAccessToView(currentView);
  const fallbackView = getDefaultViewForRole(currentUser.role);

  return (
    <div className="min-h-screen bg-zinc-100 flex text-zinc-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Breadcrumb Strip */}
        <div className="px-4 lg:px-6 py-2.5 bg-white border-b border-zinc-200/80 text-xs flex items-center justify-between text-zinc-500">
          <div className="flex items-center gap-1.5 font-medium">
            <button
              onClick={() => {
                setActiveView(fallbackView);
                navigate(`/admin/${VIEW_TO_SLUG[fallbackView]}`);
              }}
              className="hover:text-red-600 transition-colors font-semibold text-zinc-700"
            >
              NS-Management
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-950 font-semibold">
              {VIEW_LABELS[currentView] || currentView}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-500">
            <span>Entorno Administrativo Privado</span>
            <span>·</span>
            <span>Sede Principal San Isidro</span>
          </div>
        </div>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <PageTransition viewKey={isAuthorized ? currentView : `unauthorized-${currentView}`}>
            {!isAuthorized ? (
              <div className="bg-white rounded-xl border border-zinc-200 p-10 text-center max-w-lg mx-auto shadow-sm space-y-4 my-10">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <h2 className="text-base font-bold text-zinc-950">Acceso Restringido por Rol</h2>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  El perfil actual (<strong>{currentUser.role}</strong>) no cuenta con autorización
                  para acceder a <strong>{VIEW_LABELS[currentView] || currentView}</strong> según
                  las políticas de seguridad.
                </p>
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => {
                      setActiveView(fallbackView);
                      navigate(`/admin/${VIEW_TO_SLUG[fallbackView]}`);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver a Módulo Autorizado</span>
                  </button>
                </div>
              </div>
            ) : (
              <Suspense fallback={<RouteFallback />}>
                {currentView === 'dashboard' && <DashboardView />}
                {currentView === 'pos' && <PosView />}
                {currentView === 'products' && <ProductsView />}
                {currentView === 'categories' && <CategoriesView />}
                {currentView === 'inventory' && <InventoryView />}
                {currentView === 'purchases' && <PurchasesView />}
                {currentView === 'suppliers' && <SuppliersView />}
                {currentView === 'clients' && <ClientsView />}
                {currentView === 'promotions' && <PromotionsView />}
                {currentView === 'cash-register' && <CashRegisterView />}
                {currentView === 'online-orders' && <OnlineOrdersView />}
                {currentView === 'returns' && <ReturnsView />}
                {currentView === 'reports' && <ReportsView />}
                {currentView === 'users' && <UsersView />}
                {currentView === 'audit' && <AuditView />}
                {currentView === 'settings' && <SettingsView />}
              </Suspense>
            )}
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ScrollToTop />
      <Routes>
        {/* ENTORNO PÚBLICO — TIENDA ONLINE NOVASTYLE */}
        <Route
          path="/"
          element={
            <Suspense fallback={<RouteFallback />}>
              <StorefrontLayout />
            </Suspense>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<RouteFallback />}>
                <StoreHomePage />
              </Suspense>
            }
          />
          <Route
            path="productos"
            element={
              <Suspense fallback={<RouteFallback />}>
                <StoreCatalogPage />
              </Suspense>
            }
          />
          <Route
            path="productos/:id"
            element={
              <Suspense fallback={<RouteFallback />}>
                <StoreProductDetailPage />
              </Suspense>
            }
          />
          <Route
            path="categorias"
            element={
              <Suspense fallback={<RouteFallback />}>
                <StoreCategoriesPage />
              </Suspense>
            }
          />
          <Route
            path="promociones"
            element={
              <Suspense fallback={<RouteFallback />}>
                <StorePromotionsPage />
              </Suspense>
            }
          />
          <Route
            path="carrito"
            element={
              <Suspense fallback={<RouteFallback />}>
                <StoreCartPage />
              </Suspense>
            }
          />
          <Route
            path="mi-cuenta"
            element={
              <Suspense fallback={<RouteFallback />}>
                <StoreAccountPage />
              </Suspense>
            }
          />
          <Route
            path="mis-pedidos"
            element={
              <Suspense fallback={<RouteFallback />}>
                <StoreOrdersPage />
              </Suspense>
            }
          />
          <Route
            path="contacto"
            element={
              <Suspense fallback={<RouteFallback />}>
                <StoreContactPage />
              </Suspense>
            }
          />
        </Route>

        {/* ENTORNO PRIVADO — PANEL ADMINISTRATIVO NS-MANAGEMENT */}
        <Route path="/admin/login" element={<AdminLoginRoute />} />
        <Route path="/admin" element={<AdminRootRedirect />} />
        <Route path="/admin/:section" element={<AdminShell />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </AppProvider>
  );
}
