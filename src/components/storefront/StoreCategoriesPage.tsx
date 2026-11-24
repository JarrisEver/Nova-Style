import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { TiltCard3D } from '../ui/TiltCard3D';
import { SafeImage } from '../ui/MotionPrimitives';
import { ArrowRight } from 'lucide-react';

export const StoreCategoriesPage: React.FC = () => {
  const { categories, products, storeSettings } = useApp();
  const navigate = useNavigate();

  const activeCategories = categories.filter((c) => c.status === 'ACTIVA');
  const activeProducts = products.filter((p) => p.status === 'ACTIVO');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <div className="pb-6 border-b border-zinc-200">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">
          Curaduría por Departamento
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-zinc-950 mt-1">
          Categorías NOVAStyle
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-2xl">
          Explora nuestras líneas de vestimenta, calzado y marroquinería seleccionadas para cada ocasión.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCategories.map((cat) => {
          const catProducts = activeProducts.filter((p) => p.category === cat.name);
          const minPrice =
            catProducts.length > 0 ? Math.min(...catProducts.map((p) => p.price)) : 0;

          return (
            <TiltCard3D
              key={cat.id}
              elevation="subtle"
              maxTilt={5}
              onClick={() => navigate(`/productos?categoria=${encodeURIComponent(cat.name)}`)}
              className="cursor-pointer group bg-white rounded-2xl border border-zinc-200 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[16/10] bg-zinc-950 overflow-hidden">
                <SafeImage
                  src={cat.image}
                  alt={cat.name}
                  fallbackTitle={cat.name}
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/20 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-red-400 tabular-nums">
                      {catProducts.length} {catProducts.length === 1 ? 'producto' : 'productos'}
                    </div>
                    <h2 className="font-editorial text-2xl font-bold">{cat.name}</h2>
                  </div>
                  {minPrice > 0 && (
                    <span className="text-xs font-mono font-bold text-zinc-200 tabular-nums">
                      Desde {storeSettings.currency} {minPrice.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-zinc-600 leading-relaxed">{cat.description}</p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 group-hover:translate-x-1 transition-transform">
                  <span>Explorar departamento</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </TiltCard3D>
          );
        })}
      </div>
    </div>
  );
};
