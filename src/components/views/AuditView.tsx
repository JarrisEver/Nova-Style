import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Search, Filter, Clock, UserCheck } from 'lucide-react';

export const AuditView: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('TODOS');

  const modules = ['TODOS', 'Ventas', 'Caja', 'Inventario', 'Compras', 'Devoluciones', 'Productos', 'Promociones', 'Usuarios', 'Seguridad'];

  const filteredLogs = auditLogs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      log.action.toLowerCase().includes(q) ||
      log.reference.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q));

    const matchModule = selectedModule === 'TODOS' || log.module.includes(selectedModule);

    return matchSearch && matchModule;
  });

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Registro y Bitácora de Auditoría del Sistema
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Trazabilidad inmutable de todas las transacciones operativas, autorizaciones y cierres
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Bitácora activa ({auditLogs.length} eventos registrados)</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por acción, número de comprobante, usuario o detalle..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-medium"
        >
          {modules.map((m) => (
            <option key={m} value={m}>
              {m === 'TODOS' ? 'Todos los Módulos' : `Módulo: ${m}`}
            </option>
          ))}
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Fecha / Hora</th>
                <th className="px-4 py-3 font-semibold">Usuario Responsable</th>
                <th className="px-3 py-3 font-semibold">Rol</th>
                <th className="px-3 py-3 font-semibold">Módulo</th>
                <th className="px-4 py-3 font-semibold">Acción Realizada</th>
                <th className="px-3 py-3 font-semibold">Referencia</th>
                <th className="px-5 py-3 font-semibold">Detalles de la Operación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {log.date} <span className="text-slate-400">{log.time}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {log.userName}
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {log.role}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-medium text-slate-800">
                    {log.module}
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-700">
                    {log.action}
                  </td>
                  <td className="px-3 py-3 font-mono font-bold text-slate-700 text-[11px]">
                    {log.reference}
                  </td>
                  <td className="px-5 py-3 text-slate-600 leading-relaxed text-[11px] max-w-sm">
                    {log.details || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
