import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Printer,
  TrendingUp,
  Boxes,
  Truck,
  DollarSign,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ModuleHeader, StaggerSection } from '../ui/MotionPrimitives';
import { TiltCard3D } from '../ui/TiltCard3D';

export const ReportsView: React.FC = () => {
  const { sales, products, purchaseOrders, storeSettings, addToast } = useApp();

  const [reportType, setReportType] = useState<'VENTAS' | 'INVENTARIO' | 'COMPRAS' | 'TOP_PRODUCTOS'>('VENTAS');

  const [filterDateFrom, setFilterDateFrom] = useState('2026-09-01');
  const [filterDateTo, setFilterDateTo] = useState('2026-09-30');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('TODOS');

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchDate =
        (!filterDateFrom || s.date >= filterDateFrom) && (!filterDateTo || s.date <= filterDateTo);
      const matchPayment = filterPaymentMethod === 'TODOS' || s.paymentMethod === filterPaymentMethod;
      return matchDate && matchPayment;
    });
  }, [sales, filterDateFrom, filterDateTo, filterPaymentMethod]);

  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const avgTicket = filteredSales.length > 0 ? totalSalesRevenue / filteredSales.length : 0;

  const topProductsList = useMemo(() => {
    const map: { [name: string]: { qty: number; total: number; code: string } } = {};
    sales.forEach((s) => {
      s.items.forEach((it) => {
        if (!map[it.productName]) {
          const prod = products.find((p) => p.id === it.productId);
          map[it.productName] = { qty: 0, total: 0, code: prod?.code || 'PRD' };
        }
        map[it.productName].qty += it.quantity;
        map[it.productName].total += it.subtotal;
      });
    });

    return Object.keys(map)
      .map((name) => ({
        name,
        code: map[name].code,
        quantity: map[name].qty,
        total: Number(map[name].total.toFixed(2)),
      }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [sales, products]);

  const handleExportCSV = () => {
    let csvHeader = '';
    let csvRows: string[] = [];
    const fileName = `Reporte_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;

    if (reportType === 'VENTAS') {
      csvHeader = 'N° Comprobante,Fecha,Hora,Canal,Cliente,Documento,Medio Pago,Subtotal,IGV,Total\n';
      csvRows = filteredSales.map(
        (s) =>
          `"${s.saleNumber}","${s.date}","${s.time}","${s.channel}","${s.clientName}","${s.clientDoc}","${s.paymentMethod}",${s.subtotal},${s.tax},${s.total}`
      );
    } else if (reportType === 'INVENTARIO') {
      csvHeader = 'Código,Producto,Marca,Categoría,Variante,SKU,Stock Actual,Stock Mínimo,Costo,Precio\n';
      products.forEach((p) => {
        p.variants.forEach((v) => {
          csvRows.push(
            `"${p.code}","${p.name}","${p.brand}","${p.category}","${v.size} / ${v.color}","${v.sku}",${v.stock},${v.minStock},${p.cost},${p.price}`
          );
        });
      });
    } else if (reportType === 'COMPRAS') {
      csvHeader = 'N° Orden,Proveedor,RUC,Fecha Emisión,Fecha Esperada,Estado,Total\n';
      csvRows = purchaseOrders.map(
        (po) =>
          `"${po.orderNumber}","${po.supplierName}","${po.supplierRuc}","${po.date}","${po.expectedDate}","${po.status}",${po.total}`
      );
    } else if (reportType === 'TOP_PRODUCTOS') {
      csvHeader = 'Código,Producto,Unidades Vendidas,Ingresos Generados\n';
      csvRows = topProductsList.map((tp) => `"${tp.code}","${tp.name}",${tp.quantity},${tp.total}`);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvHeader + csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'Archivo Exportado', `Se descargó "${fileName}" exitosamente.`);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const tabs: {
    id: 'VENTAS' | 'INVENTARIO' | 'COMPRAS' | 'TOP_PRODUCTOS';
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'VENTAS', label: 'Reporte de Ventas', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'INVENTARIO', label: 'Reporte de Inventario', icon: <Boxes className="w-4 h-4" /> },
    { id: 'COMPRAS', label: 'Reporte de Compras', icon: <Truck className="w-4 h-4" /> },
    { id: 'TOP_PRODUCTOS', label: 'Productos Más Vendidos', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <ModuleHeader
        kicker="BUSINESS INTELLIGENCE • ANALÍTICA"
        title="Reportes & Analítica Gerencial"
        subtitle="Análisis consolidado de facturación, valorización de inventario, abastecimiento y prendas top"
        actions={
          <>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-xs transition whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar Excel (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-xs transition whitespace-nowrap shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
          </>
        }
      />

      {/* Report Selector Tabs */}
      <StaggerSection className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {tabs.map((tab) => {
          const isActive = reportType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setReportType(tab.id)}
              className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </StaggerSection>

      {/* REPORT CONTENT: VENTAS */}
      {reportType === 'VENTAS' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-wrap gap-4 items-center text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-semibold">Desde:</span>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-semibold">Hasta:</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-semibold">Medio de Pago:</span>
              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
              >
                <option value="TODOS">Todos</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="YAPE_PLIN">Yape / Plin</option>
                <option value="PAGO_ELECTRONICO">Pago Electrónico</option>
              </select>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TiltCard3D maxTilt={4} className="p-5 bg-zinc-950 text-white rounded-xl border border-zinc-800">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Total Recaudado
              </span>
              <div className="text-2xl font-bold font-mono tabular-nums mt-1.5 text-white">
                {storeSettings.currency} {totalSalesRevenue.toFixed(2)}
              </div>
            </TiltCard3D>

            <TiltCard3D maxTilt={4} className="p-5 bg-white rounded-xl border border-zinc-200">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Ticket Promedio
              </span>
              <div className="text-2xl font-bold font-mono tabular-nums text-red-600 mt-1.5">
                {storeSettings.currency} {avgTicket.toFixed(2)}
              </div>
            </TiltCard3D>

            <TiltCard3D maxTilt={4} className="p-5 bg-white rounded-xl border border-zinc-200">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Comprobantes Emitidos
              </span>
              <div className="text-2xl font-bold font-mono tabular-nums text-zinc-950 mt-1.5">
                {filteredSales.length} <span className="text-xs font-sans font-semibold text-zinc-500">ops</span>
              </div>
            </TiltCard3D>
          </div>

          {/* Sales Table */}
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-300 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Comprobante</th>
                    <th className="px-3 py-3 font-semibold">Fecha / Hora</th>
                    <th className="px-4 py-3 font-semibold">Cliente</th>
                    <th className="px-3 py-3 font-semibold">Medio de Pago</th>
                    <th className="px-3 py-3 font-semibold text-right">Subtotal</th>
                    <th className="px-3 py-3 font-semibold text-right">IGV (18%)</th>
                    <th className="px-4 py-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {filteredSales.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-50 transition">
                      <td className="px-4 py-2.5 font-mono font-bold text-red-600">{s.saleNumber}</td>
                      <td className="px-3 py-2.5 font-mono tabular-nums text-zinc-500">
                        {s.date} {s.time}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-zinc-950">{s.clientName}</td>
                      <td className="px-3 py-2.5">{s.paymentMethod}</td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-zinc-600">
                        {storeSettings.currency} {s.subtotal.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-zinc-500">
                        {storeSettings.currency} {s.tax.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-zinc-950 font-mono tabular-nums">
                        {storeSettings.currency} {s.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                        No existen comprobantes para los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: TOP PRODUCTOS */}
      {reportType === 'TOP_PRODUCTOS' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-950">Ranking de Ventas por Prenda</h3>
              <span className="text-[11px] font-mono text-zinc-500">Unidades vendidas</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProductsList.slice(0, 8)}
                  margin={{ top: 10, right: 24, left: 0, bottom: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#52525b' }}
                    stroke="#d4d4d8"
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#52525b' }} stroke="#d4d4d8" />
                  <Tooltip
                    formatter={(value: unknown) => [`${value} unidades`, 'Ventas']}
                    contentStyle={{
                      backgroundColor: '#09090B',
                      borderRadius: '8px',
                      border: '1px solid #27272a',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="quantity" fill="#DC2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-300 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Ranking</th>
                  <th className="px-3 py-3 font-semibold">Código</th>
                  <th className="px-4 py-3 font-semibold">Prenda / Producto</th>
                  <th className="px-3 py-3 font-semibold text-center">Unidades Vendidas</th>
                  <th className="px-4 py-3 font-semibold text-right">Facturación Generada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {topProductsList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 transition">
                    <td className="px-4 py-2.5 font-bold text-zinc-950">
                      <span
                        className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs ${
                          idx < 3 ? 'bg-red-600 text-white' : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-red-600">{item.code}</td>
                    <td className="px-4 py-2.5 font-semibold text-zinc-950">{item.name}</td>
                    <td className="px-3 py-2.5 text-center font-mono tabular-nums font-bold text-zinc-900">
                      {item.quantity} unid.
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-zinc-950 font-mono tabular-nums">
                      {storeSettings.currency} {item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: INVENTARIO */}
      {reportType === 'INVENTARIO' && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-300 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Código</th>
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-3 py-3 font-semibold">Categoría</th>
                  <th className="px-3 py-3 font-semibold">Variante / SKU</th>
                  <th className="px-3 py-3 font-semibold text-center">Stock Actual</th>
                  <th className="px-3 py-3 font-semibold text-center">Stock Mínimo</th>
                  <th className="px-3 py-3 font-semibold text-right">Valorizado Costo</th>
                  <th className="px-3 py-3 font-semibold text-right">Valorizado Venta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {products.flatMap((p) =>
                  p.variants.map((v, i) => (
                    <tr key={`${p.id}-${i}`} className="hover:bg-zinc-50 transition">
                      <td className="px-4 py-2.5 font-mono font-bold text-red-600">{p.code}</td>
                      <td className="px-4 py-2.5 font-semibold text-zinc-950">{p.name}</td>
                      <td className="px-3 py-2.5 text-zinc-600">{p.category}</td>
                      <td className="px-3 py-2.5">
                        <span className="font-medium text-zinc-900">
                          {v.size} / {v.color}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono block">{v.sku}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono tabular-nums font-bold">
                        <span
                          className={
                            v.stock === 0
                              ? 'text-red-600'
                              : v.stock <= v.minStock
                              ? 'text-amber-600'
                              : 'text-zinc-950'
                          }
                        >
                          {v.stock}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono tabular-nums text-zinc-500">
                        {v.minStock}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-zinc-600">
                        {storeSettings.currency} {(v.stock * p.cost).toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums font-bold text-zinc-950">
                        {storeSettings.currency} {(v.stock * p.price).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: COMPRAS */}
      {reportType === 'COMPRAS' && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-300 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">N° Orden</th>
                  <th className="px-4 py-3 font-semibold">Proveedor</th>
                  <th className="px-3 py-3 font-semibold">RUC</th>
                  <th className="px-3 py-3 font-semibold">Fecha Emisión</th>
                  <th className="px-3 py-3 font-semibold">Fecha Entrega</th>
                  <th className="px-3 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold text-right">Importe Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-zinc-50 transition">
                    <td className="px-4 py-2.5 font-mono font-bold text-red-600">{po.orderNumber}</td>
                    <td className="px-4 py-2.5 font-semibold text-zinc-950">{po.supplierName}</td>
                    <td className="px-3 py-2.5 font-mono tabular-nums text-zinc-600">{po.supplierRuc}</td>
                    <td className="px-3 py-2.5 font-mono tabular-nums text-zinc-500">{po.date}</td>
                    <td className="px-3 py-2.5 font-mono tabular-nums text-zinc-500">{po.expectedDate}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-zinc-950 font-mono tabular-nums">
                      {storeSettings.currency} {po.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
