import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { SafeImage } from '../ui/MotionPrimitives';
import { TiltCard3D } from '../ui/TiltCard3D';
import {
  ChevronRight,
  ShoppingBag,
  Minus,
  Plus,
  Check,
  Tag,
  Truck,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

export const StoreProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, promotions, storeSettings, addToCart } = useApp();

  const product = products.find((p) => p.id === id && p.status === 'ACTIVO');

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product && product.variants.length > 0) {
      const firstAvail = product.variants.find((v) => v.stock > 0) || product.variants[0];
      setSelectedVariantId(firstAvail.id);
      setQuantity(1);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-editorial text-3xl font-bold text-zinc-950">
          Prenda no disponible
        </h1>
        <p className="text-sm text-zinc-500">
          El producto solicitado no se encuentra activo en el catálogo actual.
        </p>
        <Link
          to="/productos"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-950 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al catálogo</span>
        </Link>
      </div>
    );
  }

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const todayStr = new Date().toISOString().split('T')[0];
  const applicablePromo = promotions.find(
    (p) =>
      p.status === 'ACTIVA' &&
      p.startDate <= todayStr &&
      p.endDate >= todayStr &&
      (p.targetType === 'GENERAL' ||
        (p.targetType === 'CATEGORIA' && p.targetValue === product.category))
  );

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.status === 'ACTIVO' && p.category === product.category)
    .slice(0, 4);

  const handleAddToBag = (goToCart: boolean) => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    const added = addToCart(
      {
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        category: product.category,
        image: product.image,
        variantId: selectedVariant.id,
        variantDesc: `${selectedVariant.size} / ${selectedVariant.color}`,
        sku: selectedVariant.sku,
        unitPrice: product.price,
      },
      quantity
    );
    if (added && goToCart) {
      navigate('/carrito');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-14">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Link to="/" className="hover:text-zinc-950">
          Inicio
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          to={`/productos?categoria=${encodeURIComponent(product.category)}`}
          className="hover:text-zinc-950"
        >
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-950 font-semibold truncate">{product.name}</span>
      </div>

      {/* Main Sticky Editorial Gallery + Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Sticky Image */}
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 aspect-[4/5]">
            <SafeImage
              src={product.image}
              alt={product.name}
              fallbackTitle={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Contiguous Purchase Module */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2 pb-5 border-b border-zinc-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-[0.18em] text-red-600">
                {product.brand}
              </span>
              <span className="font-mono text-zinc-500">{product.code}</span>
            </div>
            <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-zinc-950 leading-tight">
              {product.name}
            </h1>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-950 tabular-nums pt-1">
              {storeSettings.currency} {product.price.toFixed(2)}
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed pt-2">{product.description}</p>
          </div>

          {/* Variant Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-zinc-800">
                Talla y Color
              </span>
              {selectedVariant && (
                <span className="font-mono text-zinc-500">
                  SKU: {selectedVariant.sku}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {product.variants.map((v) => {
                const isSelected = v.id === selectedVariant?.id;
                const outOfStock = v.stock <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => {
                      setSelectedVariantId(v.id);
                      setQuantity(1);
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      outOfStock
                        ? 'border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'border-red-600 bg-red-50/50 text-zinc-950 ring-1 ring-red-600'
                        : 'border-zinc-200 bg-white hover:border-zinc-950 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Talla {v.size}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-red-600" />}
                    </div>
                    <div className="text-[11px] text-zinc-600 mt-0.5 truncate">{v.color}</div>
                    <div className="text-[10px] font-mono mt-1 tabular-nums text-zinc-500">
                      {outOfStock ? 'Agotado' : `${v.stock} disponibles`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                Cantidad
              </span>
              <div className="inline-flex items-center border border-zinc-300 rounded-lg bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-zinc-700 hover:bg-zinc-100 rounded-l-lg"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold font-mono tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(selectedVariant ? selectedVariant.stock : 1, q + 1)
                    )
                  }
                  disabled={!selectedVariant || quantity >= selectedVariant.stock}
                  className="p-2.5 text-zinc-700 hover:bg-zinc-100 rounded-r-lg disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                onClick={() => handleAddToBag(false)}
                className="inline-flex items-center justify-center gap-2 py-3.5 px-5 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Agregar a la Bolsa</span>
              </button>

              <button
                type="button"
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                onClick={() => handleAddToBag(true)}
                className="inline-flex items-center justify-center gap-2 py-3.5 px-5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-300 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition"
              >
                <span>Comprar Ahora</span>
              </button>
            </div>
          </div>

          {applicablePromo && (
            <div className="p-4 rounded-xl bg-zinc-950 text-white flex items-start gap-3">
              <Tag className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold">
                  Cupón disponible: <span className="font-mono text-red-400">{applicablePromo.code}</span>
                </div>
                <p className="text-zinc-300 mt-0.5">{applicablePromo.description}</p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-red-600 shrink-0" />
              <span>Envío gratis desde {storeSettings.currency} 299.00</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
              <span>Stock verificado en almacén central</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-zinc-200 space-y-6">
          <h2 className="font-editorial text-2xl font-bold text-zinc-950">
            También te puede interesar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((rel) => (
              <TiltCard3D
                key={rel.id}
                elevation="subtle"
                maxTilt={4}
                className="bg-white rounded-xl border border-zinc-200 overflow-hidden group"
              >
                <Link to={`/productos/${rel.id}`} className="block aspect-[4/5] bg-zinc-100 overflow-hidden">
                  <SafeImage
                    src={rel.image}
                    alt={rel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </Link>
                <div className="p-4">
                  <div className="text-[11px] text-zinc-500">{rel.brand}</div>
                  <Link
                    to={`/productos/${rel.id}`}
                    className="text-xs font-bold text-zinc-950 hover:text-red-600 line-clamp-1 mt-0.5 block"
                  >
                    {rel.name}
                  </Link>
                  <div className="text-sm font-extrabold font-mono text-zinc-950 mt-2 tabular-nums">
                    {storeSettings.currency} {rel.price.toFixed(2)}
                  </div>
                </div>
              </TiltCard3D>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
