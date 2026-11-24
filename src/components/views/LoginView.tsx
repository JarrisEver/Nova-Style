import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { BRAND_MEDIA } from '../../assets/media';
import { BrandLogo } from '../ui/BrandLogo';
import { TiltCard3D } from '../ui/TiltCard3D';
import { SafeImage } from '../ui/MotionPrimitives';
import { Lock, User as UserIcon, Shield, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, currentUser, logout } = useApp();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Por favor ingrese su nombre de usuario corporativo.');
      return;
    }
    const ok = login(username);
    if (!ok) {
      setErrorMsg('Credenciales inválidas o cuenta sin permisos administrativos.');
    } else {
      navigate('/admin/dashboard');
    }
  };

  // Strictly internal staff roles — CLIENTE is excluded from Admin Portal
  const testAccounts: { role: Role; username: string; label: string; name: string }[] = [
    { role: 'ADMINISTRADOR', username: 'admin', label: 'Administrador', name: 'Carlos Mendoza' },
    { role: 'VENDEDOR', username: 'vendedor', label: 'Vendedor', name: 'Valeria Quispe' },
    { role: 'CAJERO', username: 'cajero', label: 'Cajero', name: 'Marcos Alva' },
    { role: 'ALMACENERO', username: 'almacen', label: 'Almacenero', name: 'David Paredes' },
    { role: 'COMPRADOR', username: 'compras', label: 'Comprador', name: 'Lucía Benavides' },
    { role: 'SUPERVISOR', username: 'supervisor', label: 'Supervisor', name: 'Roberto Farfán' },
    { role: 'GERENCIA', username: 'gerencia', label: 'Gerencia', name: 'Elena Morales' },
  ];

  const isClientSession = currentUser !== null && currentUser.role === 'CLIENTE';

  return (
    <div className="min-h-screen bg-zinc-950 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
      {/* LEFT PANEL: 3D Fashion Atelier Showcase */}
      <div className="relative lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden bg-zinc-950 text-white min-h-[340px] lg:min-h-screen">
        <SafeImage
          src={BRAND_MEDIA.loginAtelierShowcase}
          alt="NOVAStyle Editorial Collection"
          className="absolute inset-0 w-full h-full object-cover opacity-55 scale-105"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-zinc-950/90 via-zinc-950/65 to-red-950/75"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/50"
        />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <BrandLogo variant="light" size="lg" animateEntrance />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Tienda Online</span>
          </Link>
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 my-8 lg:my-0 max-w-2xl"
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-500 mb-3">
            Entorno Privado · NS-Management
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl xl:text-5xl font-bold leading-[1.08] tracking-tight text-white">
            Gestión comercial, punto de venta e inventario en{' '}
            <span className="italic font-normal text-red-500">tiempo real</span>.
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-zinc-300 max-w-lg leading-relaxed">
            Acceso exclusivo para personal autorizado de NOVAStyle: catálogo multivariante,
            facturación POS, arqueo de caja, despacho omnicanal y auditoría ejecutiva.
          </p>

          <div className="mt-8 hidden sm:block max-w-md">
            <TiltCard3D elevation="high" maxTilt={7} className="rounded-xl overflow-hidden border border-white/15 bg-zinc-900/80">
              <div className="relative aspect-[16/9] overflow-hidden">
                <SafeImage
                  src={BRAND_MEDIA.showcaseEcosystem}
                  alt="NOVAStyle Multi-Device Platform"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Ecosistema NS-Management</span>
                  <span className="font-mono text-[11px] text-red-400 tabular-nums">16 Módulos</span>
                </div>
              </div>
            </TiltCard3D>
          </div>
        </motion.div>

        <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-lg text-xs">
          <div>
            <div className="font-mono text-lg font-bold text-white tabular-nums">7</div>
            <div className="text-[11px] text-zinc-400">Roles Internos</div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold text-red-500 tabular-nums">11</div>
            <div className="text-[11px] text-zinc-400">Casos de Uso</div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold text-white tabular-nums">100%</div>
            <div className="text-[11px] text-zinc-400">Trazabilidad Kardex</div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Crisp White Corporate Sign-In */}
      <div className="lg:col-span-5 bg-white flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14 relative">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-600 mb-1.5">
              Acceso Corporativo Restringido
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950">
              Panel Administrativo NOVAStyle
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Ingrese sus credenciales operativas o seleccione un perfil interno de prueba.
            </p>
          </div>

          {isClientSession && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="flex items-start gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>Sesión de cliente activa ({currentUser?.name})</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Las cuentas de cliente no tienen acceso al panel administrativo. Cierra la sesión de cliente o regresa a la tienda online.
              </p>
              <div className="flex gap-2">
                <Link
                  to="/"
                  className="px-2.5 py-1 bg-zinc-950 text-white rounded text-[11px] font-semibold"
                >
                  Ir a Tienda
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="px-2.5 py-1 bg-white border border-amber-300 text-amber-900 rounded text-[11px] font-semibold"
                >
                  Cerrar sesión cliente
                </button>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Usuario del Sistema
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg('');
                  }}
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-950 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/15 focus:border-red-600 text-xs transition"
                  placeholder="Ej: admin, vendedor, cajero..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-950 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/15 focus:border-red-600 text-xs transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-[0_10px_24px_-8px_rgba(220,38,38,0.65)] text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition"
              >
                <span>Iniciar sesión</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Role Access Grid (Staff Only) */}
          <div className="mt-8 pt-6 border-t border-zinc-200">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              <Shield className="w-3.5 h-3.5 text-red-600" />
              <span>Accesos Rápidos de Personal</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {testAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => {
                    setUsername(acc.username);
                    setPassword(`${acc.username}123`);
                    if (login(acc.username)) {
                      navigate('/admin/dashboard');
                    }
                  }}
                  className="text-left px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 hover:border-red-600 hover:bg-red-50/40 transition group"
                >
                  <div className="text-[11px] font-bold text-zinc-900 group-hover:text-red-600 transition-colors">
                    {acc.label}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">{acc.name}</div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
