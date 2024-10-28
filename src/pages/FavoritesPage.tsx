import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bone } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import ProductComparison from '../components/ProductComparison';
import CompareButton from '../components/CompareButton';
import { Product } from '../types';

const FavoritesPage: React.FC = () => {
  const { favoriteProducts, loading, toggleFavorite, favorites } = useFavorites();
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [showComparison, setShowComparison] = useState(false);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-gray-100 rounded-lg h-96"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="My Favorite Pet Products"
        description="View and manage your favorite pet products, including food, toys, accessories and more."
        type="website"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Favorites</h1>
        
        {favoriteProducts.length === 0 ? (
          <div className="text-center py-12">
            <Bone className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start adding products you love to your favorites list
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteProducts.map((product) => (
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
        )}

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
    </>
  );
};

export default FavoritesPage;