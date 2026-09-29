import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  CheckCircle,
  Clock,
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
    storeSettings,
    setActiveView,
  } = useApp();

  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<Sale | null>(null);

  // 1. KPI Calculations
  const todayStr = '2026-09-28'; // based on environment date
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

  // Low stock calculation
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

  const CATEGORY_COLORS = ['#2563eb', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

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
    { name: 'Disponible', value: totalAvailable, color: '#10b981' },
    { name: 'Stock Bajo', value: totalLow, color: '#f59e0b' },
    { name: 'Agotado', value: totalOut, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Panel de Control Gerencial
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor operativo y comercial en tiempo real • {storeSettings.storeName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('pos')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition"
          >
            <span>Ir al POS / Nueva Venta</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ventas Hoy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Ventas de Hoy</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {storeSettings.currency} {todaySalesTotal.toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{todaySalesList.length} transacciones registradas</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Ventas del Mes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Ventas del Mes</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {storeSettings.currency} {monthSalesTotal.toFixed(2)}
            </div>
            <div className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Meta mensual: 84% alcanzado</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Pedidos Online */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Pedidos Online</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {onlineOrders.length}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>{onlineOrders.filter((o) => o.status === 'PENDIENTE').length} pendientes de despacho</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Stock Bajo */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Alertas de Stock</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {lowStockVariants.length}
            </div>
            <div className="text-[11px] text-amber-700 font-medium flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{totalOut} variantes agotadas</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Second KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-slate-100 text-slate-700">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Prendas Vendidas</div>
            <div className="text-lg font-bold text-slate-900">{totalProductsSold} unidades</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-slate-100 text-slate-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Clientes Registrados</div>
            <div className="text-lg font-bold text-slate-900">{clients.length} clientes</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-slate-100 text-slate-700">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Compras del Mes</div>
            <div className="text-lg font-bold text-slate-900">
              {storeSettings.currency} {monthPurchasesTotal.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Ventas por día */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Ventas por Día (Últimos 7 días)</h2>
              <p className="text-xs text-slate-500">Facturación presencial y electrónica</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700">
              {storeSettings.currency}
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByDayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip
                  formatter={(value: any) => [`${storeSettings.currency} ${Number(value).toFixed(2)}`, 'Ventas']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="monto" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Ventas por Categoría */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Ventas por Categoría</h2>
              <p className="text-xs text-slate-500">Distribución de ingresos por departamento</p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="total"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name || ''} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`
                  }
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${storeSettings.currency} ${Number(value).toFixed(2)}`, 'Total']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Productos más vendidos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top 5 Productos Más Vendidos</h2>
              <p className="text-xs text-slate-500">Por volumen de unidades colocadas</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip
                  formatter={(value: any) => [`${value} unidades`, 'Volumen']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="unidades" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Estado del Inventario */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Estado Global del Inventario</h2>
              <p className="text-xs text-slate-500">Salud de stock de variantes activas</p>
            </div>
            <button
              onClick={() => setActiveView('inventory')}
              className="text-xs text-blue-600 font-semibold hover:underline"
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
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {inventoryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} variantes`, 'Cantidad']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabla: Productos con stock bajo */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Productos con Stock Bajo o Crítico</h2>
              <p className="text-xs text-slate-500">Variantes con nivel igual o inferior al stock de seguridad</p>
            </div>
            <button
              onClick={() => setActiveView('purchases')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              + Generar Orden
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Producto</th>
                  <th className="px-4 py-2.5 font-semibold">Variante</th>
                  <th className="px-3 py-2.5 font-semibold text-center">Stock</th>
                  <th className="px-3 py-2.5 font-semibold text-center">Mín.</th>
                  <th className="px-4 py-2.5 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {lowStockVariants.slice(0, 5).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.code}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{item.variantDesc}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-slate-900">
                      {item.stock}
                    </td>
                    <td className="px-3 py-3 text-center text-slate-500">
                      {item.minStock}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.stock === 0
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Últimas Ventas Realizadas</h2>
              <p className="text-xs text-slate-500">Transacciones comerciales en vivo</p>
            </div>
            <button
              onClick={() => setActiveView('pos')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Ver POS
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">N° Venta</th>
                  <th className="px-4 py-2.5 font-semibold">Cliente</th>
                  <th className="px-3 py-2.5 font-semibold">Hora</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Total</th>
                  <th className="px-3 py-2.5 font-semibold text-center">Ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sales.slice(0, 5).map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-blue-700 font-mono">{sale.saleNumber}</div>
                      <div className="text-[10px] text-slate-400">{sale.paymentMethod}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 truncate max-w-[140px]">
                        {sale.clientName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {sale.clientDocType}: {sale.clientDoc}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-500 font-mono text-[11px]">
                      {sale.time}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {storeSettings.currency} {sale.total.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => setSelectedSaleForReceipt(sale)}
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
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
