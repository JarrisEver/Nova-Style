import React from 'react';
import { Sale, StoreSettings } from '../../types';
import { ModalShell } from '../ui/MotionPrimitives';
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
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-lg">
      <div className="flex flex-col max-h-[90vh]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Comprobante Emitido</h3>
              <p className="text-[11px] text-zinc-400">Transacción registrada en tiempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Printable Ticket Receipt */}
        <div className="p-6 overflow-y-auto bg-zinc-100 flex justify-center">
          <div
            id="printable-receipt"
            className="w-full max-w-sm bg-white p-6 shadow-sm border border-zinc-200 rounded-lg text-zinc-800 font-mono text-xs leading-relaxed"
          >
            <div className="text-center border-b border-dashed border-zinc-300 pb-4 mb-4">
              <div className="text-base font-extrabold tracking-tight text-zinc-950 font-sans">
                NOVA<span className="text-red-600">Style</span>
              </div>
              <div className="text-[11px] font-semibold text-zinc-600">
                NS-Management Tienda Departamental
              </div>
              <div className="text-[10px] text-zinc-500 mt-1 tabular-nums">
                RUC: {settings.ruc}
              </div>
              <div className="text-[10px] text-zinc-500">{settings.address}</div>
              <div className="text-[10px] text-zinc-500 tabular-nums">Telf: {settings.phone}</div>
            </div>

            <div className="border-b border-dashed border-zinc-300 pb-3 mb-3 text-[11px]">
              <div className="font-bold text-center text-zinc-950 text-xs mb-1">
                {sale.receiptType === 'FACTURA'
                  ? 'FACTURA ELECTRÓNICA'
                  : 'BOLETA DE VENTA ELECTRÓNICA'}
              </div>
              <div className="text-center font-bold text-red-600 mb-2 tabular-nums">
                N° {sale.saleNumber}
              </div>
              <div className="flex justify-between text-zinc-600 tabular-nums">
                <span>Fecha: {sale.date}</span>
                <span>Hora: {sale.time}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Vendedor: {sale.sellerName}</span>
                <span>Canal: {sale.channel}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-zinc-300 pb-3 mb-3 text-[11px] text-zinc-700">
              <div>
                <span className="text-zinc-500">Cliente:</span> {sale.clientName}
              </div>
              <div className="tabular-nums">
                <span className="text-zinc-500">{sale.clientDocType}:</span> {sale.clientDoc}
              </div>
            </div>

            <div className="border-b border-dashed border-zinc-300 pb-3 mb-3">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 text-[10px]">
                    <th className="pb-1 w-8">Cant</th>
                    <th className="pb-1">Detalle</th>
                    <th className="pb-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {sale.items.map((item, idx) => (
                    <tr key={idx} className="text-[11px]">
                      <td className="py-1 font-semibold align-top tabular-nums">{item.quantity}</td>
                      <td className="py-1 pr-1">
                        <div className="font-medium text-zinc-900">{item.productName}</div>
                        <div className="text-[10px] text-zinc-500">{item.variantDesc}</div>
                      </td>
                      <td className="py-1 text-right font-semibold align-top whitespace-nowrap tabular-nums">
                        {settings.currency} {item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 text-[11px] border-b border-dashed border-zinc-300 pb-3 mb-3 tabular-nums">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal bruto:</span>
                <span>{settings.currency} {(sale.subtotal + sale.tax + sale.discount).toFixed(2)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Descuento aplicado:</span>
                  <span>- {settings.currency} {sale.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>Op. Gravada:</span>
                <span>{settings.currency} {sale.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>I.G.V. (18%):</span>
                <span>{settings.currency} {sale.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-950 pt-1.5 border-t border-zinc-200 font-sans">
                <span>TOTAL A PAGAR:</span>
                <span className="font-mono">{settings.currency} {sale.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-600 space-y-1 border-b border-dashed border-zinc-300 pb-3 mb-3 tabular-nums">
              <div className="flex justify-between">
                <span>Método de pago:</span>
                <span className="font-semibold text-zinc-900">{sale.paymentMethod}</span>
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
                <span className="text-emerald-700 font-semibold">APROBADO</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center pt-1 text-center">
              <div className="p-2 border border-zinc-200 bg-white rounded my-1 inline-block">
                <QrCode className="w-16 h-16 text-zinc-900" />
              </div>
              <div className="text-[9px] text-zinc-400 mt-1 max-w-[200px]">
                Hash: 8b7a6c9d0e1f2a3b4c5d6e7f
              </div>
              <div className="text-[10px] text-zinc-600 font-sans font-medium mt-2">
                Gracias por su preferencia en NOVAStyle
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-white border-t border-zinc-200 flex flex-wrap gap-2 justify-between items-center shrink-0">
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition"
            >
              <Printer className="w-4 h-4 text-zinc-500" />
              Imprimir
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition"
            >
              <Download className="w-4 h-4 text-zinc-500" />
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
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                + Nueva Venta
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
