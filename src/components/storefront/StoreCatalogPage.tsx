import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { TiltCard3D } from '../ui/TiltCard3D';
import { SafeImage } from '../ui/MotionPrimitives';
import { Search, ShoppingBag, SlidersHorizontal, X } from 'lucide-react';

export const StoreCatalogPage: React.FC = () => {
  const { products, categories, storeSettings, addToCart } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCat = searchParams.get('categoria') || 'TODAS';
  const initialQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedBrand, setSelectedBrand] = useState('TODAS');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC'>('RELEVANCE');

  useEffect(() => {
    const catParam = searchParams.get('categoria') || 'TODAS';
    const qParam = searchParams.get('q') || '';
    setSelectedCategory(catParam);
    setSearchTerm(qParam);
  }, [searchParams]);

  const activeProducts = useMemo(() => products.filter((p) => p.status === 'ACTIVO'), [products]);

  const availableCategories = useMemo(() => {
    const activeNames = categories.filter((c) => c.status === 'ACTIVA').map((c) => c.name);
    const prodCats = activeProducts.map((p) => p.category);
    return ['TODAS', ...Array.from(new Set([...activeNames, ...prodCats]))];
  }, [categories, activeProducts]);

  const availableBrands = useMemo(() => {
    return ['TODAS', ...Array.from(new Set(activeProducts.map((p) => p.brand)))];
  }, [activeProducts]);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const list = activeProducts.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      const matchCat = selectedCategory === 'TODAS' || p.category === selectedCategory;
      const matchBrand = selectedBrand === 'TODAS' || p.brand === selectedBrand;
      const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
      const matchStock = !onlyInStock || totalStock > 0;
      return matchSearch && matchCat && matchBrand && matchStock;
    });

    if (sortBy === 'PRICE_ASC') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'PRICE_DESC') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [activeProducts, searchTerm, selectedCategory, selectedBrand, onlyInStock, sortBy]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const next = new URLSearchParams(searchParams);
    if (cat === 'TODAS') next.delete('categoria');
    else next.set('categoria', cat);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('TODAS');
    setSelectedBrand('TODAS');
    setOnlyInStock(false);
    setSortBy('RELEVANCE');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">
            Colección Oficial
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-zinc-950 mt-1">
            Catálogo de Moda
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Consulta precios, tallas disponibles y disponibilidad en tiempo real.
          </p>
        </div>
        <div className="text-xs font-mono font-semibold text-zinc-600 tabular-nums">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
        </div>
      </div>

      {/* Category Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {availableCategories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition shrink-0 ${
                isActive
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {cat === 'TODAS' ? 'Todas' : cat}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar prenda, marca o estilo..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-red-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none text-zinc-800"
          >
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b === 'TODAS' ? 'Todas las marcas' : b}
              </option>
            ))}
          </select>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC')}
          className="px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none text-zinc-800"
        >
          <option value="RELEVANCE">Destacados</option>
          <option value="PRICE_ASC">Menor precio</option>
          <option value="PRICE_DESC">Mayor precio</option>
        </select>

        <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => setOnlyInStock(e.target.checked)}
            className="accent-red-600"
          />
          <span>Solo disponibles</span>
        </label>

        {(searchTerm || selectedCategory !== 'TODAS' || selectedBrand !== 'TODAS' || onlyInStock) && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
          <p className="text-sm font-bold text-zinc-900">
            No encontramos prendas con los filtros aplicados.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition"
          >
            Ver todo el catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
            const firstAvailable = product.variants.find((v) => v.stock > 0);
            const sizesList = Array.from(new Set(product.variants.map((v) => v.size))).join(' · ');

            return (
              <TiltCard3D
                key={product.id}
                elevation="subtle"
                maxTilt={5}
                className="bg-white rounded-xl border border-zinc-200 overflow-hidden flex flex-col group"
              >
                <Link
                  to={`/productos/${product.id}`}
                  className="relative aspect-[4/5] bg-zinc-100 overflow-hidden block"
                >
                  <SafeImage
                    src={product.image}
                    alt={product.name}
                    fallbackTitle={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-zinc-950/85 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                    {product.brand}
                  </div>
                  {totalStock === 0 && (
                    <div className="absolute inset-0 bg-zinc-950/55 flex items-center justify-center">
                      <span className="px-3 py-1 bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider rounded">
                        Agotado
                      </span>
                    </div>
                  )}
                </Link>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>{product.category}</span>
                      <span className="font-mono">{sizesList}</span>
                    </div>
                    <Link
                      to={`/productos/${product.id}`}
                      className="text-sm font-bold text-zinc-950 hover:text-red-600 transition mt-1 line-clamp-1 block"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{product.description}</p>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <span className="text-base font-extrabold font-mono text-zinc-950 tabular-nums">
                      {storeSettings.currency} {product.price.toFixed(2)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {firstAvailable && (
                        <button
                          type="button"
                          onClick={() =>
                            addToCart(
                              {
                                productId: product.id,
                                productName: product.name,
                                brand: product.brand,
                                category: product.category,
                                image: product.image,
                                variantId: firstAvailable.id,
                                variantDesc: `${firstAvailable.size} / ${firstAvailable.color}`,
                                sku: firstAvailable.sku,
                                unitPrice: product.price,
                              },
                              1
                            )
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-950 hover:bg-red-600 text-white text-[11px] font-bold rounded-lg transition whitespace-nowrap"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Agregar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </TiltCard3D>
            );
          })}
        </div>
      )}
    </div>
  );
};
