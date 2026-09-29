import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  Tag,
  CreditCard,
  Banknote,
  Smartphone,
  Landmark,
  X,
  UserPlus,
  Receipt,
  RotateCw,
} from 'lucide-react';
import { Product, ProductVariant, SaleItem, PaymentMethod, Sale } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';

export const PosView: React.FC = () => {
  const {
    products,
    clients,
    promotions,
    cashRegister,
    storeSettings,
    processSale,
    saveClient,
    setActiveView,
    addToast,
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [selectedBrand, setSelectedBrand] = useState<string>('TODAS');
  const [selectedSize, setSelectedSize] = useState<string>('TODAS');
  const [selectedColor, setSelectedColor] = useState<string>('TODAS');

  // Cart state
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || 'cli-10');
  const [appliedPromoCode, setAppliedPromoCode] = useState<string>('');
  const [channel, setChannel] = useState<'PRESENCIAL' | 'ONLINE'>('PRESENCIAL');
  const [receiptType, setReceiptType] = useState<'BOLETA' | 'FACTURA' | 'TICKET'>('BOLETA');

  // Selected variant per product card (map of prodId -> variantId)
  const [selectedVariants, setSelectedVariants] = useState<{ [prodId: string]: string }>({});

  // Payment Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
  const [cashAmountReceived, setCashAmountReceived] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentGatewayStatus, setPaymentGatewayStatus] = useState<'IDLE' | 'PROCESSING' | 'APPROVED' | 'REJECTED'>('IDLE');

  // Completed sale receipt modal
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Quick Client creation modal
  const [showQuickClientModal, setShowQuickClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientDoc, setNewClientDoc] = useState('');
  const [newClientDocType, setNewClientDocType] = useState<'DNI' | 'RUC' | 'CE'>('DNI');

  // Categories & Brands lists for filters
  const categories = useMemo(() => {
    return ['TODAS', ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

  const brands = useMemo(() => {
    return ['TODAS', ...Array.from(new Set(products.map((p) => p.brand)))];
  }, [products]);

  const sizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.variants.forEach((v) => set.add(v.size)));
    return ['TODAS', ...Array.from(set)];
  }, [products]);

  const colors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.variants.forEach((v) => set.add(v.color)));
    return ['TODAS', ...Array.from(set)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== 'ACTIVO') return false;
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = selectedCategory === 'TODAS' || p.category === selectedCategory;
      const matchBrand = selectedBrand === 'TODAS' || p.brand === selectedBrand;
      const matchSize = selectedSize === 'TODAS' || p.variants.some((v) => v.size === selectedSize);
      const matchColor = selectedColor === 'TODAS' || p.variants.some((v) => v.color === selectedColor);

      return matchSearch && matchCategory && matchBrand && matchSize && matchColor;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand, selectedSize, selectedColor]);

  // Helper to get selected variant or default first available
  const getProductActiveVariant = (product: Product): ProductVariant | undefined => {
    const chosenId = selectedVariants[product.id];
    if (chosenId) {
      const found = product.variants.find((v) => v.id === chosenId);
      if (found) return found;
    }
    // Return first variant with stock > 0, or first variant
    return product.variants.find((v) => v.stock > 0) || product.variants[0];
  };

  // Add item to cart
  const handleAddToCart = (product: Product) => {
    const variant = getProductActiveVariant(product);
    if (!variant) return;

    if (variant.stock <= 0) {
      addToast('error', 'Sin Stock', `La variante seleccionada (${variant.size} / ${variant.color}) no cuenta con stock disponible.`);
      return;
    }

    // Check if item already in cart
    const existingIndex = cart.findIndex((it) => it.variantId === variant.id);
    if (existingIndex >= 0) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty + 1 > variant.stock) {
        addToast('warning', 'Límite de Stock', `Solo hay ${variant.stock} unidades disponibles en inventario.`);
        return;
      }
      setCart((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: Number(((item.quantity + 1) * item.unitPrice).toFixed(2)),
              }
            : item
        )
      );
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        variantId: variant.id,
        variantDesc: `${variant.size} / ${variant.color}`,
        sku: variant.sku,
        quantity: 1,
        unitPrice: product.price,
        subtotal: product.price,
        discount: 0,
      };
      setCart((prev) => [...prev, newItem]);
    }
  };

  const handleUpdateQuantity = (variantId: string, delta: number) => {
    const item = cart.find((it) => it.variantId === variantId);
    if (!item) return;

    // Find actual stock
    let maxStock = 0;
    for (const p of products) {
      const v = p.variants.find((variant) => variant.id === variantId);
      if (v) {
        maxStock = v.stock;
        break;
      }
    }

    const nextQty = item.quantity + delta;
    if (nextQty <= 0) {
      handleRemoveItem(variantId);
      return;
    }

    if (nextQty > maxStock) {
      addToast('warning', 'Stock Máximo', `No puede agregar más de ${maxStock} unidades disponibles.`);
      return;
    }

    setCart((prev) =>
      prev.map((it) =>
        it.variantId === variantId
          ? {
              ...it,
              quantity: nextQty,
              subtotal: Number((nextQty * it.unitPrice).toFixed(2)),
            }
          : it
      )
    );
  };

  const handleRemoveItem = (variantId: string) => {
    setCart((prev) => prev.filter((it) => it.variantId !== variantId));
  };

  const handleClearCart = () => {
    setCart([]);
    setAppliedPromoCode('');
  };

  // Calculations
  const grossSubtotal = cart.reduce((acc, it) => acc + it.subtotal, 0);

  // Validate and compute discount
  const activePromo = useMemo(() => {
    if (!appliedPromoCode.trim()) return null;
    return promotions.find((p) => p.code.toUpperCase() === appliedPromoCode.trim().toUpperCase());
  }, [appliedPromoCode, promotions]);

  const discountAmount = useMemo(() => {
    if (!activePromo || activePromo.status !== 'ACTIVA') return 0;
    const nowStr = new Date().toISOString().split('T')[0];
    if (activePromo.endDate < nowStr || activePromo.startDate > nowStr) return 0;
    if (activePromo.minPurchaseAmount && grossSubtotal < activePromo.minPurchaseAmount) return 0;

    if (activePromo.type === 'PORCENTAJE') {
      return Number(((grossSubtotal * activePromo.value) / 100).toFixed(2));
    } else if (activePromo.type === 'MONTO_FIJO') {
      return Math.min(activePromo.value, grossSubtotal);
    }
    return 0;
  }, [activePromo, grossSubtotal]);

  const netTotal = Math.max(0, grossSubtotal - discountAmount);
  const taxAmount = Number((netTotal - netTotal / (1 + storeSettings.taxRate)).toFixed(2));
  const baseSubtotal = Number((netTotal - taxAmount).toFixed(2));

  // Cash change calculation
  const cashNum = parseFloat(cashAmountReceived) || 0;
  const cashChange = Math.max(0, cashNum - netTotal);

  // Process Sale flow
  const handleInitiatePayment = () => {
    if (cart.length === 0) {
      addToast('warning', 'Carrito Vacío', 'Agregue productos al carrito antes de procesar.');
      return;
    }

    if (channel === 'PRESENCIAL' && !cashRegister.isOpen) {
      addToast('error', 'Caja Cerrada', 'La caja se encuentra cerrada. Debe abrir la caja para ventas presenciales.');
      return;
    }

    setIsPaymentModalOpen(true);
    setPaymentGatewayStatus('IDLE');
    setCashAmountReceived(netTotal.toFixed(2));
  };

  // Simulate gateway or confirm payment
  const handleConfirmSaleWithPayment = (simulateFailure = false) => {
    if (paymentMethod === 'EFECTIVO' && cashNum < netTotal) {
      addToast('error', 'Monto Insuficiente', `El monto recibido (S/ ${cashNum.toFixed(2)}) es menor que el total a pagar (S/ ${netTotal.toFixed(2)}).`);
      return;
    }

    if (paymentMethod !== 'EFECTIVO') {
      // Simulate electronic gateway
      setIsProcessingPayment(true);
      setPaymentGatewayStatus('PROCESSING');

      setTimeout(() => {
        setIsProcessingPayment(false);
        if (simulateFailure) {
          setPaymentGatewayStatus('REJECTED');
          addToast('error', 'Transacción Rechazada', 'La entidad bancaria rechazó la operación.');
        } else {
          setPaymentGatewayStatus('APPROVED');
          finishSaleExecution();
        }
      }, 1000);
    } else {
      finishSaleExecution();
    }
  };

  const finishSaleExecution = () => {
    const res = processSale({
      channel,
      clientId: selectedClientId,
      items: cart,
      promotionCode: appliedPromoCode || undefined,
      paymentMethod,
      paymentStatus: 'APROBADO',
      cashReceived: paymentMethod === 'EFECTIVO' ? cashNum : undefined,
      receiptType,
    });

    if (res.success && res.sale) {
      setCompletedSale(res.sale);
      setIsPaymentModalOpen(false);
      setCart([]);
      setAppliedPromoCode('');
      setCashAmountReceived('');
    }
  };

  // Create Quick Client
  const handleCreateQuickClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientDoc) return;
    saveClient({
      name: newClientName,
      document: newClientDoc,
      documentType: newClientDocType,
      phone: '900000000',
      email: 'cliente@correo.pe',
      address: 'Lima, Perú',
      status: 'ACTIVO',
    });
    setShowQuickClientModal(false);
    setNewClientName('');
    setNewClientDoc('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-7rem)]">
      {/* LEFT SECTION: Product Catalog & Fast Filters */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Cash closed banner warning if applicable */}
        {!cashRegister.isOpen && channel === 'PRESENCIAL' && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Atención:</strong> La caja física está actualmente <strong>cerrada</strong>. Debe abrirla para registrar ventas presenciales (Regla de negocio #5).
              </span>
            </div>
            <button
              onClick={() => setActiveView('cash-register')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition whitespace-nowrap shadow-xs"
            >
              Abrir Caja Ahora
            </button>
          </div>
        )}

        {/* Search & Filter Header */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Escanear código de barra, SKU o buscar prenda..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'TODAS' ? 'Todas las Categorías' : c}
                  </option>
                ))}
              </select>

              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
              >
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b === 'TODAS' ? 'Todas las Marcas' : b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick attribute tags */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-semibold">Tallas:</span>
            <div className="flex flex-wrap gap-1">
              {sizes.slice(0, 7).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                    selectedSize === sz
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400 font-semibold ml-2">Colores:</span>
            <div className="flex flex-wrap gap-1">
              {colors.slice(0, 6).map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                    selectedColor === col
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No se encontraron productos que coincidan con los filtros seleccionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const activeVariant = getProductActiveVariant(product);
                const isOutOfStock = !activeVariant || activeVariant.stock <= 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-blue-400 transition flex flex-col group"
                  >
                    {/* Image & Price Tag */}
                    <div className="relative h-40 bg-slate-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-slate-900/85 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-lg">
                        {storeSettings.currency} {product.price.toFixed(2)}
                      </div>
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur text-[10px] font-semibold text-slate-700 px-2 py-0.5 rounded-md">
                        {product.brand}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900 line-clamp-1">
                          {product.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {product.code}
                        </div>
                      </div>

                      {/* Variant selector (Size / Color) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Variante:</span>
                          <span
                            className={`font-semibold ${
                              isOutOfStock
                                ? 'text-rose-600'
                                : (activeVariant?.stock || 0) <= (activeVariant?.minStock || 0)
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {isOutOfStock
                              ? 'Agotado'
                              : `${activeVariant?.stock} en stock`}
                          </span>
                        </div>

                        <select
                          value={activeVariant?.id || ''}
                          onChange={(e) =>
                            setSelectedVariants((prev) => ({
                              ...prev,
                              [product.id]: e.target.value,
                            }))
                          }
                          className="w-full text-xs py-1 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                        >
                          {product.variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.size} / {v.color} ({v.stock} disp.) - {v.sku}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-500/20 active:scale-98'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isOutOfStock ? 'Sin stock' : 'Agregar al Carrito'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Cart, Client, Discount & Payment Checkout */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900">Carrito de Venta</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {cart.reduce((a, b) => a + b.quantity, 0)} ítems
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-[11px] text-rose-600 hover:underline"
              >
                Vaciar
              </button>
            )}
          </div>

          {/* Client & Channel Selection */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 space-y-2.5 text-xs">
            {/* Canal & Comprobante */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                  Canal
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="PRESENCIAL">Presencial (Tienda)</option>
                  <option value="ONLINE">Venta Telefónica/Online</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                  Comprobante
                </label>
                <select
                  value={receiptType}
                  onChange={(e) => setReceiptType(e.target.value as any)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="BOLETA">Boleta Electrónica</option>
                  <option value="FACTURA">Factura Electrónica</option>
                  <option value="TICKET">Ticket de Venta</option>
                </select>
              </div>
            </div>

            {/* Client selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-semibold text-slate-500">
                  Cliente Registrado
                </label>
                <button
                  onClick={() => setShowQuickClientModal(true)}
                  className="text-[10px] text-blue-600 hover:underline font-semibold flex items-center gap-0.5"
                >
                  <UserPlus className="w-3 h-3" />
                  + Nuevo
                </button>
              </div>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.documentType}: {c.document})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-3.5 divide-y divide-slate-100 max-h-72">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                El carrito está vacío.
                <p className="text-[11px] mt-1">Seleccione prendas del catálogo para agregar.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.variantId} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {item.productName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.variantDesc} • {storeSettings.currency} {item.unitPrice.toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateQuantity(item.variantId, -1)}
                      className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-800 font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.variantId, 1)}
                      className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Total & remove */}
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      {storeSettings.currency} {item.subtotal.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.variantId)}
                      className="text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Promotion Coupon section */}
          <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={appliedPromoCode}
                onChange={(e) => setAppliedPromoCode(e.target.value.toUpperCase())}
                placeholder="Código promocional (ej. BIENVENIDO10)"
                className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg uppercase placeholder:normal-case font-mono"
              />
            </div>
            {activePromo && (
              <div className="mt-1.5 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>
                  {activePromo.name} (-
                  {activePromo.type === 'PORCENTAJE'
                    ? `${activePromo.value}%`
                    : `S/ ${activePromo.value}`}
                  )
                </span>
              </div>
            )}
          </div>

          {/* Totals Summary */}
          <div className="p-4 border-t border-slate-200 bg-white space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>
                {storeSettings.currency} {grossSubtotal.toFixed(2)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Descuento aplicado:</span>
                <span>
                  - {storeSettings.currency} {discountAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Op. Gravada:</span>
              <span>
                {storeSettings.currency} {baseSubtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>I.G.V. (18%):</span>
              <span>
                {storeSettings.currency} {taxAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>TOTAL A PAGAR:</span>
              <span className="text-blue-700">
                {storeSettings.currency} {netTotal.toFixed(2)}
              </span>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleInitiatePayment}
              disabled={cart.length === 0}
              className={`w-full mt-3 py-3 px-4 rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 ${
                cart.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-98'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Procesar Venta ({storeSettings.currency} {netTotal.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* CU-05 / CU-11: Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pasarela & Proceso de Pago</h3>
                <p className="text-xs text-slate-500">CU-05 Procesar Pago y Confirmación</p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Total Display */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Total a Cobrar
                </span>
                <div className="text-3xl font-extrabold text-blue-950 mt-1">
                  {storeSettings.currency} {netTotal.toFixed(2)}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Método de Pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('EFECTIVO')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                      paymentMethod === 'EFECTIVO'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Efectivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('TARJETA')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                      paymentMethod === 'TARJETA'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Tarjeta (POS)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('YAPE_PLIN')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                      paymentMethod === 'YAPE_PLIN'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Yape / Plin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PAGO_ELECTRONICO')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                      paymentMethod === 'PAGO_ELECTRONICO'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Landmark className="w-4 h-4" />
                    <span>Pago Electrónico</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Payment Detail Form */}
              {paymentMethod === 'EFECTIVO' ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Monto Recibido ({storeSettings.currency})
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      value={cashAmountReceived}
                      onChange={(e) => setCashAmountReceived(e.target.value)}
                      className="w-full text-base font-bold font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Fast cash buttons */}
                  <div className="flex gap-1.5 flex-wrap">
                    {[20, 50, 100, 200].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCashAmountReceived(val.toString())}
                        className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        S/ {val}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCashAmountReceived(netTotal.toFixed(2))}
                      className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-[11px] font-semibold text-blue-700"
                    >
                      Exacto
                    </button>
                  </div>

                  {/* Vuelto display */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs font-bold">
                    <span className="text-slate-600">Vuelto a entregar:</span>
                    <span
                      className={`text-sm ${
                        cashNum < netTotal ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {cashNum < netTotal
                        ? 'Faltan S/ ' + (netTotal - cashNum).toFixed(2)
                        : `${storeSettings.currency} ${cashChange.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Integración Pasarela de Pagos</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Conexión simulada con adquirente (Visa/Mastercard/Billeteras digitales) para validar respuesta externa.
                  </p>

                  {paymentGatewayStatus === 'PROCESSING' && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-2 text-blue-800 font-medium">
                      <RotateCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Procesando pago con pasarela bancaria...</span>
                    </div>
                  )}

                  {paymentGatewayStatus === 'REJECTED' && (
                    <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 flex items-center gap-2 text-rose-800 font-medium">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>✕ Pago rechazado (Fondos insuficientes o error de pasarela).</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleConfirmSaleWithPayment(false)}
                  disabled={isProcessingPayment || (paymentMethod === 'EFECTIVO' && cashNum < netTotal)}
                  className={`w-full py-3 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2 transition ${
                    isProcessingPayment || (paymentMethod === 'EFECTIVO' && cashNum < netTotal)
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirmar Pago y Generar Comprobante</span>
                </button>

                {paymentMethod !== 'EFECTIVO' && (
                  <button
                    type="button"
                    onClick={() => handleConfirmSaleWithPayment(true)}
                    className="w-full py-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    Simular Rechazo de Pasarela (Prueba Regla #4)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Client creation modal */}
      {showQuickClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Registrar Nuevo Cliente</h3>
            <p className="text-xs text-slate-500 mb-4">Registro express para emisión de comprobante</p>
            <form onSubmit={handleCreateQuickClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Tipo Documento</label>
                <select
                  value={newClientDocType}
                  onChange={(e) => setNewClientDocType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="DNI">DNI (8 dígitos)</option>
                  <option value="RUC">RUC (11 dígitos)</option>
                  <option value="CE">Carnet de Extranjería</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">N° Documento</label>
                <input
                  type="text"
                  required
                  value={newClientDoc}
                  onChange={(e) => setNewClientDoc(e.target.value)}
                  placeholder="Ej: 72819203"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Nombre o Razón Social</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Ej: Carlos Silva"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickClientModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Guardar y Seleccionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completed Sale Receipt Modal */}
      {completedSale && (
        <ReceiptModal
          sale={completedSale}
          settings={storeSettings}
          isOpen={true}
          onClose={() => setCompletedSale(null)}
          onNewSale={() => setCompletedSale(null)}
        />
      )}
    </div>
  );
};
