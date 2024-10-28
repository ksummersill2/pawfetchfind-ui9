import React from 'react';
import { X, Star, Check, Minus } from 'lucide-react';
import { Product } from '../types';

interface ProductComparisonProps {
  products: Product[];
  onClose: () => void;
  onRemoveProduct: (productId: number) => void;
}

const ProductComparison: React.FC<ProductComparisonProps> = ({
  products,
  onClose,
  onRemoveProduct,
}) => {
  const features = [
    'Price',
    'Rating',
    'Vendor',
    'Discount',
    'Category',
    ...Array.from(new Set(products.flatMap(p => p.tags))),
  ];

  const getFeatureValue = (product: Product, feature: string) => {
    switch (feature.toLowerCase()) {
      case 'price':
        return `$${product.price.toFixed(2)}`;
      case 'rating':
        return (
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
            {product.rating}
          </div>
        );
      case 'vendor':
        return product.vendor;
      case 'discount':
        return product.discount > 0 ? `${product.discount}% OFF` : 'No discount';
      case 'category':
        return product.categoryId;
      default:
        return product.tags.includes(feature) ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Minus className="w-4 h-4 text-gray-400" />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Compare Products
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white w-32">
                      Features
                    </th>
                    {products.map((product) => (
                      <th key={product.id} className="p-4 min-w-[250px]">
                        <div className="relative group">
                          <button
                            onClick={() => onRemoveProduct(product.id)}
                            className="absolute -top-2 -right-2 p-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-lg mb-2"
                          />
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </h3>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {features.map((feature) => (
                    <tr key={feature}>
                      <td className="p-4 text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {feature}
                      </td>
                      {products.map((product) => (
                        <td key={product.id} className="p-4 text-sm text-gray-500 dark:text-gray-400">
                          {getFeatureValue(product, feature)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison;