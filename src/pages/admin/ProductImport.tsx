import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Search, Package, Plus, ExternalLink, AlertCircle } from 'lucide-react';
import ProductMetadataForm from '../../components/admin/ProductMetadataForm';

interface AmazonProduct {
  asin: string;
  product_title: string;
  product_price: string;
  product_original_price: string | null;
  product_star_rating: string;
  product_num_ratings: number;
  product_photo: string;
  product_url: string;
  category?: string;
}

interface ImportingProduct extends AmazonProduct {
  showMetadataForm?: boolean;
}

const ProductImport: React.FC = () => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<ImportingProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const searchProducts = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&country=US&category=pet-supplies`, {
        headers: {
          'x-rapidapi-key': 'xMLkKEDpmGmshxJwhSCLtZLwdx6jp1UJskHjsnZrMC5ch78jiq',
          'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
        }
      });

      const data = await response.json();

      if (data.status === 'OK' && data.data.products) {
        setProducts(data.data.products.map((p: AmazonProduct) => ({
          ...p,
          showMetadataForm: false
        })));
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const importProduct = async (product: ImportingProduct, metadata?: any) => {
    if (!selectedCategory) {
      setError('Please select a category before importing');
      return;
    }

    try {
      setImporting(prev => [...prev, product.asin]);

      // First, insert the basic product information
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert([{
          name: product.product_title,
          description: product.product_title,
          price: parseFloat(product.product_price.replace(/[^0-9.]/g, '')),
          rating: parseFloat(product.product_star_rating),
          rating_count: product.product_num_ratings,
          image: product.product_photo,
          affiliate_type: 'amazon',
          affiliate_link: product.product_url,
          category_id: selectedCategory,
          vendor: 'Amazon'
        }])
        .select()
        .single();

      if (productError) throw productError;

      // If metadata is provided, insert it
      if (metadata && newProduct) {
        const productId = newProduct.id;

        // Insert life stages
        if (metadata.life_stages) {
          await supabase
            .from('product_life_stages')
            .insert([{
              product_id: productId,
              ...metadata.life_stages
            }]);
        }

        // Insert size suitability
        if (metadata.size_suitability) {
          await supabase
            .from('product_size_suitability')
            .insert([{
              product_id: productId,
              ...metadata.size_suitability
            }]);
        }

        // Insert health benefits
        if (metadata.health_benefits?.length > 0) {
          await supabase
            .from('product_health_benefits')
            .insert(metadata.health_benefits.map((benefit: any) => ({
              product_id: productId,
              ...benefit
            })));
        }

        // Insert breed recommendations
        if (metadata.breed_recommendations?.length > 0) {
          await supabase
            .from('product_breed_recommendations')
            .insert(metadata.breed_recommendations.map((rec: any) => ({
              product_id: productId,
              ...rec
            })));
        }

        // Update product with additional fields
        await supabase
          .from('products')
          .update({
            ingredients: metadata.ingredients,
            nutritional_info: metadata.nutritional_info,
            features: metadata.features,
            safety_warnings: metadata.safety_warnings,
            activity_level_suitable: metadata.activity_level_suitable
          })
          .eq('id', productId);
      }

      // Remove the product from the list
      setProducts(prev => prev.filter(p => p.asin !== product.asin));
    } catch (err) {
      console.error('Error importing product:', err);
      setError('Failed to import product');
    } finally {
      setImporting(prev => prev.filter(id => id !== product.asin));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import Products</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Amazon products..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="">Select Category</option>
              <option value="food">Food & Nutrition</option>
              <option value="toys">Toys & Entertainment</option>
              <option value="health">Health & Wellness</option>
              <option value="grooming">Grooming & Care</option>
              <option value="training">Training & Behavior</option>
              <option value="bedding">Beds & Furniture</option>
            </select>
            <button
              onClick={searchProducts}
              disabled={loading || !query.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map((product) => (
          <div
            key={product.asin}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="aspect-w-16 aspect-h-9">
              {product.product_photo ? (
                <img
                  src={product.product_photo}
                  alt={product.product_title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {product.product_title}
              </h3>
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.product_star_rating} stars
                  </span>
                </div>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.product_num_ratings.toLocaleString()} ratings
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {product.product_price}
                  </div>
                  {product.product_original_price && (
                    <div className="text-sm text-gray-500 line-through">
                      {product.product_original_price}
                    </div>
                  )}
                </div>
                {product.showMetadataForm ? (
                  <button
                    onClick={() => setProducts(prev => prev.map(p => 
                      p.asin === product.asin ? { ...p, showMetadataForm: false } : p
                    ))}
                    className="flex items-center px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => setProducts(prev => prev.map(p => 
                      p.asin === product.asin ? { ...p, showMetadataForm: true } : p
                    ))}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Details
                  </button>
                )}
              </div>
            </div>

            {product.showMetadataForm && (
              <div className="p-4 border-t dark:border-gray-700">
                <ProductMetadataForm
                  productId={product.asin}
                  onSubmit={async (metadata) => {
                    await importProduct(product, metadata);
                  }}
                  onCancel={() => setProducts(prev => prev.map(p => 
                    p.asin === product.asin ? { ...p, showMetadataForm: false } : p
                  ))}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Search for products to import
        </div>
      )}
    </div>
  );
};

export default ProductImport;