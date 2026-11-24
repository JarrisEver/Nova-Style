import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { TiltCard3D } from '../ui/TiltCard3D';
import { Tag, Copy, Check, ArrowRight, Calendar } from 'lucide-react';

export const StorePromotionsPage: React.FC = () => {
  const { promotions, storeSettings, setAppliedPromoCode, addToast } = useApp();
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const validPromotions = promotions.filter(
    (p) => p.status === 'ACTIVA' && p.startDate <= todayStr && p.endDate >= todayStr
  );

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => undefined);
    }
    setCopiedCode(code);
    addToast('info', 'Código copiado', `Cupón ${code} listo para usar en tu bolsa.`);
    setTimeout(() => setCopiedCode(null), 2200);
  };

  const handleApplyAndShop = (code: string, targetType: string, targetValue?: string) => {
    setAppliedPromoCode(code);
    addToast('success', 'Cupón pre-aplicado', `El código ${code} se aplicará en tu bolsa.`);
    if (targetType === 'CATEGORIA' && targetValue) {
      navigate(`/productos?categoria=${encodeURIComponent(targetValue)}`);
    } else {
      navigate('/productos');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <div className="pb-6 border-b border-zinc-200">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">
          Beneficios Vigentes
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-zinc-950 mt-1">
          Promociones & Cupones
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-2xl">
          Códigos promocionales oficiales validados en tiempo real al confirmar tu pedido online.
        </p>
      </div>

      {validPromotions.length === 0 ? (
        <div className="p-12 text-center bg-zinc-50 rounded-2xl border border-zinc-200 text-sm text-zinc-500">
          No hay campañas promocionales activas en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {validPromotions.map((promo) => {
            const discountLabel =
              promo.type === 'PORCENTAJE'
                ? `${promo.value}% OFF`
                : `${storeSettings.currency} ${promo.value.toFixed(0)} OFF`;

            return (
              <TiltCard3D
                key={promo.id}
                elevation="subtle"
                maxTilt={4}
                className="bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold font-mono text-red-600">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{discountLabel}</span>
                    </span>
                    <span className="text-[11px] font-medium text-zinc-500">
                      {promo.targetType === 'GENERAL'
                        ? 'Toda la tienda'
                        : promo.targetValue || promo.targetType}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-zinc-950 leading-snug">
                    {promo.name}
                  </h2>
                  <p className="text-xs text-zinc-600 leading-relaxed">{promo.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500 pt-1">
                    {promo.minPurchaseAmount ? (
                      <span className="font-mono tabular-nums">
                        Mínimo: {storeSettings.currency} {promo.minPurchaseAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span>Sin mínimo de compra</span>
                    )}
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Calendar className="w-3 h-3" />
                      <span>Hasta {promo.endDate}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 space-y-2.5">
                  <div className="flex items-center justify-between px-3 py-2 bg-zinc-950 text-white rounded-lg">
                    <span className="font-mono text-xs font-bold tracking-wider text-red-400">
                      {promo.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(promo.code)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-300 hover:text-white transition"
                    >
                      {copiedCode === promo.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyAndShop(promo.code, promo.targetType, promo.targetValue)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition"
                  >
                    <span>Aplicar y Explorar Prendas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </TiltCard3D>
            );
          })}
        </div>
      )}
    </div>
  );
};
