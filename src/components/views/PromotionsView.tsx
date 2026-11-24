import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tag, Plus, Edit2, X, AlertCircle, Calendar, Percent, DollarSign } from 'lucide-react';
import { Promotion } from '../../types';
import { ModuleHeader, StaggerSection, ModalShell } from '../ui/MotionPrimitives';
import { TiltCard3D } from '../ui/TiltCard3D';

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

  const activeCount = promotions.filter(
    (p) => p.status === 'ACTIVA' && p.endDate >= todayStr && p.startDate <= todayStr
  ).length;

  return (
    <div className="space-y-6">
      <ModuleHeader
        kicker="MOTOR PROMOCIONAL • CU-04"
        title="Campañas Promocionales & Descuentos"
        subtitle="Configuración de cupones comerciales, porcentajes, montos fijos y control estricto de vigencias"
        actions={
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Promoción</span>
          </button>
        }
      />

      {/* Summary Strip */}
      <StaggerSection className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-950 text-white p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Campañas Activas Hoy
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums mt-1 text-white">
              {activeCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Total Registradas
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums mt-1 text-zinc-950">
              {promotions.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Regla de Vigencia
            </span>
            <div className="text-xs font-semibold text-zinc-900 mt-1.5">
              Validación automática en POS
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </StaggerSection>

      {/* Promotions Cards Grid */}
      <StaggerSection delay={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {promotions.map((promo) => {
          const isExpired = promo.endDate < todayStr;
          const isUpcoming = promo.startDate > todayStr;
          const isEffectivelyActive = promo.status === 'ACTIVA' && !isExpired && !isUpcoming;

          return (
            <TiltCard3D
              key={promo.id}
              maxTilt={4}
              elevation={isEffectivelyActive ? 'subtle' : 'flat'}
              className={`rounded-xl border transition flex flex-col justify-between p-5 group ${
                isEffectivelyActive
                  ? 'bg-white border-zinc-200 hover:border-zinc-900'
                  : 'bg-zinc-50 border-zinc-200 opacity-85'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-zinc-950 text-white tracking-wider">
                    {promo.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePromotionStatus(promo.id)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded border transition cursor-pointer ${
                      promo.status === 'ACTIVA'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-zinc-200 text-zinc-600 border-zinc-300 hover:bg-zinc-300'
                    }`}
                  >
                    {promo.status}
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-zinc-950">{promo.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{promo.description}</p>
                </div>

                <div className="p-3.5 bg-zinc-50 rounded-lg space-y-2 text-xs border border-zinc-200/80">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Beneficio</span>
                    <span className="font-bold text-red-600 font-mono tabular-nums inline-flex items-center gap-1">
                      {promo.type === 'PORCENTAJE' ? (
                        <>
                          <Percent className="w-3.5 h-3.5" />
                          {promo.value}% Descuento
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-3.5 h-3.5" />
                          {storeSettings.currency} {promo.value.toFixed(2)} Fijo
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Compra Mínima</span>
                    <span className="font-mono tabular-nums font-semibold text-zinc-800">
                      {promo.minPurchaseAmount
                        ? `${storeSettings.currency} ${promo.minPurchaseAmount.toFixed(2)}`
                        : 'Sin mínimo'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Vigencia</span>
                    <span className="text-zinc-700 font-mono tabular-nums text-[11px]">
                      {promo.startDate} → {promo.endDate}
                    </span>
                  </div>
                </div>

                {isExpired && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Promoción vencida (Regla #2 bloquea su aplicación)</span>
                  </div>
                )}
              </div>

              <div className="pt-3.5 border-t border-zinc-100 flex items-center justify-between mt-4">
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
                  Alcance: <strong className="text-zinc-800">{promo.targetType}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(promo)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:text-red-600 hover:bg-zinc-100 rounded-lg transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>
            </TiltCard3D>
          );
        })}
      </StaggerSection>

      {/* Modal: Crear / Editar Promoción */}
      <ModalShell isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidthClass="max-w-md">
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-red-500 block">
              Gestión de Campaña
            </span>
            <h3 className="text-sm font-bold">
              {editingPromoId ? 'Editar Promoción' : 'Crear Nueva Promoción'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="text-zinc-400 hover:text-white p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Código de Cupón *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                placeholder="SPRING20"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Tipo de Descuento</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PORCENTAJE' | 'MONTO_FIJO' | 'CONDICION' })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              >
                <option value="PORCENTAJE">Porcentaje (%)</option>
                <option value="MONTO_FIJO">Monto Fijo ({storeSettings.currency})</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Nombre Comercial *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Descuento Primavera 20%"
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Valor del Descuento *</label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Compra Mínima ({storeSettings.currency})
              </label>
              <input
                type="number"
                step="1"
                value={formData.minPurchaseAmount}
                onChange={(e) =>
                  setFormData({ ...formData, minPurchaseAmount: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Fecha de Inicio</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Fecha de Expiración</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Descripción / Regla</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalles y condiciones de uso..."
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition"
            >
              Guardar Promoción
            </button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
};
