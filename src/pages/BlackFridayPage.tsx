import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Tag, Filter, SortDesc, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useFavorites } from '../hooks/useFavorites';
import { Product } from '../types';
import SEO from '../components/SEO';

const BlackFridayPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite } = useFavorites();
  const [showFilters, setShowFilters] = useState(false);
  const [minDiscount, setMinDiscount] = useState(20);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'discount' | 'price'>('discount');

  useEffect(() => {
    fetchBlackFridayDeals();
  }, []);

  const fetchBlackFridayDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('discount', 0)
        .order('discount', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching Black Friday deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(product => product.discount >= minDiscount)
    .filter(product => 
      selectedCategories.length === 0 || 
      selectedCategories.includes(product.category_id)
    )
    .sort((a, b) => {
      if (sortBy === 'discount') {
        return b.discount - a.discount;
      }
      return a.price - b.price;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Black Friday Pet Deals"
        description="Exclusive Black Friday deals on premium pet products. Save big on food, toys, accessories and more!"
      />

      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Tag className="w-6 h-6 text-red-500" />
            <span className="text-red-500 font-semibold">BLACK FRIDAY</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Biggest Pet Deals of the Year
          </h1>
          <p className="text-xl text-gray-300 text-center">
            Save up to 70% on premium pet products
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'discount' | 'price')}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <option value="discount">Biggest Discounts</option>
              <option value="price">Lowest Price</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 animate-slideDown">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Minimum Discount
                </h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="70"
                    value={minDiscount}
                    onChange={(e) => setMinDiscount(Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{minDiscount}% off</span>
                    <span>70% off</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Categories
                </h3>
                <div className="space-y-2">
                  {['Food', 'Toys', 'Accessories', 'Health'].map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.toLowerCase())}
                        onChange={(e) => {
                          setSelectedCategories(prev =>
                            e.target.checked
                              ? [...prev, category.toLowerCase()]
                              : prev.filter(c => c !== category.toLowerCase())
                          );
                        }}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No deals found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default BlackFridayPage;