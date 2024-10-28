import React, { useState } from 'react';
import { Star, Dog } from 'lucide-react';
import { usePawfectRating } from '../hooks/usePawfectRating';
import { useAuth } from '../hooks/useAuth';

interface PawfectRatingProps {
  productId: string;
  avgRating: number;
  ratingCount: number;
  amazonRating?: number;
  amazonRatingCount?: number;
  onRatingSubmit: () => void;
}

const PawfectRating: React.FC<PawfectRatingProps> = ({
  productId,
  avgRating,
  ratingCount,
  amazonRating,
  amazonRatingCount,
  onRatingSubmit
}) => {
  const { isAuthenticated } = useAuth();
  const { userRating, submitRating, isSubmitting, error } = usePawfectRating(productId);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleRatingClick = async (rating: number) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (isSubmitting) return;

    const success = await submitRating(rating);
    if (success) {
      onRatingSubmit();
    }
  };

  const renderRatingStars = (rating: number, isInteractive: boolean = false) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => isInteractive && !isSubmitting && handleRatingClick(star)}
            onMouseEnter={() => isInteractive && setHoveredRating(star)}
            onMouseLeave={() => isInteractive && setHoveredRating(null)}
            disabled={!isInteractive || isSubmitting}
            className={`${
              isInteractive && !isSubmitting ? 'cursor-pointer' : 'cursor-default'
            } p-1 -ml-1 transition-colors duration-150`}
            title={`Rate ${star} ${star === 1 ? 'paw' : 'paws'}`}
          >
            {isInteractive ? (
              <Dog
                className={`w-6 h-6 ${
                  star <= (hoveredRating || userRating?.rating || 0)
                    ? 'text-blue-500 fill-current'
                    : 'text-gray-300 dark:text-gray-600'
                } transition-colors duration-150`}
              />
            ) : (
              <Star
                className={`w-5 h-5 ${
                  star <= rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            PawfectFind Rating
          </h3>
          <div className="flex items-center space-x-4">
            {renderRatingStars(avgRating, true)}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
            </div>
          </div>
          {userRating && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              Your rating: {userRating.rating} {userRating.rating === 1 ? 'paw' : 'paws'}
            </p>
          )}
        </div>

        {amazonRating && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Amazon Rating
            </h3>
            <div className="flex items-center space-x-4">
              {renderRatingStars(amazonRating)}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {amazonRatingCount} {amazonRatingCount === 1 ? 'rating' : 'ratings'}
              </div>
            </div>
          </div>
        )}
      </div>

      {showLoginPrompt && !isAuthenticated && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Please sign in to rate this product
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {isSubmitting && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Submitting your rating...
        </div>
      )}
    </div>
  );
};

export default PawfectRating;