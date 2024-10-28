import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, ArrowLeft, Share2, Info, Shield, Truck, MessageCircle, ExternalLink } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { useProduct } from '../hooks/useProduct';
import SEO from '../components/SEO';
import ProductReview from '../components/ProductReview';
import ReviewForm from '../components/ReviewForm';
import ShareModal from '../components/ShareModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import PawfectRating from '../components/PawfectRating';
import { Review } from '../types';
import { supabase, fetchFromSupabase } from '../lib/supabaseClient';

const ProductPage: React.FC = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const { product, loading, error } = useProduct(productId);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  const handleReviewSubmit = async (newReview: Omit<Review, 'id' | 'helpful'>) => {
    if (!product) return;

    try {
      await fetchFromSupabase(
        supabase
          .from('reviews')
          .insert([{ ...newReview, product_id: product.id }])
          .select()
          .single()
      );

      window.location.reload();
      setShowReviewForm(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleHelpful = async (reviewId: number) => {
    if (!product) return;

    try {
      await fetchFromSupabase(
        supabase
          .from('reviews')
          .update({ helpful_count: product.reviews?.find(r => r.id === reviewId)?.helpful + 1 })
          .eq('id', reviewId)
      );

      window.location.reload();
    } catch (err) {
      console.error('Error marking review as helpful:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !product) {
    return <ErrorMessage message={error || 'Product not found'} />;
  }

  const handlePurchase = () => {
    if (product.affiliate_link) {
      window.open(product.affiliate_link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <SEO 
        title={product.name}
        description={product.description}
        image={product.image}
        type="product"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.additional_images && product.additional_images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {product.additional_images.map((image, index) => (
                  <div key={index} className="aspect-w-1 aspect-h-1 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  by {product.vendor}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label={favorites.includes(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart
                    className={`w-6 h-6 ${
                      favorites.includes(product.id)
                        ? 'text-red-500 fill-current'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Share product"
                >
                  <Share2 className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <PawfectRating
                productId={product.id}
                pawfectRating={product.pawfect_rating}
                pawfectRatingCount={product.pawfect_rating_count}
                amazonRating={product.rating}
                amazonRatingCount={product.product_num_ratings}
                onRatingSubmit={() => window.location.reload()}
              />
            </div>

            <div className="mb-6">
              <div className="flex items-baseline mb-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${product.price.toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <span className="ml-2 text-lg text-gray-500 line-through">
                    ${(product.price * (100 + product.discount) / 100).toFixed(2)}
                  </span>
                )}
              </div>
              {product.discount > 0 && (
                <span className="inline-block bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  Save {product.discount}%
                </span>
              )}
            </div>

            <div className="prose dark:prose-invert mb-6">
              <p>{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Truck className="w-5 h-5 mr-2" />
                Free Shipping
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Shield className="w-5 h-5 mr-2" />
                Secure Transaction
              </div>
            </div>

            <button
              onClick={handlePurchase}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
            >
              {product.affiliate_type === 'amazon' ? (
                <>
                  <ExternalLink className="w-5 h-5 mr-2" />
                  View on Amazon
                </>
              ) : (
                'Buy Now'
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-8 -mb-px">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Product Details
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.reviews?.length || 0})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === 'details' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                <ul className="space-y-2">
                  {product.tags.map((tag, index) => (
                    <li key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                      <Info className="w-5 h-5 mr-2" />
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Brand</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{product.vendor}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                      {product.category_id}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Customer Reviews
                </h2>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Write a Review
                </button>
              </div>

              <div className="space-y-6">
                {product.reviews?.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    No reviews yet. Be the first to review this product!
                  </p>
                ) : (
                  product.reviews?.map(review => (
                    <ProductReview
                      key={review.id}
                      review={review}
                      onHelpful={handleHelpful}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Write a Review
            </h3>
            <ReviewForm
              productId={product.id}
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        </div>
      )}

      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          product={product}
        />
      )}
    </>
  );
};

export default ProductPage;