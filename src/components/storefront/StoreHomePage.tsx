import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'motion/react';
import { useApp } from '../../context/AppContext';
import { BRAND_MEDIA } from '../../assets/media';
import { TiltCard3D } from '../ui/TiltCard3D';
import { SafeImage, StaggerSection } from '../ui/MotionPrimitives';
import {
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const StoreHomePage: React.FC = () => {
  const { products, categories, promotions, storeSettings, addToCart } = useApp();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const heroRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 130, damping: 24 };
  const imgX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig);
  const imgY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-10, 10]), springConfig);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleHeroMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const activeProducts = products.filter((p) => p.status === 'ACTIVO');
  const featuredProducts = activeProducts.slice(0, 8);
  const activeCategories = categories.filter((c) => c.status === 'ACTIVA');

  const todayStr = new Date().toISOString().split('T')[0];
  const featuredPromo = promotions.find(
    (p) => p.status === 'ACTIVA' && p.startDate <= todayStr && p.endDate >= todayStr
  );

  return (
    <div className="bg-white">
      {/* SECTION 1: CINEMATIC PARALLAX EDITORIAL HERO */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative bg-zinc-950 text-white overflow-hidden border-b border-zinc-800"
      >
        <motion.div
          style={shouldReduceMotion ? undefined : { x: imgX, y: imgY, scale: 1.05 }}
          className="absolute inset-0 pointer-events-none"
        >
          <SafeImage
            src={BRAND_MEDIA.heroEditorialAutumn}
            alt="NOVAStyle Colección Editorial"
            className="w-full h-full object-cover object-center opacity-70"
          />
        </motion.div>

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/75 to-red-950/40 pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-red-500">
              Colección Primavera — Verano 2026
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.04] tracking-tight">
              Sastrería urbana y diseño que{' '}
              <span className="italic font-normal text-red-500">define tu estilo</span>.
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 max-w-xl leading-relaxed">
              Prendas seleccionadas en algodón pima peruano, denim de autor y calzado técnico. Stock confirmado en tiempo real y despacho inmediato.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/productos"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_14px_30px_-8px_rgba(220,38,38,0.65)] transition whitespace-nowrap"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/promociones"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-zinc-900/80 hover:bg-zinc-800 border border-white/15 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap"
              >
                <Tag className="w-4 h-4 text-red-500" />
                <span>Ver Promociones</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 hidden sm:block perspective-1400">
            <TiltCard3D
              elevation="high"
              maxTilt={8}
              onClick={() => navigate('/productos')}
              className="cursor-pointer rounded-2xl overflow-hidden border border-white/15 bg-zinc-900/90"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <SafeImage
                  src={BRAND_MEDIA.loginAtelierShowcase}
                  alt="Editorial Lookbook NOVAStyle"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                      Lookbook Exclusivo
                    </div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {activeProducts.length} Prendas en Stock
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-white">
                    <span>Ver colección</span>
                    <ArrowRight className="w-3.5 h-3.5 text-red-500" />
                  </span>
                </div>
              </div>
            </TiltCard3D>
          </div>
        </div>
      </section>

      {/* SECTION 2: DEPARTAMENTOS / CATEGORÍAS 3D */}
      <StaggerSection>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">
                Departamentos
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-950 mt-1">
                Explora por Categoría
              </h2>
            </div>
            <Link
              to="/categorias"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-red-600 transition whitespace-nowrap"
            >
              <span>Ver todas las categorías</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {activeCategories.map((cat) => {
              const count = activeProducts.filter((p) => p.category === cat.name).length;
              return (
                <TiltCard3D
                  key={cat.id}
                  elevation="subtle"
                  maxTilt={6}
                  onClick={() => navigate(`/productos?categoria=${encodeURIComponent(cat.name)}`)}
                  className="cursor-pointer group rounded-xl overflow-hidden border border-zinc-200 bg-zinc-950 text-white"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <SafeImage
                      src={cat.image}
                      alt={cat.name}
                      fallbackTitle={cat.name}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-[10px] font-mono text-red-400 tabular-nums">
                        {count} {count === 1 ? 'diseño' : 'diseños'}
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">{cat.name}</h3>
                    </div>
                  </div>
                </TiltCard3D>
              );
            })}
          </div>
        </section>
      </StaggerSection>

      {/* SECTION 3: FEATURED PRODUCTS 3D GRID */}
      <StaggerSection delay={0.05}>
        <section className="bg-zinc-50 border-y border-zinc-200 py-14 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">
                  Selección Curada
                </div>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-950 mt-1">
                  Novedades de Temporada
                </h2>
              </div>
              <Link
                to="/productos"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-900 hover:text-red-600 transition whitespace-nowrap"
              >
                <span>Ver catálogo completo ({activeProducts.length})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product) => {
                const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
                const firstAvailable = product.variants.find((v) => v.stock > 0);

                return (
                  <TiltCard3D
                    key={product.id}
                    elevation="subtle"
                    maxTilt={5}
                    className="bg-white rounded-xl border border-zinc-200 overflow-hidden flex flex-col group"
                  >
                    <Link to={`/productos/${product.id}`} className="relative aspect-[4/5] bg-zinc-100 overflow-hidden block">
                      <SafeImage
                        src={product.image}
                        alt={product.name}
                        fallbackTitle={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-zinc-950/85 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                        {product.brand}
                      </div>
                      {totalStock === 0 && (
                        <div className="absolute inset-0 bg-zinc-950/60 flex items-center justify-center">
                          <span className="px-3 py-1 bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider rounded">
                            Agotado
                          </span>
                        </div>
                      )}
                    </Link>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="text-[11px] font-medium text-zinc-500">
                          {product.category} · {product.subcategory}
                        </div>
                        <Link
                          to={`/productos/${product.id}`}
                          className="text-sm font-bold text-zinc-950 hover:text-red-600 transition mt-0.5 line-clamp-1 block"
                        >
                          {product.name}
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                        <span className="text-base font-extrabold font-mono text-zinc-950 tabular-nums">
                          {storeSettings.currency} {product.price.toFixed(2)}
                        </span>

                        {firstAvailable ? (
                          <button
                            type="button"
                            onClick={() =>
                              addToCart(
                                {
                                  productId: product.id,
                                  productName: product.name,
                                  brand: product.brand,
                                  category: product.category,
                                  image: product.image,
                                  variantId: firstAvailable.id,
                                  variantDesc: `${firstAvailable.size} / ${firstAvailable.color}`,
                                  sku: firstAvailable.sku,
                                  unitPrice: product.price,
                                },
                                1
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-red-600 text-white text-[11px] font-bold rounded-lg transition whitespace-nowrap"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Agregar</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-zinc-400">Sin stock</span>
                        )}
                      </div>
                    </div>
                  </TiltCard3D>
                );
              })}
            </div>
          </div>
        </section>
      </StaggerSection>

      {/* SECTION 4: PROMOTION BANNER & SERVICE GUARANTEES */}
      <StaggerSection delay={0.1}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 space-y-10">
          <div className="rounded-2xl bg-zinc-950 text-white overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-zinc-800">
            <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-4">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-red-500">
                <Sparkles className="w-4 h-4" />
                <span>Beneficio Exclusivo Online</span>
              </div>
              <h2 className="font-editorial text-2xl sm:text-4xl font-bold leading-tight">
                {featuredPromo
                  ? featuredPromo.name
                  : 'Descuentos de temporada en toda la colección'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-lg leading-relaxed">
                {featuredPromo
                  ? featuredPromo.description
                  : 'Aprovecha nuestros códigos promocionales vigentes directamente en tu bolsa de compras.'}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {featuredPromo && (
                  <div className="px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 font-mono text-sm font-bold text-red-400 tracking-wider">
                    {featuredPromo.code}
                  </div>
                )}
                <Link
                  to="/promociones"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition whitespace-nowrap"
                >
                  <span>Ver todas las promociones</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 relative min-h-[240px]">
              <SafeImage
                src={BRAND_MEDIA.showcaseDualHero}
                alt="NOVAStyle Promociones"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl border border-zinc-200 bg-white flex items-start gap-3.5">
              <Truck className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-zinc-950">Despacho Express en Lima</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Envío sin costo desde {storeSettings.currency} 299.00 con seguimiento paso a paso.
                </p>
              </div>
            </div>
            <div className="p-5 rounded-xl border border-zinc-200 bg-white flex items-start gap-3.5">
              <RefreshCw className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-zinc-950">Cambios en Tienda y Online</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Hasta 7 días para cambios de talla o color presentando tu comprobante.
                </p>
              </div>
            </div>
            <div className="p-5 rounded-xl border border-zinc-200 bg-white flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-zinc-950">Stock 100% Verificado</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Disponibilidad sincronizada directamente con nuestro almacén central.
                </p>
              </div>
            </div>
          </div>
        </section>
      </StaggerSection>
    </div>
  );
};
