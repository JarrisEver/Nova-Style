import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  Boxes,
  Truck,
  DollarSign,
  Download,
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

export const ReportsView: React.FC = () => {
  const { sales, products, purchaseOrders, suppliers, storeSettings, addToast } = useApp();

  const [reportType, setReportType] = useState<'VENTAS' | 'INVENTARIO' | 'COMPRAS' | 'TOP_PRODUCTOS'>('VENTAS');

  // Sales report filters
  const [filterDateFrom, setFilterDateFrom] = useState('2026-09-01');
  const [filterDateTo, setFilterDateTo] = useState('2026-09-30');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('TODOS');

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchDate = (!filterDateFrom || s.date >= filterDateFrom) && (!filterDateTo || s.date <= filterDateTo);
      const matchPayment = filterPaymentMethod === 'TODOS' || s.paymentMethod === filterPaymentMethod;
      return matchDate && matchPayment;
    });
  }, [sales, filterDateFrom, filterDateTo, filterPaymentMethod]);

  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const avgTicket = filteredSales.length > 0 ? totalSalesRevenue / filteredSales.length : 0;

  // Top products calculation
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

  // Export to Excel / CSV
  const handleExportCSV = () => {
    let csvHeader = '';
    let csvRows: string[] = [];
    let fileName = `Reporte_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;

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

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvHeader + csvRows.join('\n'));
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

  return (
    <div className="space-y-5">
      {/* Title & Export buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Módulo de Reportes & Business Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Análisis consolidado de ventas, inventario, abastecimiento y productos estrella
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel (CSV)</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>Exportar PDF / Imprimir</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setReportType('VENTAS')}
          className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
            reportType === 'VENTAS'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Reporte de Ventas</span>
        </button>

        <button
          onClick={() => setReportType('INVENTARIO')}
          className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
            reportType === 'INVENTARIO'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Reporte de Inventario</span>
        </button>

        <button
          onClick={() => setReportType('COMPRAS')}
          className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
            reportType === 'COMPRAS'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Reporte de Compras</span>
        </button>

        <button
          onClick={() => setReportType('TOP_PRODUCTOS')}
          className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
            reportType === 'TOP_PRODUCTOS'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Productos Más Vendidos</span>
        </button>
      </div>

      {/* REPORT CONTENT: VENTAS */}
      {reportType === 'VENTAS' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Desde:</span>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Hasta:</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Medio de Pago:</span>
              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
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
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Total Recaudado</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {storeSettings.currency} {totalSalesRevenue.toFixed(2)}
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Ticket Promedio</span>
              <div className="text-2xl font-bold text-blue-700 mt-1">
                {storeSettings.currency} {avgTicket.toFixed(2)}
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Comprobantes Emitidos</span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {filteredSales.length} transacciones
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
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
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5 font-mono font-bold text-blue-700">
                        {s.saleNumber}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-500">
                        {s.date} {s.time}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-900">{s.clientName}</td>
                      <td className="px-3 py-2.5">{s.paymentMethod}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                        {storeSettings.currency} {s.subtotal.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-500">
                        {storeSettings.currency} {s.tax.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900 font-mono">
                        {storeSettings.currency} {s.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: TOP PRODUCTOS */}
      {reportType === 'TOP_PRODUCTOS' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Ranking de Ventas por Prenda
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsList.slice(0, 8)} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#64748b" interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                  <Tooltip
                    formatter={(value: any) => [`${value} unidades`, 'Ventas']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="quantity" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Ranking</th>
                  <th className="px-3 py-3 font-semibold">Código</th>
                  <th className="px-4 py-3 font-semibold">Prenda / Producto</th>
                  <th className="px-3 py-3 font-semibold text-center">Unidades Vendidas</th>
                  <th className="px-4 py-3 font-semibold text-right">Facturación Generada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {topProductsList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-bold text-slate-900">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-mono text-xs">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-blue-700">{item.code}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{item.name}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-emerald-700 text-sm">
                      {item.quantity} unid.
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900 font-mono">
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {products.flatMap((p) =>
                p.variants.map((v, i) => (
                  <tr key={`${p.id}-${i}`} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 font-mono font-bold text-blue-700">{p.code}</td>
                    <td className="px-4 py-2 font-semibold text-slate-900">{p.name}</td>
                    <td className="px-3 py-2 text-slate-600">{p.category}</td>
                    <td className="px-3 py-2">
                      <span className="font-medium text-slate-800">{v.size} / {v.color}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{v.sku}</span>
                    </td>
                    <td className="px-3 py-2 text-center font-bold">
                      <span
                        className={
                          v.stock === 0
                            ? 'text-rose-600'
                            : v.stock <= v.minStock
                            ? 'text-amber-600'
                            : 'text-slate-900'
                        }
                      >
                        {v.stock}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center text-slate-500">{v.minStock}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-600">
                      {storeSettings.currency} {(v.stock * p.cost).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                      {storeSettings.currency} {(v.stock * p.price).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT CONTENT: COMPRAS */}
      {reportType === 'COMPRAS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-2.5 font-mono font-bold text-blue-700">{po.orderNumber}</td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">{po.supplierName}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-600">{po.supplierRuc}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-500">{po.date}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-500">{po.expectedDate}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                      {po.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-slate-900 font-mono">
                    {storeSettings.currency} {po.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
