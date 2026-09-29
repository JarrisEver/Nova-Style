import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { PosView } from './components/views/PosView';
import { ProductsView } from './components/views/ProductsView';
import { InventoryView } from './components/views/InventoryView';
import { PurchasesView } from './components/views/PurchasesView';
import { SuppliersView } from './components/views/SuppliersView';
import { ClientsView } from './components/views/ClientsView';
import { PromotionsView } from './components/views/PromotionsView';
import { CashRegisterView } from './components/views/CashRegisterView';
import { OnlineOrdersView } from './components/views/OnlineOrdersView';
import { ReturnsView } from './components/views/ReturnsView';
import { ReportsView } from './components/views/ReportsView';
import { UsersView } from './components/views/UsersView';
import { AuditView } from './components/views/AuditView';
import { SettingsView } from './components/views/SettingsView';
import { ShieldAlert, ArrowLeft, ChevronRight } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, activeView, setActiveView, hasAccessToView } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!currentUser) {
    return <LoginView />;
  }

  const isAuthorized = hasAccessToView(activeView);

  // View Names mapper for breadcrumbs
  const viewLabels: { [key: string]: string } = {
    dashboard: 'Dashboard Gerencial',
    pos: 'Punto de Venta (POS)',
    products: 'Catálogo de Productos',
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

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Top Header */}
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Breadcrumb banner */}
        <div className="px-4 lg:px-6 py-2.5 bg-white/70 border-b border-slate-200/60 text-xs flex items-center justify-between text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <span
              onClick={() => setActiveView('dashboard')}
              className="hover:text-blue-600 cursor-pointer"
            >
              NOVAStyle
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold">
              {viewLabels[activeView] || activeView}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span>Tienda: Sede Principal San Isidro</span>
            <span>•</span>
            <span>Canal Presencial & Omnicanal</span>
          </div>
        </div>

        {/* View Content or Unauthorized Fallback */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {!isAuthorized ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm space-y-4 my-8">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Acceso Restringido por Rol (Regla #10)
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                El perfil actual (<strong>{currentUser.role}</strong>) no tiene autorización para acceder al módulo de <strong>{viewLabels[activeView] || activeView}</strong> según la matriz de permisos de seguridad institucional.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => {
                    if (currentUser.role === 'CAJERO') setActiveView('cash-register');
                    else if (currentUser.role === 'ALMACENERO') setActiveView('inventory');
                    else if (currentUser.role === 'COMPRADOR') setActiveView('purchases');
                    else if (currentUser.role === 'CLIENTE') setActiveView('pos');
                    else setActiveView('dashboard');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a Módulo Autorizado</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeView === 'dashboard' && <DashboardView />}
              {activeView === 'pos' && <PosView />}
              {activeView === 'products' && <ProductsView />}
              {activeView === 'inventory' && <InventoryView />}
              {activeView === 'purchases' && <PurchasesView />}
              {activeView === 'suppliers' && <SuppliersView />}
              {activeView === 'clients' && <ClientsView />}
              {activeView === 'promotions' && <PromotionsView />}
              {activeView === 'cash-register' && <CashRegisterView />}
              {activeView === 'online-orders' && <OnlineOrdersView />}
              {activeView === 'returns' && <ReturnsView />}
              {activeView === 'reports' && <ReportsView />}
              {activeView === 'users' && <UsersView />}
              {activeView === 'audit' && <AuditView />}
              {activeView === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>

      {/* Global Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
