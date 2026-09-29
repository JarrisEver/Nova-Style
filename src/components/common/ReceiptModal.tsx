import React from 'react';
import { Sale, StoreSettings } from '../../types';
import { Printer, Download, X, CheckCircle, QrCode } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onNewSale?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  settings,
  isOpen,
  onClose,
  onNewSale,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const textContent = `
========================================
       ${settings.storeName.toUpperCase()}
          RUC: ${settings.ruc}
      ${settings.address}
          Telf: ${settings.phone}
========================================
COMPROBANTE: ${sale.receiptType === 'FACTURA' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA'}
NÚMERO:      ${sale.saleNumber}
FECHA/HORA:  ${sale.date} ${sale.time}
CAJERO/VEND: ${sale.sellerName}
CANAL:       ${sale.channel}
----------------------------------------
CLIENTE:     ${sale.clientName}
DOC (${sale.clientDocType}): ${sale.clientDoc}
----------------------------------------
CANT.  DESCRIPCIÓN             TOTAL
----------------------------------------
${sale.items
  .map(
    (item) =>
      `${item.quantity.toString().padEnd(6)} ${(item.productName.slice(0, 20) + ' ' + item.variantDesc).padEnd(23)} S/ ${item.subtotal.toFixed(2)}`
  )
  .join('\n')}
----------------------------------------
SUBTOTAL:             ${settings.currency} ${(sale.subtotal + sale.tax).toFixed(2)}
DESCUENTO APLICADO:   ${settings.currency} ${sale.discount.toFixed(2)}
OP. GRAVADA:          ${settings.currency} ${sale.subtotal.toFixed(2)}
I.G.V. (18%):         ${settings.currency} ${sale.tax.toFixed(2)}
TOTAL A PAGAR:        ${settings.currency} ${sale.total.toFixed(2)}
----------------------------------------
FORMA DE PAGO:        ${sale.paymentMethod}
${sale.cashReceived ? `MONTO RECIBIDO:       ${settings.currency} ${sale.cashReceived.toFixed(2)}\nVUELTO:               ${settings.currency} ${(sale.change || 0).toFixed(2)}\n` : ''}
ESTADO DEL PAGO:      ${sale.paymentStatus}
========================================
Representación impresa de la Boleta/Factura Electrónica
Autorizado mediante Resolución SUNAT N° 034-005
¡Gracias por su compra en NOVAStyle!
========================================
    `;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Comprobante-${sale.saleNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Venta Exitosa</h3>
              <p className="text-xs text-slate-500">Comprobante generado en tiempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Ticket Receipt */}
        <div className="p-6 overflow-y-auto bg-slate-100/50 flex justify-center">
          <div
            id="printable-receipt"
            className="w-full max-w-sm bg-white p-6 shadow-sm border border-slate-200 rounded-lg text-slate-800 font-mono text-xs leading-relaxed"
          >
            {/* Store details */}
            <div className="text-center border-b border-dashed border-slate-300 pb-4 mb-4">
              <div className="text-base font-bold tracking-tight text-slate-900 font-sans">
                NOVAStyle
              </div>
              <div className="text-[11px] font-semibold text-slate-600">
                NS-Management Tienda Departamental
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                RUC: {settings.ruc}
              </div>
              <div className="text-[10px] text-slate-500">
                {settings.address}
              </div>
              <div className="text-[10px] text-slate-500">
                Telf: {settings.phone}
              </div>
            </div>

            {/* Document Info */}
            <div className="border-b border-dashed border-slate-300 pb-3 mb-3 text-[11px]">
              <div className="font-bold text-center text-slate-900 text-xs mb-1">
                {sale.receiptType === 'FACTURA'
                  ? 'FACTURA ELECTRÓNICA'
                  : 'BOLETA DE VENTA ELECTRÓNICA'}
              </div>
              <div className="text-center font-bold text-blue-700 mb-2">
                N° {sale.saleNumber}
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fecha: {sale.date}</span>
                <span>Hora: {sale.time}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Vendedor: {sale.sellerName}</span>
                <span>Canal: {sale.channel}</span>
              </div>
            </div>

            {/* Client Info */}
            <div className="border-b border-dashed border-slate-300 pb-3 mb-3 text-[11px] text-slate-700">
              <div>
                <span className="text-slate-500">Cliente:</span> {sale.clientName}
              </div>
              <div>
                <span className="text-slate-500">{sale.clientDocType}:</span> {sale.clientDoc}
              </div>
            </div>

            {/* Items */}
            <div className="border-b border-dashed border-slate-300 pb-3 mb-3">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[10px]">
                    <th className="pb-1 w-8">Cant</th>
                    <th className="pb-1">Detalle</th>
                    <th className="pb-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items.map((item, idx) => (
                    <tr key={idx} className="text-[11px]">
                      <td className="py-1 font-semibold align-top">{item.quantity}</td>
                      <td className="py-1 pr-1">
                        <div className="font-medium text-slate-900">{item.productName}</div>
                        <div className="text-[10px] text-slate-500">{item.variantDesc}</div>
                      </td>
                      <td className="py-1 text-right font-semibold align-top whitespace-nowrap">
                        {settings.currency} {item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3 mb-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal bruto:</span>
                <span>
                  {settings.currency} {(sale.subtotal + sale.tax + sale.discount).toFixed(2)}
                </span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Descuento aplicado:</span>
                  <span>- {settings.currency} {sale.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Op. Gravada:</span>
                <span>{settings.currency} {sale.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>I.G.V. (18%):</span>
                <span>{settings.currency} {sale.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200 font-sans">
                <span>TOTAL A PAGAR:</span>
                <span>{settings.currency} {sale.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="text-[11px] text-slate-600 space-y-1 border-b border-dashed border-slate-300 pb-3 mb-3">
              <div className="flex justify-between">
                <span>Método de pago:</span>
                <span className="font-semibold text-slate-800">{sale.paymentMethod}</span>
              </div>
              {sale.cashReceived !== undefined && (
                <>
                  <div className="flex justify-between">
                    <span>Monto recibido:</span>
                    <span>{settings.currency} {sale.cashReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-emerald-700">
                    <span>Vuelto:</span>
                    <span>{settings.currency} {(sale.change || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className="text-emerald-600 font-semibold">✓ APROBADO</span>
              </div>
            </div>

            {/* QR Mock & Footer */}
            <div className="flex flex-col items-center justify-center pt-1 text-center">
              <div className="p-2 border border-slate-200 bg-white rounded my-1 inline-block">
                <QrCode className="w-16 h-16 text-slate-800" />
              </div>
              <div className="text-[9px] text-slate-400 mt-1 max-w-[200px]">
                Código Hash: 8b7a6c9d0e1f2a3b4c5d6e7f
              </div>
              <div className="text-[10px] text-slate-500 font-sans font-medium mt-2">
                ¡Gracias por su preferencia!
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm transition"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              Imprimir
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm transition"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Descargar
            </button>
          </div>
          <div className="flex gap-2">
            {onNewSale && (
              <button
                onClick={() => {
                  onClose();
                  onNewSale();
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
              >
                + Nueva Venta
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
