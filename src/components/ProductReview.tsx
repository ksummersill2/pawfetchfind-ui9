import React from 'react';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { Review } from '../types';

interface ProductReviewProps {
  review: Review;
  onHelpful: (reviewId: number) => void;
}

const ProductReview: React.FC<ProductReviewProps> = ({ review, onHelpful }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-6 last:border-0">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            {review.title}
          </h4>
        </div>
        {review.verified && (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">Verified Purchase</span>
          </div>
        )}
      </div>

      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
        <span>By {review.userName}</span>
        <span className="mx-2">•</span>
        <span>{new Date(review.date).toLocaleDateString()}</span>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4">{review.comment}</p>

      <button
        onClick={() => onHelpful(review.id)}
        className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
      >
        <ThumbsUp className="w-4 h-4 mr-1" />
        Helpful ({review.helpful})
      </button>
    </div>
  );
};

export default ProductReview;