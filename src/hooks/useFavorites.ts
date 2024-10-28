import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import { Product } from '../types';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setFavoriteProducts([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user?.id);

      if (fetchError) throw fetchError;

      const favoriteIds = (data || []).map(f => f.product_id);
      setFavorites(favoriteIds);

      if (favoriteIds.length > 0) {
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', favoriteIds);

        if (productsError) throw productsError;
        setFavoriteProducts(products || []);
      } else {
        setFavoriteProducts([]);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) return;

    try {
      const isFavorited = favorites.includes(productId);

      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
        setFavorites(prev => prev.filter(id => id !== productId));
        setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ 
            user_id: user.id, 
            product_id: productId 
          }]);

        if (error) throw error;
        setFavorites(prev => [...prev, productId]);

        // Fetch the product details
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (productError) throw productError;
        if (product) {
          setFavoriteProducts(prev => [...prev, product]);
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError(err instanceof Error ? err.message : 'Failed to update favorite');
    }
  };

  return {
    favorites,
    favoriteProducts,
    loading,
    error,
    toggleFavorite,
    refreshFavorites: fetchFavorites
  };
};