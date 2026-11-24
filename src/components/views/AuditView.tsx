import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Search } from 'lucide-react';
import { ModuleHeader, StaggerSection } from '../ui/MotionPrimitives';

export const AuditView: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('TODOS');

  const modules = [
    'TODOS',
    'Ventas',
    'Caja',
    'Inventario',
    'Compras',
    'Devoluciones',
    'Productos',
    'Promociones',
    'Usuarios',
    'Seguridad',
  ];

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
    <div className="space-y-6">
      <ModuleHeader
        kicker="TRAZABILIDAD INMUTABLE • AUDITORÍA"
        title="Bitácora de Auditoría del Sistema"
        subtitle="Registro cronológico de transacciones operativas, autorizaciones, cierres de caja y movimientos"
        actions={
          <div className="flex items-center gap-2 bg-zinc-950 text-white px-3.5 py-2 rounded-lg text-xs font-semibold border border-zinc-800 whitespace-nowrap shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Bitácora activa (<span className="font-mono tabular-nums">{auditLogs.length}</span> eventos)
            </span>
          </div>
        }
      />

      {/* Filter Bar */}
      <StaggerSection className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por acción, número de comprobante, usuario o detalle..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
          />
        </div>

        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 text-zinc-800 font-semibold"
        >
          {modules.map((m) => (
            <option key={m} value={m}>
              {m === 'TODOS' ? 'Todos los Módulos' : `Módulo: ${m}`}
            </option>
          ))}
        </select>
      </StaggerSection>

      {/* Audit Log Table */}
      <StaggerSection delay={0.08} className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-300 border-b border-zinc-800">
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
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50 transition">
                  <td className="px-4 py-3 font-mono tabular-nums text-[11px] text-zinc-600 whitespace-nowrap">
                    {log.date} <span className="text-zinc-400">{log.time}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-zinc-950">{log.userName}</td>
                  <td className="px-3 py-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {log.role}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-medium text-zinc-800">{log.module}</td>
                  <td className="px-4 py-3 font-semibold text-red-600">{log.action}</td>
                  <td className="px-3 py-3 font-mono tabular-nums font-bold text-zinc-900 text-[11px]">
                    {log.reference}
                  </td>
                  <td className="px-5 py-3 text-zinc-600 leading-relaxed text-[11px] max-w-sm">
                    {log.details || '—'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    No existen registros de auditoría para este criterio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </StaggerSection>
    </div>
  );
};
