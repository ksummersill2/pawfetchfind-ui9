import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, SplitSquareHorizontal, ExternalLink } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isCompareSelected?: boolean;
  onCompareToggle?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  isCompareSelected,
  onCompareToggle
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow relative group">
      <div className="absolute top-2 right-2 z-10 flex space-x-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-sm"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite
                ? 'text-red-500 fill-current'
                : 'text-gray-400'
            }`}
          />
        </button>
        {onCompareToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCompareToggle();
            }}
            className={`p-2 rounded-full transition-colors shadow-sm ${
              isCompareSelected
                ? 'bg-blue-600 text-white'
                : 'bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-gray-400'
            }`}
            aria-label={isCompareSelected ? 'Remove from comparison' : 'Add to comparison'}
          >
            <SplitSquareHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>

      {product.discount > 0 && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium z-10">
          {product.discount}% OFF
        </div>
      )}

      <Link to={`/product/${product.id}`} className="block">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
          {product.affiliate_type && (
            <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
              <ExternalLink className="w-3 h-3" />
              <span>{product.affiliate_type === 'amazon' ? 'Amazon' : 'Affiliate'}</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{product.vendor}</p>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">{product.rating}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{product.description}</p>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">${product.price}</span>
              {product.discount > 0 && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                  ${(product.price * (100 + product.discount) / 100).toFixed(2)}
                </span>
              )}
            </div>
            <button 
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
            >
              View Details
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;