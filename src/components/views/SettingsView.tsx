import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, RefreshCw, Store, CheckCircle } from 'lucide-react';
import { StoreSettings } from '../../types';

export const SettingsView: React.FC = () => {
  const { storeSettings, resetAllData, addToast } = useApp();

  const [formData, setFormData] = useState<StoreSettings>({ ...storeSettings });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ns_settings', JSON.stringify(formData));
    addToast('success', 'Configuración Guardada', 'Se actualizaron los parámetros generales de la tienda.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Configuración General del Sistema
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Parámetros fiscales, datos de facturación electrónica SUNAT y preferencias de la tienda
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-slate-900 text-sm">
            <Store className="w-4 h-4 text-blue-600" />
            <span>Datos de la Empresa / Tienda Departamental</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Razón Social *
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nombre Comercial *
              </label>
              <input
                type="text"
                required
                value={formData.commercialName}
                onChange={(e) => setFormData({ ...formData, commercialName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                RUC *
              </label>
              <input
                type="text"
                required
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Dirección Fiscal / Sede Central
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Settings className="w-4 h-4 text-blue-600" />
            <span>Parámetros de Facturación & Moneda</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Símbolo de Moneda
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-center"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tasa de IGV / Impuesto (ej: 0.18 = 18%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0.18 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Serie Boleta Electrónica
              </label>
              <input
                type="text"
                value={formData.ticketPrefix}
                onChange={(e) => setFormData({ ...formData, ticketPrefix: e.target.value.toUpperCase() })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-center"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Serie Factura Electrónica
              </label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value.toUpperCase() })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-center"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Está seguro de restaurar toda la base de datos a sus valores iniciales de prueba?')) {
                  resetAllData();
                }
              }}
              className="px-4 py-2.5 bg-slate-100 text-rose-600 font-semibold rounded-xl hover:bg-rose-50 border border-slate-200 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restablecer Datos Iniciales de Prueba</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
