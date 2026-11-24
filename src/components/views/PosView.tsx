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
  RotateCw,
} from 'lucide-react';
import { Product, ProductVariant, SaleItem, PaymentMethod, Sale } from '../../types';
import { ReceiptModal } from '../common/ReceiptModal';
import { TiltCard3D } from '../ui/TiltCard3D';
import { ModalShell, SafeImage } from '../ui/MotionPrimitives';

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

  // Selected variant per product card
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

  const getProductActiveVariant = (product: Product): ProductVariant | undefined => {
    const chosenId = selectedVariants[product.id];
    if (chosenId) {
      const found = product.variants.find((v) => v.id === chosenId);
      if (found) return found;
    }
    return product.variants.find((v) => v.stock > 0) || product.variants[0];
  };

  const handleAddToCart = (product: Product) => {
    const variant = getProductActiveVariant(product);
    if (!variant) return;

    if (variant.stock <= 0) {
      addToast('error', 'Sin Stock', `La variante (${variant.size} / ${variant.color}) no tiene stock disponible.`);
      return;
    }

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

  const grossSubtotal = cart.reduce((acc, it) => acc + it.subtotal, 0);

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

  const cashNum = parseFloat(cashAmountReceived) || 0;
  const cashChange = Math.max(0, cashNum - netTotal);

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

  const handleConfirmSaleWithPayment = (simulateFailure = false) => {
    if (paymentMethod === 'EFECTIVO' && cashNum < netTotal) {
      addToast('error', 'Monto Insuficiente', `El monto recibido (S/ ${cashNum.toFixed(2)}) es menor que el total a pagar (S/ ${netTotal.toFixed(2)}).`);
      return;
    }

    if (paymentMethod !== 'EFECTIVO') {
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
      }, 900);
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
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      {/* LEFT SECTION: Product Catalog & Fast Filters */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {!cashRegister.isOpen && channel === 'PRESENCIAL' && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Caja física cerrada:</strong> Debe abrir la caja para registrar ventas presenciales.
              </span>
            </div>
            <button
              onClick={() => setActiveView('cash-register')}
              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg font-semibold transition whitespace-nowrap"
            >
              Abrir Caja
            </button>
          </div>
        )}

        {/* Search & Filter Header */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Escanear código, SKU o buscar prenda..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/15 focus:border-red-600 transition"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none text-zinc-800"
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
                className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none text-zinc-800"
              >
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b === 'TODAS' ? 'Todas las Marcas' : b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-zinc-100">
            <span className="text-[11px] text-zinc-500 font-semibold">Tallas:</span>
            <div className="flex flex-wrap gap-1">
              {sizes.slice(0, 7).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    selectedSize === sz
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-zinc-500 font-semibold ml-2">Colores:</span>
            <div className="flex flex-wrap gap-1">
              {colors.slice(0, 6).map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    selectedColor === col
                      ? 'bg-zinc-950 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Product Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-zinc-200 text-zinc-500 text-xs">
              No se encontraron productos que coincidan con los filtros seleccionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const activeVariant = getProductActiveVariant(product);
                const isOutOfStock = !activeVariant || activeVariant.stock <= 0;

                return (
                  <TiltCard3D
                    key={product.id}
                    elevation="subtle"
                    maxTilt={4}
                    className="bg-white rounded-xl border border-zinc-200 overflow-hidden hover:border-red-500/70 transition flex flex-col group"
                  >
                    <div className="relative h-44 bg-zinc-100 overflow-hidden">
                      <SafeImage
                        src={product.image}
                        alt={product.name}
                        fallbackTitle={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-zinc-950/90 text-white text-xs font-bold font-mono px-2.5 py-1 rounded-md tabular-nums shadow">
                        {storeSettings.currency} {product.price.toFixed(2)}
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 bg-white/95 text-[10px] font-bold uppercase tracking-wider text-zinc-900 px-2 py-0.5 rounded">
                        {product.brand}
                      </div>
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="text-xs font-bold text-zinc-950 line-clamp-1">
                          {product.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {product.code} · {product.category}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-zinc-500">
                          <span>Variante:</span>
                          <span
                            className={`font-semibold tabular-nums ${
                              isOutOfStock
                                ? 'text-red-600'
                                : (activeVariant?.stock || 0) <= (activeVariant?.minStock || 0)
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }`}
                          >
                            {isOutOfStock ? 'Agotado' : `${activeVariant?.stock} disp.`}
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
                          className="w-full text-xs py-1.5 px-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:border-red-600"
                        >
                          {product.variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.size} / {v.color} ({v.stock} u.) · {v.sku}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          isOutOfStock
                            ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                            : 'bg-zinc-950 hover:bg-red-600 text-white active:scale-[0.98]'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isOutOfStock ? 'Sin stock' : 'Agregar'}</span>
                      </button>
                    </div>
                  </TiltCard3D>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Cart & Checkout */}
      <div className="w-full lg:w-96 shrink-0 flex flex-col">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col flex-1 overflow-hidden lg:sticky lg:top-20">
          {/* Obsidian Cart Header */}
          <div className="px-4 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 text-white">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-red-500" />
              <h2 className="text-xs font-bold tracking-tight">Venta Actual</h2>
              <span className="text-[11px] font-mono font-bold text-red-400 tabular-nums">
                ({cart.reduce((a, b) => a + b.quantity, 0)})
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-[11px] text-zinc-400 hover:text-red-400 transition"
              >
                Vaciar
              </button>
            )}
          </div>

          {/* Channel, Receipt & Client Selection */}
          <div className="p-3.5 border-b border-zinc-200 bg-zinc-50 space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1">Canal</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as 'PRESENCIAL' | 'ONLINE')}
                  className="w-full p-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900"
                >
                  <option value="PRESENCIAL">Presencial (Tienda)</option>
                  <option value="ONLINE">Online / Telefónica</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-zinc-500 block mb-1">
                  Comprobante
                </label>
                <select
                  value={receiptType}
                  onChange={(e) => setReceiptType(e.target.value as 'BOLETA' | 'FACTURA' | 'TICKET')}
                  className="w-full p-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900"
                >
                  <option value="BOLETA">Boleta Electrónica</option>
                  <option value="FACTURA">Factura Electrónica</option>
                  <option value="TICKET">Ticket de Venta</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-semibold text-zinc-500">Cliente</label>
                <button
                  onClick={() => setShowQuickClientModal(true)}
                  className="text-[10px] text-red-600 hover:underline font-semibold flex items-center gap-0.5"
                >
                  <UserPlus className="w-3 h-3" />
                  Nuevo cliente
                </button>
              </div>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900"
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
          <div className="flex-1 overflow-y-auto p-3.5 divide-y divide-zinc-100 max-h-72">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-xs">
                El carrito está vacío.
                <p className="text-[11px] mt-1">Seleccione prendas del catálogo para agregar.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.variantId} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-zinc-950 truncate">
                      {item.productName}
                    </div>
                    <div className="text-[10px] text-zinc-500 tabular-nums">
                      {item.variantDesc} · {storeSettings.currency} {item.unitPrice.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateQuantity(item.variantId, -1)}
                      className="p-1 rounded bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-zinc-950 font-mono tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.variantId, 1)}
                      className="p-1 rounded bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold font-mono text-zinc-950 tabular-nums">
                      {storeSettings.currency} {item.subtotal.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.variantId)}
                      className="text-zinc-400 hover:text-red-600 transition mt-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Promotion Coupon */}
          <div className="p-3.5 border-t border-zinc-200 bg-zinc-50">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={appliedPromoCode}
                onChange={(e) => setAppliedPromoCode(e.target.value.toUpperCase())}
                placeholder="Código promocional (ej. BIENVENIDO10)"
                className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg uppercase placeholder:normal-case font-mono focus:outline-none focus:border-red-600"
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
          <div className="p-4 border-t border-zinc-200 bg-white space-y-1.5 text-xs tabular-nums">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal bruto:</span>
              <span className="font-mono">{storeSettings.currency} {grossSubtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Descuento aplicado:</span>
                <span className="font-mono">- {storeSettings.currency} {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-500">
              <span>Op. Gravada:</span>
              <span className="font-mono">{storeSettings.currency} {baseSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>I.G.V. (18%):</span>
              <span className="font-mono">{storeSettings.currency} {taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-zinc-950 pt-2 border-t border-zinc-200">
              <span>TOTAL:</span>
              <span className="text-red-600 font-mono">
                {storeSettings.currency} {netTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleInitiatePayment}
              disabled={cart.length === 0}
              className={`w-full mt-3 py-3 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                cart.length === 0
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_10px_22px_-8px_rgba(220,38,38,0.65)] active:scale-[0.99]'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Procesar Venta ({storeSettings.currency} {netTotal.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* CU-05 / CU-11: Payment Modal */}
      <ModalShell
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        maxWidthClass="max-w-md"
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
          <div>
            <h3 className="text-sm font-bold">Pasarela & Cobro</h3>
            <p className="text-[11px] text-zinc-400">CU-05 Procesar Pago y Confirmación</p>
          </div>
          <button
            onClick={() => setIsPaymentModalOpen(false)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-zinc-950 text-white text-center border border-zinc-800">
            <span className="text-[10px] font-semibold text-red-400 uppercase tracking-widest">
              Total a Cobrar
            </span>
            <div className="text-3xl font-extrabold font-mono text-white mt-1 tabular-nums">
              {storeSettings.currency} {netTotal.toFixed(2)}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-2">Método de Pago</label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'EFECTIVO', label: 'Efectivo', icon: Banknote },
                  { id: 'TARJETA', label: 'Tarjeta (POS)', icon: CreditCard },
                  { id: 'YAPE_PLIN', label: 'Yape / Plin', icon: Smartphone },
                  { id: 'PAGO_ELECTRONICO', label: 'Pago Electrónico', icon: Landmark },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 transition ${
                      active
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {paymentMethod === 'EFECTIVO' ? (
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Monto Recibido ({storeSettings.currency})
                </label>
                <input
                  type="number"
                  step="0.10"
                  value={cashAmountReceived}
                  onChange={(e) => setCashAmountReceived(e.target.value)}
                  className="w-full text-base font-bold font-mono px-3 py-2 bg-white border border-zinc-300 rounded-lg text-zinc-950 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 tabular-nums"
                />
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {[20, 50, 100, 200].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCashAmountReceived(val.toString())}
                    className="px-2.5 py-1 bg-white border border-zinc-200 rounded text-[11px] font-mono font-semibold text-zinc-700 hover:bg-zinc-100"
                  >
                    S/ {val}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCashAmountReceived(netTotal.toFixed(2))}
                  className="px-2.5 py-1 bg-red-50 border border-red-200 rounded text-[11px] font-semibold text-red-700"
                >
                  Exacto
                </button>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-zinc-200 text-xs font-bold tabular-nums">
                <span className="text-zinc-600">Vuelto a entregar:</span>
                <span className={`text-sm font-mono ${cashNum < netTotal ? 'text-red-600' : 'text-emerald-700'}`}>
                  {cashNum < netTotal
                    ? 'Faltan S/ ' + (netTotal - cashNum).toFixed(2)
                    : `${storeSettings.currency} ${cashChange.toFixed(2)}`}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                <CreditCard className="w-4 h-4 text-red-600" />
                <span>Pasarela de Pagos</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Validación con adquirente bancario (Visa / Mastercard / Billeteras digitales).
              </p>

              {paymentGatewayStatus === 'PROCESSING' && (
                <div className="p-3 bg-zinc-950 text-white rounded-lg flex items-center gap-2 font-medium">
                  <RotateCw className="w-4 h-4 animate-spin text-red-500" />
                  <span>Procesando pago con pasarela bancaria...</span>
                </div>
              )}

              {paymentGatewayStatus === 'REJECTED' && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2 text-red-800 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>Pago rechazado por la entidad emisora.</span>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleConfirmSaleWithPayment(false)}
              disabled={isProcessingPayment || (paymentMethod === 'EFECTIVO' && cashNum < netTotal)}
              className={`w-full py-3 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 transition ${
                isProcessingPayment || (paymentMethod === 'EFECTIVO' && cashNum < netTotal)
                  ? 'bg-zinc-300 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 shadow-md'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirmar Pago y Emitir Comprobante</span>
            </button>

            {paymentMethod !== 'EFECTIVO' && (
              <button
                type="button"
                onClick={() => handleConfirmSaleWithPayment(true)}
                className="w-full py-2 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Simular Rechazo de Pasarela (Prueba Regla #4)
              </button>
            )}
          </div>
        </div>
      </ModalShell>

      {/* Quick Client Creation Modal */}
      <ModalShell
        isOpen={showQuickClientModal}
        onClose={() => setShowQuickClientModal(false)}
        maxWidthClass="max-w-sm"
      >
        <div className="p-5">
          <h3 className="text-sm font-bold text-zinc-950 mb-1">Registrar Nuevo Cliente</h3>
          <p className="text-xs text-zinc-500 mb-4">Registro rápido para emisión de comprobante</p>
          <form onSubmit={handleCreateQuickClient} className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-700 mb-1 font-semibold">Tipo Documento</label>
              <select
                value={newClientDocType}
                onChange={(e) => setNewClientDocType(e.target.value as 'DNI' | 'RUC' | 'CE')}
                className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg"
              >
                <option value="DNI">DNI (8 dígitos)</option>
                <option value="RUC">RUC (11 dígitos)</option>
                <option value="CE">Carnet de Extranjería</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-700 mb-1 font-semibold">N° Documento</label>
              <input
                type="text"
                required
                value={newClientDoc}
                onChange={(e) => setNewClientDoc(e.target.value)}
                placeholder="Ej: 72819203"
                className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-700 mb-1 font-semibold">Nombre o Razón Social</label>
              <input
                type="text"
                required
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Ej: Carlos Silva"
                className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowQuickClientModal(false)}
                className="px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
              >
                Guardar y Seleccionar
              </button>
            </div>
          </form>
        </div>
      </ModalShell>

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
