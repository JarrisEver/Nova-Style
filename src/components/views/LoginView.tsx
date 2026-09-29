import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, User as UserIcon, Shield, ArrowRight, Store } from 'lucide-react';
import { Role } from '../../types';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Por favor ingrese su nombre de usuario.');
      return;
    }
    const ok = login(username);
    if (!ok) {
      setErrorMsg('Usuario o contraseña incorrectos.');
    }
  };

  const testAccounts: { role: Role; username: string; label: string; name: string }[] = [
    { role: 'ADMINISTRADOR', username: 'admin', label: 'Administrador', name: 'Carlos Mendoza' },
    { role: 'VENDEDOR', username: 'vendedor', label: 'Vendedor', name: 'Valeria Quispe' },
    { role: 'CAJERO', username: 'cajero', label: 'Cajero', name: 'Marcos Alva' },
    { role: 'ALMACENERO', username: 'almacen', label: 'Almacenero', name: 'David Paredes' },
    { role: 'COMPRADOR', username: 'compras', label: 'Comprador', name: 'Lucía Benavides' },
    { role: 'SUPERVISOR', username: 'supervisor', label: 'Supervisor', name: 'Roberto Farfán' },
    { role: 'GERENCIA', username: 'gerencia', label: 'Gerencia', name: 'Elena Morales' },
    { role: 'CLIENTE', username: 'cliente', label: 'Cliente', name: 'Gabriel Torres' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-blue-500/20">
            <Store className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="mt-5 text-center text-3xl font-extrabold text-white tracking-tight">
          NOVAStyle
        </h2>
        <p className="text-center text-sm font-semibold tracking-wide text-blue-400 uppercase mt-0.5">
          NS-Management
        </p>
        <p className="mt-2 text-center text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Sistema de Gestión Comercial e Inventario integrado para la optimización de procesos operativos en tiempo real.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleLogin}>
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Usuario del Sistema
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs transition"
                  placeholder="Ej: admin, vendedor, cajero..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/30 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              >
                <span>Iniciar sesión</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Test Accounts */}
          <div className="mt-6 border-t border-slate-800 pt-5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-3">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Accesos rápidos por rol de prueba:</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {testAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => {
                    setUsername(acc.username);
                    setPassword(`${acc.username}123`);
                    login(acc.username);
                  }}
                  className="text-left p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60 transition group"
                >
                  <div className="text-[11px] font-semibold text-slate-200 group-hover:text-blue-400">
                    {acc.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {acc.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
