import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Landmark,
  Lock,
  Unlock,
  DollarSign,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck,
  TrendingUp,
  X,
  History,
} from 'lucide-react';

export const CashRegisterView: React.FC = () => {
  const {
    cashRegister,
    sales,
    currentUser,
    openCashRegister,
    closeCashRegister,
    storeSettings,
    setActiveView,
  } = useApp();

  // Open modal
  const [isOpenModalActive, setIsOpenModalActive] = useState(false);
  const [initialCashInput, setInitialCashInput] = useState('350.00');

  // Close modal
  const [isCloseModalActive, setIsCloseModalActive] = useState(false);
  const [declaredCashInput, setDeclaredCashInput] = useState('');

  // Handle opening
  const handleConfirmOpen = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(initialCashInput) || 0;
    const res = openCashRegister(val);
    if (res.success) {
      setIsOpenModalActive(false);
    }
  };

  // Handle closing
  const handleConfirmClose = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(declaredCashInput) || 0;
    const res = closeCashRegister(val);
    if (res.success) {
      setIsCloseModalActive(false);
      setDeclaredCashInput('');
    }
  };

  // Live sales for current cash session
  const todayStr = '2026-09-28';
  const currentSessionSales = sales.filter(
    (s) => s.channel === 'PRESENCIAL' && s.date === todayStr
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Gestión y Arqueo de Caja (CU-07)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Apertura diaria, control de flujo presencial y conciliación de cierre
          </p>
        </div>

        <div>
          {cashRegister.isOpen ? (
            <button
              onClick={() => {
                setDeclaredCashInput(cashRegister.expectedCash.toFixed(2));
                setIsCloseModalActive(true);
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm shadow-rose-600/20 transition"
            >
              <Lock className="w-4 h-4" />
              <span>Cerrar Caja (Arqueo Final)</span>
            </button>
          ) : (
            <button
              onClick={() => setIsOpenModalActive(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition"
            >
              <Unlock className="w-4 h-4" />
              <span>Abrir Caja de Turno</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Status Hero */}
      <div
        className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition ${
          cashRegister.isOpen
            ? 'bg-gradient-to-r from-emerald-50 via-white to-blue-50 border-emerald-200'
            : 'bg-slate-100 border-slate-300'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              cashRegister.isOpen
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-400 text-white'
            }`}
          >
            <Landmark className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  cashRegister.isOpen
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {cashRegister.isOpen ? 'CAJA ABIERTA • EN OPERACIÓN' : 'CAJA CERRADA'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              Terminal POS Principal #01
            </h2>
            <div className="text-xs text-slate-600 flex flex-wrap gap-4 mt-2">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                Cajero: <strong>{cashRegister.openedByUserName || currentUser?.name}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {cashRegister.isOpen
                  ? `Apertura: ${cashRegister.openedAt}`
                  : `Último cierre: ${cashRegister.closedAt || 'Hoy'}`}
              </span>
            </div>
          </div>
        </div>

        {cashRegister.isOpen && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('pos')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              Ir a Cobrar al POS
            </button>
          </div>
        )}
      </div>

      {/* Numerical Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Saldo Inicial */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Saldo Inicial
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {storeSettings.currency} {cashRegister.initialCash.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400">Efectivo fondo de caja</span>
        </div>

        {/* Ventas Efectivo */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Ventas Efectivo
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {storeSettings.currency} {cashRegister.cashSales.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400">Ingresos físicos a caja</span>
        </div>

        {/* Ventas Electrónicas */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Ventas Electrónicas
          </span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">
            {storeSettings.currency} {cashRegister.electronicSales.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400">Tarjetas, Yape, Plin</span>
        </div>

        {/* Total Cobrado */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Total Facturado
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {storeSettings.currency} {cashRegister.totalCollected.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400">
            {cashRegister.totalOperations} operaciones presenciales
          </span>
        </div>

        {/* Saldo Esperado en Efectivo */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/40 shadow-xs">
          <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide">
            Saldo Esperado
          </span>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">
            {storeSettings.currency} {cashRegister.expectedCash.toFixed(2)}
          </div>
          <span className="text-[10px] text-blue-600 font-medium">Inicial + Ventas Efec.</span>
        </div>
      </div>

      {/* Difference / History if last closed */}
      {!cashRegister.isOpen && cashRegister.declaredCash !== undefined && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-slate-500" />
            <div>
              <div className="text-xs font-bold text-slate-800">Resultado del último arqueo</div>
              <div className="text-xs text-slate-500">
                Esperado: {storeSettings.currency} {cashRegister.expectedCash.toFixed(2)} |
                Declarado: {storeSettings.currency} {cashRegister.declaredCash.toFixed(2)}
              </div>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              (cashRegister.difference || 0) === 0
                ? 'bg-emerald-100 text-emerald-800'
                : (cashRegister.difference || 0) > 0
                ? 'bg-blue-100 text-blue-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {(cashRegister.difference || 0) === 0
              ? '✓ Cuadre Exacto'
              : (cashRegister.difference || 0) > 0
              ? `+${storeSettings.currency} ${(cashRegister.difference || 0).toFixed(2)} (Sobrante)`
              : `-${storeSettings.currency} ${Math.abs(cashRegister.difference || 0).toFixed(2)} (Faltante)`}
          </span>
        </div>
      )}

      {/* Live Sales Table for this Cash Session */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Operaciones del Turno Actual</h2>
            <p className="text-xs text-slate-500">
              Ventas procesadas por esta caja durante la jornada
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {currentSessionSales.length} transacciones
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">N° Comprobante</th>
                <th className="px-3 py-3 font-semibold">Hora</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-3 py-3 font-semibold">Método de Pago</th>
                <th className="px-3 py-3 font-semibold text-right">Monto Recibido</th>
                <th className="px-3 py-3 font-semibold text-right">Vuelto</th>
                <th className="px-4 py-3 font-semibold text-right">Total Cobrado</th>
                <th className="px-3 py-3 font-semibold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentSessionSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-mono font-bold text-blue-700">
                    {sale.saleNumber}
                  </td>
                  <td className="px-3 py-3 font-mono text-slate-500">{sale.time}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{sale.clientName}</td>
                  <td className="px-3 py-3 font-medium">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-slate-600">
                    {sale.cashReceived
                      ? `${storeSettings.currency} ${sale.cashReceived.toFixed(2)}`
                      : '—'}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-emerald-700 font-semibold">
                    {sale.change !== undefined
                      ? `${storeSettings.currency} ${sale.change.toFixed(2)}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900 font-mono">
                    {storeSettings.currency} {sale.total.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      APROBADO
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Abrir Caja */}
      {isOpenModalActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Apertura de Caja Diaria</h3>
              <button
                onClick={() => setIsOpenModalActive(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOpen} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Cajero Responsable</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.name || 'Marcos Alva (Cajero)'}
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Fecha y Hora</label>
                <input
                  type="text"
                  disabled
                  value={`${todayStr} ${new Date().toTimeString().slice(0, 5)}`}
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg font-mono text-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  Saldo Inicial en Efectivo ({storeSettings.currency}) *
                </label>
                <input
                  type="number"
                  step="0.10"
                  required
                  value={initialCashInput}
                  onChange={(e) => setInitialCashInput(e.target.value)}
                  className="w-full text-lg font-bold p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  placeholder="350.00"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Monto en monedas y billetes para cambio/vuelto.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpenModalActive(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Confirmar Apertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cerrar Caja (Arqueo) */}
      {isCloseModalActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">CU-07 Cerrar Caja & Arqueo</h3>
                <p className="text-xs text-slate-500">Conciliación de saldos del turno</p>
              </div>
              <button
                onClick={() => setIsCloseModalActive(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmClose} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Saldo Inicial en Efectivo:</span>
                  <span className="font-mono font-semibold">
                    {storeSettings.currency} {cashRegister.initialCash.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ventas en Efectivo del Turno:</span>
                  <span className="font-mono font-semibold text-emerald-600">
                    + {storeSettings.currency} {cashRegister.cashSales.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Saldo Esperado en Caja:</span>
                  <span className="text-blue-700 font-mono">
                    {storeSettings.currency} {cashRegister.expectedCash.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">
                  Saldo en Efectivo Declarado (Contado por el Cajero) *
                </label>
                <input
                  type="number"
                  step="0.10"
                  required
                  value={declaredCashInput}
                  onChange={(e) => setDeclaredCashInput(e.target.value)}
                  className="w-full text-lg font-bold p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-slate-900"
                  placeholder="0.00"
                />
              </div>

              {/* Live difference calculation */}
              {declaredCashInput !== '' && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                    parseFloat(declaredCashInput) - cashRegister.expectedCash === 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : parseFloat(declaredCashInput) - cashRegister.expectedCash > 0
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <span>Diferencia de Caja:</span>
                  <span className="text-sm font-mono">
                    {parseFloat(declaredCashInput) - cashRegister.expectedCash === 0
                      ? 'S/ 0.00 (Cuadre perfecto)'
                      : parseFloat(declaredCashInput) - cashRegister.expectedCash > 0
                      ? `+ S/ ${(parseFloat(declaredCashInput) - cashRegister.expectedCash).toFixed(2)} (Sobrante)`
                      : `- S/ ${Math.abs(parseFloat(declaredCashInput) - cashRegister.expectedCash).toFixed(2)} (Faltante)`}
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCloseModalActive(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm shadow-rose-600/20"
                >
                  Registrar Cierre Definitivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
