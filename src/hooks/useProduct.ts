import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';
import { generateAffiliateLink } from '../lib/amazonAffiliateLink';

export const useProduct = (productId: string | undefined) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('Product ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // First fetch the product details
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (productError) throw productError;
        if (!productData) throw new Error('Product not found');

        // Generate proper affiliate link if it's an Amazon product
        if (productData.affiliate_type === 'amazon' && productData.affiliate_link) {
          productData.affiliate_link = generateAffiliateLink(productData.affiliate_link);
        }

        // Then fetch reviews with user profiles
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            title,
            content,
            helpful_count,
            verified_purchase,
            created_at,
            profiles:user_id (
              email,
              display_name,
              avatar_url
            )
          `)
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;

        // Format reviews data
        const formattedReviews = reviewsData?.map(review => ({
          ...review,
          user_name: review.profiles?.display_name || review.profiles?.email?.split('@')[0] || 'Anonymous'
        })) || [];

        // Combine product data with reviews
        setProduct({
          ...productData,
          reviews: formattedReviews
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
};