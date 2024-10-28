import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = 'https://imeweqrvijtxaubchhon.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltZXdlcXJ2aWp0eGF1YmNoaG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk4MzQwNTEsImV4cCI6MjA0NTQxMDA1MX0.oZnvg1FWXG_hRM9pCRq8FZLER6QqEUqXM7oqcReg6uM';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Helper function to handle Supabase queries
export async function fetchFromSupabase<T>(query: Promise<{ data: T | null; error: any }>) {
  const { data, error } = await query;
  if (error) throw error;
  if (!data) throw new Error('No data returned');
  return data;
}

// Reviews types
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  helpful_count: number;
  verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  profile?: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

// Reviews functions
export async function getProductReviews(productId: string) {
  return fetchFromSupabase(
    supabase
      .from('reviews')
      .select(`
        *,
        profile:profiles(username, display_name, avatar_url)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
  );
}

export async function createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'profile'>) {
  return fetchFromSupabase(
    supabase
      .from('reviews')
      .insert([review])
      .select(`
        *,
        profile:profiles(username, display_name, avatar_url)
      `)
      .single()
  );
}

export async function updateReview(id: string, updates: Partial<Review>) {
  return fetchFromSupabase(
    supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        profile:profiles(username, display_name, avatar_url)
      `)
      .single()
  );
}

export async function deleteReview(id: string) {
  return fetchFromSupabase(
    supabase
      .from('reviews')
      .delete()
      .eq('id', id)
  );
}

export async function incrementHelpfulCount(reviewId: string) {
  return fetchFromSupabase(
    supabase
      .from('reviews')
      .update({ helpful_count: supabase.rpc('increment') })
      .eq('id', reviewId)
      .select(`
        *,
        profile:profiles(username, display_name, avatar_url)
      `)
      .single()
  );
}

// Profile types
export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Profile functions
export async function getProfile(userId: string) {
  return fetchFromSupabase(
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
  );
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  return fetchFromSupabase(
    supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
  );
}