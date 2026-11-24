import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TiltCard3D } from '../ui/TiltCard3D';
import { ModalShell, ModuleHeader } from '../ui/MotionPrimitives';
import {
  Landmark,
  Lock,
  Unlock,
  Clock,
  UserCheck,
  X,
  History,
  ArrowUpRight,
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

  const [isOpenModalActive, setIsOpenModalActive] = useState(false);
  const [initialCashInput, setInitialCashInput] = useState('350.00');

  const [isCloseModalActive, setIsCloseModalActive] = useState(false);
  const [declaredCashInput, setDeclaredCashInput] = useState('');

  const handleConfirmOpen = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(initialCashInput) || 0;
    const res = openCashRegister(val);
    if (res.success) {
      setIsOpenModalActive(false);
    }
  };

  const handleConfirmClose = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(declaredCashInput) || 0;
    const res = closeCashRegister(val);
    if (res.success) {
      setIsCloseModalActive(false);
      setDeclaredCashInput('');
    }
  };

  const todayStr = '2026-09-28';
  const currentSessionSales = sales.filter(
    (s) => s.channel === 'PRESENCIAL' && s.date === todayStr
  );

  return (
    <div className="space-y-6">
      <ModuleHeader
        kicker="Tesorería & Arqueo · CU-07"
        title="Gestión y Arqueo de Caja"
        subtitle="Apertura diaria, control de flujo presencial y conciliación de cierre de turno."
        actions={
          cashRegister.isOpen ? (
            <button
              onClick={() => {
                setDeclaredCashInput(cashRegister.expectedCash.toFixed(2));
                setIsCloseModalActive(true);
              }}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition whitespace-nowrap"
            >
              <Lock className="w-4 h-4" />
              <span>Cerrar Caja (Arqueo Final)</span>
            </button>
          ) : (
            <button
              onClick={() => setIsOpenModalActive(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition whitespace-nowrap"
            >
              <Unlock className="w-4 h-4" />
              <span>Abrir Caja de Turno</span>
            </button>
          )
        }
      />

      {/* Terminal Status Hero */}
      <div
        className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition ${
          cashRegister.isOpen
            ? 'bg-zinc-950 text-white border-zinc-800 shadow-[0_18px_40px_-14px_rgba(9,9,11,0.4)]'
            : 'bg-white text-zinc-900 border-zinc-200'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
              cashRegister.isOpen
                ? 'bg-red-600 text-white shadow-[0_8px_20px_-6px_rgba(220,38,38,0.65)]'
                : 'bg-zinc-200 text-zinc-600'
            }`}
          >
            <Landmark className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider">
              <span className={cashRegister.isOpen ? 'text-emerald-400' : 'text-red-600'}>
                {cashRegister.isOpen ? 'CAJA ABIERTA · EN OPERACIÓN' : 'CAJA CERRADA'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold mt-1 tracking-tight">
              Terminal POS Principal #01
            </h2>
            <div
              className={`text-xs flex flex-wrap gap-4 mt-2 ${
                cashRegister.isOpen ? 'text-zinc-400' : 'text-zinc-500'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                Cajero:{' '}
                <strong className={cashRegister.isOpen ? 'text-white' : 'text-zinc-900'}>
                  {cashRegister.openedByUserName || currentUser?.name}
                </strong>
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {cashRegister.isOpen
                  ? `Apertura: ${cashRegister.openedAt}`
                  : `Último cierre: ${cashRegister.closedAt || 'Hoy'}`}
              </span>
            </div>
          </div>
        </div>

        {cashRegister.isOpen && (
          <button
            onClick={() => setActiveView('pos')}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
          >
            <span>Ir a Cobrar al POS</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3D Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <TiltCard3D elevation="subtle" className="bg-white p-4 rounded-xl border border-zinc-200">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Saldo Inicial
          </span>
          <div className="text-2xl font-extrabold font-mono text-zinc-950 mt-1 tabular-nums">
            {storeSettings.currency} {cashRegister.initialCash.toFixed(2)}
          </div>
          <span className="text-[10px] text-zinc-400">Fondo de caja</span>
        </TiltCard3D>

        <TiltCard3D elevation="subtle" className="bg-white p-4 rounded-xl border border-zinc-200">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Ventas Efectivo
          </span>
          <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-1 tabular-nums">
            {storeSettings.currency} {cashRegister.cashSales.toFixed(2)}
          </div>
          <span className="text-[10px] text-zinc-400">Ingresos físicos</span>
        </TiltCard3D>

        <TiltCard3D elevation="subtle" className="bg-white p-4 rounded-xl border border-zinc-200">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Ventas Electrónicas
          </span>
          <div className="text-2xl font-extrabold font-mono text-zinc-950 mt-1 tabular-nums">
            {storeSettings.currency} {cashRegister.electronicSales.toFixed(2)}
          </div>
          <span className="text-[10px] text-zinc-400">Tarjeta, Yape, Plin</span>
        </TiltCard3D>

        <TiltCard3D elevation="subtle" className="bg-white p-4 rounded-xl border border-zinc-200">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Total Facturado
          </span>
          <div className="text-2xl font-extrabold font-mono text-zinc-950 mt-1 tabular-nums">
            {storeSettings.currency} {cashRegister.totalCollected.toFixed(2)}
          </div>
          <span className="text-[10px] text-zinc-400 tabular-nums">
            {cashRegister.totalOperations} operaciones
          </span>
        </TiltCard3D>

        <TiltCard3D elevation="subtle" className="bg-zinc-950 text-white p-4 rounded-xl border border-zinc-800">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
            Saldo Esperado
          </span>
          <div className="text-2xl font-extrabold font-mono text-white mt-1 tabular-nums">
            {storeSettings.currency} {cashRegister.expectedCash.toFixed(2)}
          </div>
          <span className="text-[10px] text-zinc-400">Inicial + Efectivo</span>
        </TiltCard3D>
      </div>

      {/* Last Closed Result */}
      {!cashRegister.isOpen && cashRegister.declaredCash !== undefined && (
        <div className="p-4 bg-white rounded-xl border border-zinc-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-zinc-500" />
            <div>
              <div className="text-xs font-bold text-zinc-950">Resultado del último arqueo</div>
              <div className="text-xs text-zinc-500 font-mono tabular-nums">
                Esperado: {storeSettings.currency} {cashRegister.expectedCash.toFixed(2)} ·
                Declarado: {storeSettings.currency} {cashRegister.declaredCash.toFixed(2)}
              </div>
            </div>
          </div>
          <span
            className={`text-xs font-bold font-mono px-3 py-1 rounded border tabular-nums ${
              (cashRegister.difference || 0) === 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : (cashRegister.difference || 0) > 0
                ? 'bg-zinc-950 text-white border-zinc-800'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {(cashRegister.difference || 0) === 0
              ? 'Cuadre Exacto'
              : (cashRegister.difference || 0) > 0
              ? `+${storeSettings.currency} ${(cashRegister.difference || 0).toFixed(2)} (Sobrante)`
              : `-${storeSettings.currency} ${Math.abs(cashRegister.difference || 0).toFixed(2)} (Faltante)`}
          </span>
        </div>
      )}

      {/* Operations Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-950">Operaciones del Turno Actual</h2>
            <p className="text-xs text-zinc-500">Ventas procesadas por esta caja durante la jornada</p>
          </div>
          <span className="text-xs font-mono font-semibold text-zinc-700 tabular-nums">
            {currentSessionSales.length} transacciones
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 font-semibold">N° Comprobante</th>
                <th className="px-3 py-3 font-semibold">Hora</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-3 py-3 font-semibold">Método</th>
                <th className="px-3 py-3 font-semibold text-right">Recibido</th>
                <th className="px-3 py-3 font-semibold text-right">Vuelto</th>
                <th className="px-4 py-3 font-semibold text-right">Total</th>
                <th className="px-3 py-3 font-semibold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {currentSessionSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-zinc-50 transition">
                  <td className="px-4 py-3 font-mono font-bold text-red-600">{sale.saleNumber}</td>
                  <td className="px-3 py-3 font-mono text-zinc-500 tabular-nums">{sale.time}</td>
                  <td className="px-4 py-3 font-medium text-zinc-950">{sale.clientName}</td>
                  <td className="px-3 py-3 font-medium text-zinc-700">{sale.paymentMethod}</td>
                  <td className="px-3 py-3 text-right font-mono text-zinc-600 tabular-nums">
                    {sale.cashReceived ? `${storeSettings.currency} ${sale.cashReceived.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-emerald-700 font-semibold tabular-nums">
                    {sale.change !== undefined ? `${storeSettings.currency} ${sale.change.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-zinc-950 font-mono tabular-nums">
                    {storeSettings.currency} {sale.total.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
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
      <ModalShell
        isOpen={isOpenModalActive}
        onClose={() => setIsOpenModalActive(false)}
        maxWidthClass="max-w-sm"
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
          <h3 className="text-sm font-bold">Apertura de Caja Diaria</h3>
          <button
            onClick={() => setIsOpenModalActive(false)}
            className="text-zinc-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirmOpen} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-zinc-600 mb-1 font-semibold">Cajero Responsable</label>
            <input
              type="text"
              disabled
              value={currentUser?.name || 'Marcos Alva'}
              className="w-full p-2 bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-700 font-medium"
            />
          </div>

          <div>
            <label className="block text-zinc-600 mb-1 font-semibold">Fecha y Hora</label>
            <input
              type="text"
              disabled
              value={`${todayStr} ${new Date().toTimeString().slice(0, 5)}`}
              className="w-full p-2 bg-zinc-100 border border-zinc-200 rounded-lg font-mono text-zinc-700"
            />
          </div>

          <div>
            <label className="block text-zinc-800 mb-1 font-bold">
              Saldo Inicial en Efectivo ({storeSettings.currency}) *
            </label>
            <input
              type="number"
              step="0.10"
              required
              value={initialCashInput}
              onChange={(e) => setInitialCashInput(e.target.value)}
              className="w-full text-lg font-bold p-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tabular-nums"
              placeholder="350.00"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => setIsOpenModalActive(false)}
              className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
            >
              Confirmar Apertura
            </button>
          </div>
        </form>
      </ModalShell>

      {/* Modal: Cerrar Caja */}
      <ModalShell
        isOpen={isCloseModalActive}
        onClose={() => setIsCloseModalActive(false)}
        maxWidthClass="max-w-md"
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
          <div>
            <h3 className="text-sm font-bold">CU-07 Cerrar Caja & Arqueo</h3>
            <p className="text-[11px] text-zinc-400">Conciliación de saldos del turno</p>
          </div>
          <button
            onClick={() => setIsCloseModalActive(false)}
            className="text-zinc-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirmClose} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1.5 tabular-nums">
            <div className="flex justify-between text-zinc-600">
              <span>Saldo Inicial:</span>
              <span className="font-mono font-semibold">
                {storeSettings.currency} {cashRegister.initialCash.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Ventas en Efectivo:</span>
              <span className="font-mono font-semibold text-emerald-700">
                + {storeSettings.currency} {cashRegister.cashSales.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-zinc-950 pt-1.5 border-t border-zinc-200">
              <span>Saldo Esperado:</span>
              <span className="text-red-600 font-mono">
                {storeSettings.currency} {cashRegister.expectedCash.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-zinc-800 mb-1 font-bold">
              Efectivo Declarado (Contado por el Cajero) *
            </label>
            <input
              type="number"
              step="0.10"
              required
              value={declaredCashInput}
              onChange={(e) => setDeclaredCashInput(e.target.value)}
              className="w-full text-lg font-bold p-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 font-mono text-zinc-950 tabular-nums"
              placeholder="0.00"
            />
          </div>

          {declaredCashInput !== '' && (
            <div
              className={`p-3 rounded-lg border flex items-center justify-between text-xs font-bold tabular-nums ${
                parseFloat(declaredCashInput) - cashRegister.expectedCash === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : parseFloat(declaredCashInput) - cashRegister.expectedCash > 0
                  ? 'bg-zinc-950 border-zinc-800 text-white'
                  : 'bg-red-50 border-red-200 text-red-800'
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

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => setIsCloseModalActive(false)}
              className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
            >
              Registrar Cierre Definitivo
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
};
