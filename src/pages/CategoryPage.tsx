import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Filter, SortDesc, ChevronDown } from 'lucide-react';
import { categories } from '../data/categories';
import ProductCard from '../components/ProductCard';
import { useFavorites } from '../hooks/useFavorites';
import ProductComparison from '../components/ProductComparison';
import CompareButton from '../components/CompareButton';
import { Product } from '../types';
import { useProducts } from '../hooks/useProducts';
import { Helmet } from 'react-helmet-async';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams();
  const { products, loading, error } = useProducts(categoryId);
  const { favorites, toggleFavorite } = useFavorites();
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [showFilters, setShowFilters] = useState(false);

  const category = categories.find(c => c.id === categoryId);

  const filteredProducts = products
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .filter(p => selectedVendors.length === 0 || selectedVendors.includes(p.vendor))
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return b.popularity - a.popularity;
      }
    });

  const handleCompareToggle = (product: Product) => {
    setCompareProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length < 4) {
        return [...prev, product];
      }
      return prev;
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-gray-100 rounded-lg h-96"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category?.name || 'Category'} - PawfectFind</title>
        <meta name="description" content={category?.description || 'Browse our selection of pet products'} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Category Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{category?.name}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{category?.description}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
                {showFilters ? (
                  <ChevronDown className="w-4 h-4 ml-1 transform rotate-180" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {showFilters && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-slideDown">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Price Range
                    </h3>
                    <div className="space-y-4">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full accent-blue-600"
                      />
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Vendors
                    </h3>
                    <div className="space-y-2">
                      {Array.from(new Set(products.map(p => p.vendor))).map((vendor) => (
                        <label key={vendor} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedVendors.includes(vendor)}
                            onChange={(e) => {
                              setSelectedVendors(prev =>
                                e.target.checked
                                  ? [...prev, vendor]
                                  : prev.filter(v => v !== vendor)
                              );
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">{vendor}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={toggleFavorite}
                isCompareSelected={compareProducts.some(p => p.id === product.id)}
                onCompareToggle={() => handleCompareToggle(product)}
              />
            ))}
          </div>

          <CompareButton
            selectedCount={compareProducts.length}
            onClick={() => setShowComparison(true)}
          />

          {showComparison && (
            <ProductComparison
              products={compareProducts}
              onClose={() => setShowComparison(false)}
              onRemoveProduct={(productId) => {
                setCompareProducts(prev => prev.filter(p => p.id !== productId));
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;