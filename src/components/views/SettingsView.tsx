import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, RefreshCw, Store, AlertTriangle } from 'lucide-react';
import { StoreSettings } from '../../types';
import { ModuleHeader, StaggerSection } from '../ui/MotionPrimitives';

export const SettingsView: React.FC = () => {
  const { storeSettings, resetAllData, addToast } = useApp();

  const [formData, setFormData] = useState<StoreSettings>({ ...storeSettings });
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ns_settings', JSON.stringify(formData));
    addToast(
      'success',
      'Configuración Guardada',
      'Se actualizaron los parámetros generales de la tienda.'
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <ModuleHeader
        kicker="PARÁMETROS DE EMPRESA • SUNAT"
        title="Configuración General del Sistema"
        subtitle="Parámetros fiscales, series de facturación electrónica, moneda oficial y mantenimiento de datos"
      />

      <StaggerSection className="bg-white p-6 rounded-xl border border-zinc-200 shadow-xs space-y-6">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 font-bold text-zinc-950 text-sm">
            <Store className="w-4 h-4 text-red-600" />
            <span>Datos de la Empresa / Tienda Departamental</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Razón Social *</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Nombre Comercial *</label>
              <input
                type="text"
                required
                value={formData.commercialName}
                onChange={(e) => setFormData({ ...formData, commercialName: e.target.value })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-bold text-zinc-950 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">RUC *</label>
              <input
                type="text"
                required
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Teléfono de Contacto</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              Dirección Fiscal / Sede Central
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
            />
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center gap-2 font-bold text-zinc-950 text-sm">
            <Settings className="w-4 h-4 text-red-600" />
            <span>Parámetros de Facturación & Moneda</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Símbolo de Moneda</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-bold font-mono text-center focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Tasa de IGV (ej: 0.18 = 18%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0.18 })
                }
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono tabular-nums text-center font-bold focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Serie Boleta Electrónica
              </label>
              <input
                type="text"
                value={formData.ticketPrefix}
                onChange={(e) =>
                  setFormData({ ...formData, ticketPrefix: e.target.value.toUpperCase() })
                }
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Serie Factura Electrónica
              </label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) =>
                  setFormData({ ...formData, invoicePrefix: e.target.value.toUpperCase() })
                }
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-zinc-100">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-4 py-2.5 bg-zinc-100 text-red-600 font-semibold rounded-lg hover:bg-red-50 border border-zinc-200 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restablecer Datos Iniciales de Prueba</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="text-[11px] font-semibold text-red-800">
                  ¿Restaurar toda la base local?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    resetAllData();
                    setConfirmReset(false);
                  }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[11px] transition"
                >
                  Confirmar Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-700 font-semibold rounded text-[11px] hover:bg-zinc-50 transition"
                >
                  Cancelar
                </button>
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </StaggerSection>
    </div>
  );
};
