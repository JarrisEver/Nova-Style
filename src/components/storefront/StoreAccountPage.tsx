import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  User,
  LogOut,
  PackageCheck,
  ShieldCheck,
  ArrowRight,
  Save,
  Sparkles,
} from 'lucide-react';

export const StoreAccountPage: React.FC = () => {
  const {
    currentUser,
    hasAdminAccess,
    clients,
    onlineOrders,
    storeSettings,
    loginClient,
    registerClient,
    updateOwnClientProfile,
    logout,
  } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loginIdentifier, setLoginIdentifier] = useState('cliente');

  // Register state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDocType, setRegDocType] = useState<'DNI' | 'RUC' | 'CE'>('DNI');
  const [regDoc, setRegDoc] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regError, setRegError] = useState('');

  // Profile editor state
  const isClient = currentUser !== null && currentUser.role === 'CLIENTE';
  const matchedClient = isClient
    ? clients.find((c) => c.email.toLowerCase() === currentUser.email.toLowerCase())
    : undefined;

  const [profName, setProfName] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [profDocType, setProfDocType] = useState<'DNI' | 'RUC' | 'CE'>('DNI');
  const [profDoc, setProfDoc] = useState('');
  const [profAddress, setProfAddress] = useState('');

  useEffect(() => {
    if (isClient) {
      setProfName(matchedClient?.name || currentUser.name);
      setProfEmail(matchedClient?.email || currentUser.email);
      setProfPhone(matchedClient?.phone || currentUser.phone || '');
      setProfDocType(matchedClient?.documentType || 'DNI');
      setProfDoc(matchedClient?.document || '');
      setProfAddress(matchedClient?.address || '');
    }
  }, [isClient, matchedClient, currentUser]);

  if (hasAdminAccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="font-editorial text-2xl font-bold text-zinc-950">
            Sesión Corporativa Activa ({currentUser?.role})
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Actualmente estás autenticado como <strong>{currentUser?.name}</strong> en el sistema administrativo NS-Management. Para usar una cuenta de cliente en la tienda online, cierra la sesión corporativa o vuelve al panel interno.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/admin/dashboard"
              className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition"
            >
              Ir al Panel Administrativo
            </Link>
            <button
              type="button"
              onClick={logout}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition"
            >
              Cerrar sesión actual
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isClient && currentUser) {
    const myOrders = onlineOrders.filter(
      (o) =>
        o.clientEmail.toLowerCase() === currentUser.email.toLowerCase() ||
        (matchedClient && o.clientId === matchedClient.id)
    );

    const handleSaveProfile = (e: React.FormEvent) => {
      e.preventDefault();
      updateOwnClientProfile({
        name: profName,
        email: profEmail,
        phone: profPhone,
        documentType: profDocType,
        document: profDoc,
        address: profAddress,
      });
    };

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">
              Área de Cliente
            </div>
            <h1 className="font-editorial text-3xl font-bold text-zinc-950 mt-1">
              Hola, {currentUser.name}
            </h1>
            <p className="text-xs text-zinc-500 mt-1">{currentUser.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/mis-pedidos"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Mis Pedidos ({myOrders.length})</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200">
            <div className="text-xs text-zinc-500">Pedidos Online</div>
            <div className="text-2xl font-extrabold font-mono text-zinc-950 mt-1 tabular-nums">
              {myOrders.length}
            </div>
          </div>
          <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200">
            <div className="text-xs text-zinc-500">Compras Históricas</div>
            <div className="text-2xl font-extrabold font-mono text-zinc-950 mt-1 tabular-nums">
              {matchedClient?.totalPurchases || myOrders.length}
            </div>
          </div>
          <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200">
            <div className="text-xs text-zinc-500">Total Acumulado</div>
            <div className="text-2xl font-extrabold font-mono text-red-600 mt-1 tabular-nums">
              {storeSettings.currency} {(matchedClient?.totalSpent || 0).toFixed(2)}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5"
        >
          <h2 className="text-base font-bold text-zinc-950">
            Mis Datos de Envío y Facturación
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Nombre completo</label>
              <input
                type="text"
                required
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                required
                value={profEmail}
                onChange={(e) => setProfEmail(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={profPhone}
                onChange={(e) => setProfPhone(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Tipo</label>
                <select
                  value={profDocType}
                  onChange={(e) => setProfDocType(e.target.value as 'DNI' | 'RUC' | 'CE')}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                >
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="CE">CE</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block font-semibold text-zinc-700 mb-1">Documento</label>
                <input
                  type="text"
                  value={profDoc}
                  onChange={(e) => setProfDoc(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-zinc-700 mb-1">Dirección predeterminada</label>
              <input
                type="text"
                value={profAddress}
                onChange={(e) => setProfAddress(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginClient(loginIdentifier);
    if (ok) {
      navigate('/mis-pedidos');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    const res = registerClient({
      name: regName,
      username: regUsername,
      email: regEmail,
      phone: regPhone,
      documentType: regDocType,
      document: regDoc,
      address: regAddress,
    });
    if (!res.success) {
      setRegError(res.error || 'No se pudo completar el registro.');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="p-6 sm:p-8 bg-zinc-950 text-white">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-500">
            NOVAStyle Club
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold mt-1">
            Mi Cuenta de Cliente
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Administra tus direcciones de entrega y haz seguimiento en vivo a tus pedidos.
          </p>
        </div>

        <div className="grid grid-cols-2 border-b border-zinc-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTab('LOGIN')}
            className={`py-3.5 transition ${
              tab === 'LOGIN'
                ? 'text-red-600 border-b-2 border-red-600 bg-white'
                : 'text-zinc-500 bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setTab('REGISTER')}
            className={`py-3.5 transition ${
              tab === 'REGISTER'
                ? 'text-red-600 border-b-2 border-red-600 bg-white'
                : 'text-zinc-500 bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {tab === 'LOGIN' ? (
          <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-5 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1.5">
                Usuario o correo electrónico
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="cliente o gabriel.torres@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
            >
              <span>Ingresar a Mi Cuenta</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-4 border-t border-zinc-100 space-y-3">
              <button
                type="button"
                onClick={() => {
                  if (loginClient('cliente')) navigate('/mis-pedidos');
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition text-left"
              >
                <div>
                  <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-red-600" />
                    <span>Acceso Rápido Demo: Gabriel Torres</span>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Explorar pedidos existentes y perfil de cliente
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-red-600" />
              </button>

              <div className="flex items-center justify-between px-1 pt-1 text-[11px] text-zinc-500">
                <span>¿Eres parte del equipo NOVAStyle?</span>
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1 font-semibold text-zinc-800 hover:text-red-600 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                  <span>Portal Administrativo</span>
                </Link>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-4 text-xs">
            {regError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
                {regError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-zinc-700 mb-1">Nombre completo *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Usuario *</label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Correo electrónico *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Doc.</label>
                  <select
                    value={regDocType}
                    onChange={(e) => setRegDocType(e.target.value as 'DNI' | 'RUC' | 'CE')}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                  >
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                    <option value="CE">CE</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-zinc-700 mb-1">Número</label>
                  <input
                    type="text"
                    value={regDoc}
                    onChange={(e) => setRegDoc(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-zinc-700 mb-1">Dirección de entrega</label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
            >
              <span>Registrarme en NOVAStyle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
