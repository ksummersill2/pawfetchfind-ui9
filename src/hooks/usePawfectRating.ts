import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

interface PawfectRating {
  rating: number;
  comment?: string;
}

export const usePawfectRating = (productId: string) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<PawfectRating | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRating();
    }
  }, [user, productId]);

  const fetchUserRating = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('product_ratings')
        .select('rating, comment')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setUserRating(data);
    } catch (err) {
      console.error('Error fetching user rating:', err);
      setError('Failed to fetch your rating');
    }
  };

  const submitRating = async (rating: number, comment?: string) => {
    if (!user) {
      setError('You must be logged in to rate products');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: upsertError } = await supabase
        .from('product_ratings')
        .upsert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'product_id,user_id'
        });

      if (upsertError) throw upsertError;

      await fetchUserRating();
      return true;
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    userRating,
    submitRating,
    isSubmitting,
    error,
    refreshRating: fetchUserRating
  };
};