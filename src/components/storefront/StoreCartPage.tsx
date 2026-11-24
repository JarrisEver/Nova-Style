import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { OnlineOrder } from '../../types';
import { SafeImage } from '../ui/MotionPrimitives';
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  CheckCircle2,
  ArrowRight,
  Lock,
  PackageCheck,
} from 'lucide-react';

export const StoreCartPage: React.FC = () => {
  const {
    cart,
    products,
    clients,
    promotions,
    currentUser,
    storeSettings,
    appliedPromoCode,
    setAppliedPromoCode,
    updateCartQuantity,
    removeFromCart,
    placeOnlineOrder,
  } = useApp();

  const [promoInput, setPromoInput] = useState(appliedPromoCode || '');
  const [confirmedOrder, setConfirmedOrder] = useState<OnlineOrder | null>(null);

  const matchedClient =
    currentUser?.role === 'CLIENTE'
      ? clients.find((c) => c.email.toLowerCase() === currentUser.email.toLowerCase())
      : undefined;

  const [clientName, setClientName] = useState(matchedClient?.name || currentUser?.name || '');
  const [clientEmail, setClientEmail] = useState(matchedClient?.email || currentUser?.email || '');
  const [clientPhone, setClientPhone] = useState(matchedClient?.phone || currentUser?.phone || '');
  const [clientDocType, setClientDocType] = useState<'DNI' | 'RUC' | 'CE'>(
    matchedClient?.documentType || 'DNI'
  );
  const [clientDoc, setClientDoc] = useState(matchedClient?.document || '');
  const [deliveryAddress, setDeliveryAddress] = useState(matchedClient?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta de Crédito (Visa)');
  const [notes, setNotes] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'CLIENTE') {
      const c = clients.find((item) => item.email.toLowerCase() === currentUser.email.toLowerCase());
      setClientName(c?.name || currentUser.name);
      setClientEmail(c?.email || currentUser.email);
      setClientPhone(c?.phone || currentUser.phone || '');
      if (c) {
        setClientDocType(c.documentType);
        setClientDoc(c.document);
        setDeliveryAddress(c.address);
      }
    }
  }, [currentUser, clients]);

  const grossSubtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  // Live promo calculation preview
  const todayStr = new Date().toISOString().split('T')[0];
  const activePromo = appliedPromoCode
    ? promotions.find(
        (p) =>
          p.code.toUpperCase() === appliedPromoCode.trim().toUpperCase() &&
          p.status === 'ACTIVA' &&
          p.startDate <= todayStr &&
          p.endDate >= todayStr
      )
    : undefined;

  let discount = 0;
  let promoStatusMsg = '';
  if (appliedPromoCode) {
    if (!activePromo) {
      promoStatusMsg = 'El código ingresado no existe o ha expirado.';
    } else if (activePromo.minPurchaseAmount && grossSubtotal < activePromo.minPurchaseAmount) {
      promoStatusMsg = `Requiere compra mínima de ${storeSettings.currency} ${activePromo.minPurchaseAmount.toFixed(2)}.`;
    } else {
      discount =
        activePromo.type === 'PORCENTAJE'
          ? Number(((grossSubtotal * activePromo.value) / 100).toFixed(2))
          : Number(Math.min(activePromo.value, grossSubtotal).toFixed(2));
    }
  }

  const netSubtotal = Number(Math.max(0, grossSubtotal - discount).toFixed(2));
  const shippingFee = cart.length === 0 ? 0 : netSubtotal >= 299 ? 0 : 15.0;
  const total = Number((netSubtotal + shippingFee).toFixed(2));

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedPromoCode(promoInput.trim().toUpperCase());
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim() || !deliveryAddress.trim()) {
      setCheckoutError('Por favor complete todos los datos de contacto y entrega.');
      return;
    }

    const res = placeOnlineOrder({
      clientName,
      clientEmail,
      clientPhone,
      deliveryAddress,
      clientDocType,
      clientDoc,
      paymentMethod,
      promoCode: activePromo && !promoStatusMsg ? activePromo.code : undefined,
      notes,
    });

    if (!res.success) {
      setCheckoutError(res.error || 'No se pudo procesar el pedido.');
      return;
    }

    if (res.order) {
      setConfirmedOrder(res.order);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                Pedido Confirmado
              </div>
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-950">
                Orden {confirmedOrder.orderNumber}
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Gracias por tu compra, <strong>{confirmedOrder.clientName}</strong>. Tu pedido ha sido registrado en el centro logístico de NOVAStyle y el stock quedó reservado de inmediato.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
            <div>
              <div className="text-zinc-500">Dirección de envío</div>
              <div className="font-semibold text-zinc-950 mt-0.5">{confirmedOrder.deliveryAddress}</div>
            </div>
            <div>
              <div className="text-zinc-500">Método de pago</div>
              <div className="font-semibold text-zinc-950 mt-0.5">{confirmedOrder.paymentMethod}</div>
            </div>
          </div>

          <div className="divide-y divide-zinc-100 border-y border-zinc-200 text-xs">
            {confirmedOrder.items.map((item) => (
              <div key={item.variantId} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-zinc-950">{item.productName}</div>
                  <div className="text-zinc-500">
                    {item.variantDesc} · Cant: {item.quantity}
                  </div>
                </div>
                <div className="font-mono font-bold text-zinc-950 tabular-nums">
                  {storeSettings.currency} {item.subtotal.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-base font-extrabold text-zinc-950">
            <span>Total Pagado</span>
            <span className="font-mono tabular-nums">
              {storeSettings.currency} {confirmedOrder.total.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/mis-pedidos"
              className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-950 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Seguir mi Pedido</span>
            </Link>
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold rounded-lg transition"
            >
              <span>Seguir Comprando</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-500 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="font-editorial text-3xl font-bold text-zinc-950">
          Tu bolsa de compras está vacía
        </h1>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          Explora nuestra colección de temporada y selecciona tus prendas y tallas preferidas.
        </p>
        <Link
          to="/productos"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
        >
          <span>Ir al Catálogo</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="pb-5 border-b border-zinc-200 flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">
            Checkout Online
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-zinc-950 mt-1">
            Tu Bolsa de Compras
          </h1>
        </div>
        <span className="text-xs font-mono font-semibold text-zinc-500 tabular-nums">
          {cart.reduce((acc, i) => acc + i.quantity, 0)} prendas
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items + Coupon */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
            {cart.map((item) => {
              const prod = products.find((p) => p.id === item.productId);
              const variant = prod?.variants.find((v) => v.id === item.variantId);
              const maxStock = variant ? variant.stock : item.quantity;

              return (
                <div key={item.variantId} className="p-4 sm:p-5 flex items-center gap-4">
                  <Link
                    to={`/productos/${item.productId}`}
                    className="w-20 h-24 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0"
                  >
                    <SafeImage
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                      {item.brand}
                    </div>
                    <Link
                      to={`/productos/${item.productId}`}
                      className="text-sm font-bold text-zinc-950 hover:text-red-600 transition line-clamp-1 block"
                    >
                      {item.productName}
                    </Link>
                    <div className="text-xs text-zinc-600">
                      {item.variantDesc} · <span className="font-mono">{item.sku}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="inline-flex items-center border border-zinc-200 rounded-lg bg-zinc-50">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}
                          className="p-1.5 text-zinc-600 hover:text-zinc-950"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold font-mono tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= maxStock}
                          onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}
                          className="p-1.5 text-zinc-600 hover:text-zinc-950 disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold font-mono text-zinc-950 tabular-nums">
                          {storeSettings.currency} {(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.variantId)}
                          aria-label="Quitar producto"
                          className="p-1.5 text-zinc-400 hover:text-red-600 rounded-md transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Promo Code Box */}
          <form
            onSubmit={handleApplyPromo}
            className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-2"
          >
            <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-red-600" />
              <span>¿Tienes un código promocional?</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="Ej: BIENVENIDO10"
                className="flex-1 px-3 py-2 text-xs font-mono uppercase bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-red-600"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition"
              >
                Aplicar
              </button>
              {appliedPromoCode && (
                <button
                  type="button"
                  onClick={() => {
                    setAppliedPromoCode('');
                    setPromoInput('');
                  }}
                  className="px-3 py-2 bg-white border border-zinc-200 text-xs font-semibold text-zinc-600 rounded-lg hover:bg-zinc-100"
                >
                  Quitar
                </button>
              )}
            </div>
            {promoStatusMsg && (
              <p className="text-[11px] text-red-600 font-medium">{promoStatusMsg}</p>
            )}
            {activePromo && !promoStatusMsg && (
              <p className="text-[11px] text-emerald-700 font-semibold">
                Cupón {activePromo.code} aplicado: -{storeSettings.currency} {discount.toFixed(2)}
              </p>
            )}
          </form>
        </div>

        {/* Right: Checkout Form + Summary */}
        <form
          onSubmit={handleSubmitOrder}
          className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200 p-6 space-y-5 shadow-xs"
        >
          <h2 className="text-base font-bold text-zinc-950 pb-3 border-b border-zinc-100">
            Datos de Entrega y Pago
          </h2>

          {checkoutError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {checkoutError}
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Nombre completo *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: Gabriel Torres Morales"
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Correo electrónico *</label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="cliente@correo.com"
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="999 888 777"
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Doc.</label>
                <select
                  value={clientDocType}
                  onChange={(e) => setClientDocType(e.target.value as 'DNI' | 'RUC' | 'CE')}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                >
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="CE">CE</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block font-semibold text-zinc-700 mb-1">Número de documento</label>
                <input
                  type="text"
                  value={clientDoc}
                  onChange={(e) => setClientDoc(e.target.value)}
                  placeholder="47829103"
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Dirección de entrega *</label>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Av. Javier Prado Este 2450, San Borja, Lima"
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Método de pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-semibold"
              >
                <option value="Tarjeta de Crédito (Visa)">Tarjeta de Crédito / Débito</option>
                <option value="Yape">Yape</option>
                <option value="Plin">Plin</option>
                <option value="PagoEfectivo">PagoEfectivo</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Referencia o notas</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Timbre, horario preferido..."
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal prendas</span>
              <span className="font-mono tabular-nums">
                {storeSettings.currency} {grossSubtotal.toFixed(2)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Descuento ({activePromo?.code})</span>
                <span className="font-mono tabular-nums">
                  -{storeSettings.currency} {discount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600">
              <span>Envío estándar</span>
              <span className="font-mono tabular-nums">
                {shippingFee === 0 ? 'GRATIS' : `${storeSettings.currency} ${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-zinc-950 pt-2 border-t border-zinc-100">
              <span>Total a pagar</span>
              <span className="font-mono tabular-nums">
                {storeSettings.currency} {total.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_12px_26px_-8px_rgba(220,38,38,0.6)] transition"
          >
            <Lock className="w-4 h-4" />
            <span>Confirmar Pedido</span>
          </button>
        </form>
      </div>
    </div>
  );
};
