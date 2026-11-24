import React, { useState, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'motion/react';
import { useApp } from '../../context/AppContext';
import { BRAND_MEDIA } from '../../assets/media';
import { BrandLogo } from '../ui/BrandLogo';
import { TiltCard3D } from '../ui/TiltCard3D';
import { StaggerSection, SafeImage } from '../ui/MotionPrimitives';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  PackageCheck,
  Users,
  AlertTriangle,
  Truck,
  ArrowUpRight,
  Eye,
  BarChart3,
  ShoppingCart,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from 'recharts';
import { ReceiptModal } from '../common/ReceiptModal';
import { Sale } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    sales,
    products,
    clients,
    onlineOrders,
    purchaseOrders,
    inventoryMovements,
    storeSettings,
    setActiveView,
  } = useApp();

  const shouldReduceMotion = useReducedMotion();
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);

  // Subtle Hero 3D Mouse Parallax
  const heroRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 140, damping: 22 };
  const imgX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);
  const imgY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), springConfig);

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

  // 1. KPI Calculations
  const todayStr = '2026-09-28';
  const todaySalesList = sales.filter((s) => s.date === todayStr);
  const todaySalesTotal = todaySalesList.reduce((acc, s) => acc + s.total, 0);

  const monthSalesList = sales.filter((s) => s.date.startsWith('2026-09'));
  const monthSalesTotal = monthSalesList.reduce((acc, s) => acc + s.total, 0);

  const totalProductsSold = sales.reduce(
    (acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );

  const monthPurchasesTotal = purchaseOrders
    .filter((po) => po.date.startsWith('2026-09') && po.status !== 'CANCELADA')
    .reduce((acc, po) => acc + po.total, 0);

  const lowStockVariants = products.flatMap((p) =>
    p.variants
      .filter((v) => v.stock <= v.minStock)
      .map((v) => ({
        productId: p.id,
        productName: p.name,
        code: p.code,
        variantDesc: `${v.size} / ${v.color}`,
        sku: v.sku,
        stock: v.stock,
        minStock: v.minStock,
        status: v.stock === 0 ? 'Agotado' : 'Stock bajo',
      }))
  );

  // 2. Chart Data: Ventas por día
  const salesByDayMap: { [date: string]: number } = {};
  ['2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27', '2026-09-28'].forEach(
    (d) => {
      salesByDayMap[d] = 0;
    }
  );

  sales.forEach((s) => {
    if (salesByDayMap[s.date] !== undefined) {
      salesByDayMap[s.date] += s.total;
    }
  });

  const salesByDayData = Object.keys(salesByDayMap).map((date) => {
    const day = date.split('-')[2];
    return {
      day: `${day} Sep`,
      monto: Number(salesByDayMap[date].toFixed(2)),
    };
  });

  // 3. Chart Data: Ventas por categoría
  const categorySalesMap: { [cat: string]: number } = {};
  sales.forEach((s) => {
    s.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const cat = prod?.category || 'Otros';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + item.subtotal;
    });
  });

  const categoryChartData = Object.keys(categorySalesMap).map((cat) => ({
    name: cat,
    total: Number(categorySalesMap[cat].toFixed(2)),
  }));

  const CATEGORY_COLORS = ['#DC2626', '#18181B', '#52525B', '#991B1B', '#A1A1AA', '#EF4444'];

  // 4. Chart Data: Productos más vendidos
  const productSalesMap: { [name: string]: { qty: number; total: number } } = {};
  sales.forEach((s) => {
    s.items.forEach((it) => {
      if (!productSalesMap[it.productName]) {
        productSalesMap[it.productName] = { qty: 0, total: 0 };
      }
      productSalesMap[it.productName].qty += it.quantity;
      productSalesMap[it.productName].total += it.subtotal;
    });
  });

  const topProductsChartData = Object.keys(productSalesMap)
    .map((name) => ({
      name: name.length > 18 ? name.slice(0, 16) + '...' : name,
      fullName: name,
      unidades: productSalesMap[name].qty,
      monto: Number(productSalesMap[name].total.toFixed(2)),
    }))
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, 5);

  // 5. Chart Data: Estado del Inventario
  let totalAvailable = 0;
  let totalLow = 0;
  let totalOut = 0;
  products.forEach((p) => {
    p.variants.forEach((v) => {
      if (v.stock === 0) totalOut++;
      else if (v.stock <= v.minStock) totalLow++;
      else totalAvailable++;
    });
  });

  const inventoryStatusData = [
    { name: 'Disponible', value: totalAvailable, color: '#18181B' },
    { name: 'Stock Bajo', value: totalLow, color: '#D97706' },
    { name: 'Agotado', value: totalOut, color: '#DC2626' },
  ];

  const pendingOnlineCount = onlineOrders.filter((o) => o.status === 'PENDIENTE').length;

  return (
    <div className="space-y-6">
      {/* CINEMATIC 3D FASHION EDITORIAL HERO */}
      <StaggerSection>
        <div
          ref={heroRef}
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
          className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 text-white shadow-[0_24px_54px_-16px_rgba(9,9,11,0.45)]"
        >
          {/* Parallax Fashion Backdrop */}
          <motion.div
            style={shouldReduceMotion ? undefined : { x: imgX, y: imgY, scale: 1.04 }}
            className="absolute inset-0 pointer-events-none"
          >
            <SafeImage
              src={BRAND_MEDIA.heroEditorialAutumn}
              alt="NOVAStyle Editorial Fashion Showcase"
              className="w-full h-full object-cover object-center opacity-70"
            />
          </motion.div>

          {/* Editorial Obsidian & Crimson Gradient Scrim */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-red-950/35 pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-zinc-950/90 to-transparent pointer-events-none"
          />

          <div className="relative z-10 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Editorial Narrative & CTAs */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-4">
                <BrandLogo variant="light" size="md" showSubtitle={false} animateEntrance />
                <span className="h-4 w-px bg-zinc-700 hidden sm:inline-block" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400">
                  Colección & Operación en Vivo
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="font-editorial text-3xl sm:text-4xl xl:text-[42px] font-bold leading-[1.08] tracking-tight text-white">
                  Control Comercial <span className="italic font-normal text-red-500">NOVAStyle</span>
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
                  Supervisión ejecutiva de ventas presenciales, inventario multivariante y pedidos
                  omnicanal en {storeSettings.storeName}.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => setActiveView('pos')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-[0_12px_26px_-8px_rgba(220,38,38,0.7)] active:scale-[0.98] transition whitespace-nowrap"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Ir al Punto de Venta (POS)</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveView('reports')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-100 border border-white/15 text-xs font-semibold rounded-lg transition whitespace-nowrap"
                >
                  <BarChart3 className="w-4 h-4 text-red-400" />
                  <span>Reportes Ejecutivos</span>
                </button>
              </div>
            </div>

            {/* Right 3D Floating Depth Cards */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3.5 perspective-1400">
              <TiltCard3D
                elevation="high"
                maxTilt={7}
                onClick={() => setActiveView('pos')}
                className="cursor-pointer rounded-xl bg-zinc-900/85 border border-white/15 p-4 backdrop-blur-md group"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Facturación Hoy</span>
                  <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                </div>
                <div className="mt-2 text-2xl font-extrabold font-mono text-white tabular-nums">
                  {storeSettings.currency} {todaySalesTotal.toFixed(2)}
                </div>
                <div className="mt-1.5 text-[11px] text-zinc-400 tabular-nums">
                  {todaySalesList.length} comprobantes emitidos
                </div>
              </TiltCard3D>

              <TiltCard3D
                elevation="high"
                maxTilt={7}
                onClick={() => setActiveView('online-orders')}
                className="cursor-pointer rounded-xl bg-zinc-900/85 border border-white/15 p-4 backdrop-blur-md group"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Omnicanal Online</span>
                  <ShoppingBag className="w-3.5 h-3.5 text-red-500" />
                </div>
                <div className="mt-2 text-2xl font-extrabold font-mono text-white tabular-nums">
                  {onlineOrders.length} pedidos
                </div>
                <div className="mt-1.5 text-[11px] text-red-400 font-medium tabular-nums">
                  {pendingOnlineCount} por despachar
                </div>
              </TiltCard3D>
            </div>
          </div>
        </div>
      </StaggerSection>

      {/* PRIMARY 3D KPI CARDS GRID */}
      <StaggerSection delay={0.05}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <TiltCard3D elevation="subtle" className="bg-white p-5 rounded-xl border border-zinc-200 group">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Ventas de Hoy
                </span>
                <div className="text-2xl font-extrabold font-mono text-zinc-950 mt-1.5 tabular-nums">
                  {storeSettings.currency} {todaySalesTotal.toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1.5 tabular-nums">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{todaySalesList.length} transacciones registradas</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </TiltCard3D>

          <TiltCard3D elevation="subtle" className="bg-white p-5 rounded-xl border border-zinc-200 group">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Ventas del Mes
                </span>
                <div className="text-2xl font-extrabold font-mono text-zinc-950 mt-1.5 tabular-nums">
                  {storeSettings.currency} {monthSalesTotal.toFixed(2)}
                </div>
                <div className="text-[11px] text-zinc-600 font-medium flex items-center gap-1 mt-1.5 tabular-nums">
                  <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                  <span>Meta mensual: 84% alcanzado</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </TiltCard3D>

          <TiltCard3D elevation="subtle" className="bg-white p-5 rounded-xl border border-zinc-200 group">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Pedidos Online
                </span>
                <div className="text-2xl font-extrabold font-mono text-zinc-950 mt-1.5 tabular-nums">
                  {onlineOrders.length}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1.5 tabular-nums">
                  {pendingOnlineCount} pendientes de despacho
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
          </TiltCard3D>

          <TiltCard3D elevation="subtle" className="bg-white p-5 rounded-xl border border-zinc-200 group">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Alertas de Stock
                </span>
                <div className="text-2xl font-extrabold font-mono text-red-600 mt-1.5 tabular-nums">
                  {lowStockVariants.length}
                </div>
                <div className="text-[11px] text-amber-700 font-medium flex items-center gap-1 mt-1.5 tabular-nums">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{totalOut} variantes agotadas</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </TiltCard3D>
        </div>
      </StaggerSection>

      {/* SECONDARY METRICS STRIP */}
      <StaggerSection delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-800 shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-zinc-500">Prendas Vendidas</div>
              <div className="text-lg font-extrabold font-mono text-zinc-950 tabular-nums">
                {totalProductsSold} unidades
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-800 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-zinc-500">Clientes Registrados</div>
              <div className="text-lg font-extrabold font-mono text-zinc-950 tabular-nums">
                {clients.length} clientes
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-zinc-100 text-zinc-800 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-zinc-500">Compras del Mes</div>
              <div className="text-lg font-extrabold font-mono text-zinc-950 tabular-nums">
                {storeSettings.currency} {monthPurchasesTotal.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </StaggerSection>

      {/* ANALYTICS CHARTS */}
      <StaggerSection delay={0.15}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Ventas por día */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-950">Ventas por Día (Últimos 7 días)</h2>
                <p className="text-xs text-zinc-500">Facturación presencial y electrónica</p>
              </div>
              <span className="text-xs font-mono font-semibold text-red-600">
                {storeSettings.currency}
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesByDayData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="crimsonSalesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#52525B' }} stroke="#D4D4D8" />
                  <YAxis tick={{ fontSize: 11, fill: '#52525B' }} stroke="#D4D4D8" />
                  <Tooltip
                    formatter={(value: any) => [`${storeSettings.currency} ${Number(value).toFixed(2)}`, 'Ventas']}
                    contentStyle={{
                      backgroundColor: '#09090B',
                      border: '1px solid #27272A',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#FFFFFF', fontWeight: 700, marginBottom: '2px' }}
                    itemStyle={{ color: '#FCA5A5', fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="monto"
                    stroke="#DC2626"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#crimsonSalesGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Ventas por Categoría */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-950">Ventas por Categoría</h2>
                <p className="text-xs text-zinc-500">Distribución de ingresos por departamento</p>
              </div>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={76}
                    paddingAngle={4}
                    dataKey="total"
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name || ''} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`
                    }
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${storeSettings.currency} ${Number(value).toFixed(2)}`, 'Total']}
                    contentStyle={{
                      backgroundColor: '#09090B',
                      border: '1px solid #27272A',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#FFFFFF', fontWeight: 700, marginBottom: '2px' }}
                    itemStyle={{ color: '#F4F4F5', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Productos más vendidos */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-950">Top 5 Productos Más Vendidos</h2>
                <p className="text-xs text-zinc-500">Por volumen de unidades colocadas</p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsChartData} layout="vertical" margin={{ top: 5, right: 36, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E4E4E7" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#52525B' }} stroke="#D4D4D8" />
                  <YAxis dataKey="name" type="category" width={125} tick={{ fontSize: 11, fill: '#18181B', fontWeight: 500 }} stroke="#D4D4D8" />
                  <Tooltip
                    cursor={{ fill: 'rgba(220, 38, 38, 0.08)' }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                    formatter={(value: any) => [`${value} unidades`, 'Volumen']}
                    contentStyle={{
                      backgroundColor: '#09090B',
                      border: '1px solid #27272A',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#FFFFFF', fontWeight: 700, marginBottom: '2px' }}
                    itemStyle={{ color: '#F4F4F5', fontWeight: 600 }}
                  />
                  <Bar dataKey="unidades" fill="#18181B" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="unidades" position="right" fill="#18181B" fontSize={11} fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Estado del Inventario */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-950">Estado Global del Inventario</h2>
                <p className="text-xs text-zinc-500">Salud de stock de variantes activas</p>
              </div>
              <button
                onClick={() => setActiveView('inventory')}
                className="text-xs text-red-600 font-semibold hover:underline"
              >
                Ver Kardex
              </button>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={76}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {inventoryStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} variantes`, 'Cantidad']}
                    contentStyle={{
                      backgroundColor: '#09090B',
                      border: '1px solid #27272A',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#FFFFFF', fontWeight: 700, marginBottom: '2px' }}
                    itemStyle={{ color: '#F4F4F5', fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#18181B' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </StaggerSection>

      {/* OPERATIONAL TABLES */}
      <StaggerSection delay={0.2}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tabla: Productos con stock bajo */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-950">Productos con Stock Bajo o Crítico</h2>
                <p className="text-xs text-zinc-500">Variantes por debajo del nivel de seguridad</p>
              </div>
              <button
                onClick={() => setActiveView('purchases')}
                className="text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap"
              >
                + Generar Orden
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Producto</th>
                    <th className="px-4 py-2.5 font-semibold">Variante</th>
                    <th className="px-3 py-2.5 font-semibold text-center">Stock</th>
                    <th className="px-3 py-2.5 font-semibold text-center">Mín.</th>
                    <th className="px-4 py-2.5 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {lowStockVariants.slice(0, 5).map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-zinc-950">{item.productName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{item.code}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{item.variantDesc}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{item.sku}</div>
                      </td>
                      <td className="px-3 py-3 text-center font-bold font-mono text-zinc-950 tabular-nums">
                        {item.stock}
                      </td>
                      <td className="px-3 py-3 text-center font-mono text-zinc-500 tabular-nums">
                        {item.minStock}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            item.stock === 0
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla: Últimas ventas */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-950">Últimas Ventas Realizadas</h2>
                <p className="text-xs text-zinc-500">Transacciones comerciales recientes</p>
              </div>
              <button
                onClick={() => setActiveView('pos')}
                className="text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap"
              >
                Ver POS
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">N° Venta</th>
                    <th className="px-4 py-2.5 font-semibold">Cliente</th>
                    <th className="px-3 py-2.5 font-semibold">Hora</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Total</th>
                    <th className="px-3 py-2.5 font-semibold text-center">Ticket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {sales.slice(0, 5).map((sale) => (
                    <tr key={sale.id} className="hover:bg-zinc-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-red-600 font-mono">{sale.saleNumber}</div>
                        <div className="text-[10px] text-zinc-400">{sale.paymentMethod}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-950 truncate max-w-[140px]">
                          {sale.clientName}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {sale.clientDocType}: {sale.clientDoc}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-zinc-500 font-mono text-[11px] tabular-nums">
                        {sale.time}
                      </td>
                      <td className="px-4 py-3 text-right font-bold font-mono text-zinc-950 tabular-nums">
                        {storeSettings.currency} {sale.total.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => setSelectedSaleForReceipt(sale)}
                          className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          title="Ver comprobante electrónico"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </StaggerSection>

      {/* INVENTORY MOVEMENTS PANEL */}
      <StaggerSection delay={0.25}>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Últimos Movimientos de Inventario (Kardex)</h2>
              <p className="text-xs text-zinc-500">Entradas por compras, salidas por ventas POS/Online y ajustes</p>
            </div>
            <button
              onClick={() => setActiveView('inventory')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap"
            >
              Ver Kardex Completo
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Fecha / Hora</th>
                  <th className="px-4 py-2.5 font-semibold">Tipo</th>
                  <th className="px-4 py-2.5 font-semibold">Producto / Variante</th>
                  <th className="px-3 py-2.5 font-semibold text-center">Variación</th>
                  <th className="px-3 py-2.5 font-semibold text-center">Saldo Nuevo</th>
                  <th className="px-4 py-2.5 font-semibold">Referencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {inventoryMovements.slice(0, 6).map((mov) => (
                  <tr key={mov.id} className="hover:bg-zinc-50 transition">
                    <td className="px-4 py-3 font-mono text-[11px] text-zinc-500 tabular-nums whitespace-nowrap">
                      {mov.date} · {mov.time}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          mov.quantity > 0
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                        }`}
                      >
                        {mov.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-950">{mov.productName}</div>
                      <div className="text-[10px] text-zinc-400">
                        {mov.variantDesc} · <span className="font-mono">{mov.sku}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-bold tabular-nums">
                      <span className={mov.quantity > 0 ? 'text-emerald-700' : 'text-red-600'}>
                        {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-mono font-bold text-zinc-950 tabular-nums">
                      {mov.newStock}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-zinc-600">
                      {mov.reference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </StaggerSection>

      {/* Printable Receipt Modal */}
      {selectedSaleForReceipt && (
        <ReceiptModal
          sale={selectedSaleForReceipt}
          settings={storeSettings}
          isOpen={true}
          onClose={() => setSelectedSaleForReceipt(null)}
        />
      )}
    </div>
  );
};
