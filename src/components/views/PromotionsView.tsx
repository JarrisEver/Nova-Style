import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tag, Plus, CheckCircle, XCircle, Edit2, Calendar, X, AlertCircle } from 'lucide-react';
import { Promotion } from '../../types';

export const PromotionsView: React.FC = () => {
  const { promotions, savePromotion, togglePromotionStatus, storeSettings, addToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    type: 'PORCENTAJE' | 'MONTO_FIJO' | 'CONDICION';
    value: number;
    targetType: 'GENERAL' | 'CATEGORIA' | 'MARCA' | 'PRODUCTO';
    minPurchaseAmount: number;
    startDate: string;
    endDate: string;
    status: 'ACTIVA' | 'INACTIVA';
    description: string;
  }>({
    code: '',
    name: '',
    type: 'PORCENTAJE',
    value: 10,
    targetType: 'GENERAL',
    minPurchaseAmount: 100,
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    status: 'ACTIVA',
    description: '',
  });

  const handleOpenCreateModal = () => {
    setEditingPromoId(null);
    setFormData({
      code: 'PROMO' + Math.floor(100 + Math.random() * 900),
      name: '',
      type: 'PORCENTAJE',
      value: 15,
      targetType: 'GENERAL',
      minPurchaseAmount: 120,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-11-30',
      status: 'ACTIVA',
      description: 'Descuento especial por temporada',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promo: Promotion) => {
    setEditingPromoId(promo.id);
    setFormData({
      code: promo.code,
      name: promo.name,
      type: promo.type,
      value: promo.value,
      targetType: promo.targetType,
      minPurchaseAmount: promo.minPurchaseAmount || 0,
      startDate: promo.startDate,
      endDate: promo.endDate,
      status: promo.status,
      description: promo.description,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      addToast('error', 'Campos requeridos', 'Ingrese código y nombre.');
      return;
    }

    savePromotion({
      id: editingPromoId || undefined,
      code: formData.code.toUpperCase(),
      name: formData.name,
      type: formData.type,
      value: Number(formData.value),
      targetType: formData.targetType,
      minPurchaseAmount: Number(formData.minPurchaseAmount),
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      description: formData.description,
    });

    setIsModalOpen(false);
  };

  const todayStr = '2026-09-28';

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Campañas Promocionales & Descuentos (CU-04)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuración de cupones, porcentajes, montos fijos y validación de vigencias
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Promoción</span>
        </button>
      </div>

      {/* Promotions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map((promo) => {
          const isExpired = promo.endDate < todayStr;
          const isUpcoming = promo.startDate > todayStr;
          const isEffectivelyActive = promo.status === 'ACTIVA' && !isExpired && !isUpcoming;

          return (
            <div
              key={promo.id}
              className={`p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between ${
                isEffectivelyActive
                  ? 'bg-white border-slate-200 hover:border-blue-400'
                  : 'bg-slate-50 border-slate-200 opacity-80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {promo.code}
                  </span>
                  <button
                    onClick={() => togglePromotionStatus(promo.id)}
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition ${
                      promo.status === 'ACTIVA'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                    }`}
                  >
                    {promo.status}
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{promo.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{promo.description}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Beneficio:</span>
                    <span className="font-bold text-blue-700">
                      {promo.type === 'PORCENTAJE'
                        ? `${promo.value}% de Descuento`
                        : `${storeSettings.currency} ${promo.value.toFixed(2)} Descuento Fijo`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Compra Mínima:</span>
                    <span className="font-mono text-slate-700">
                      {promo.minPurchaseAmount
                        ? `${storeSettings.currency} ${promo.minPurchaseAmount.toFixed(2)}`
                        : 'Sin mínimo'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vigencia:</span>
                    <span className="text-slate-600 font-mono text-[11px]">
                      {promo.startDate} al {promo.endDate}
                    </span>
                  </div>
                </div>

                {isExpired && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Promoción vencida (Regla #2 bloquea su uso)</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                <span className="text-[10px] text-slate-400">Alcance: {promo.targetType}</span>
                <button
                  onClick={() => handleOpenEditModal(promo)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Crear / Editar Promoción */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingPromoId ? 'Editar Promoción' : 'Crear Nueva Promoción'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código de Cupón *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold uppercase"
                    placeholder="SPRING20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Descuento</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="PORCENTAJE">Porcentaje (%)</option>
                    <option value="MONTO_FIJO">Monto Fijo (S/)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Comercial *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Descuento Primavera 20%"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor del Descuento *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Compra Mínima (S/)</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.minPurchaseAmount}
                    onChange={(e) => setFormData({ ...formData, minPurchaseAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Expiración</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción / Regla</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles y condiciones de uso..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Guardar Promoción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
