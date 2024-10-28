import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://imeweqrvijtxaubchhon.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltZXdlcXJ2aWp0eGF1YmNoaG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk4MzQwNTEsImV4cCI6MjA0NTQxMDA1MX0.oZnvg1FWXG_hRM9pCRq8FZLER6QqEUqXM7oqcReg6uM';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface DbProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  popularity: number;
  discount: number;
  vendor: string;
  image: string;
  category_id: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface DbCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface DbReview {
  id: number;
  product_id: number;
  user_id: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

// Admin authentication
export const adminLogin = async (password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@pawfectfind.com',
    password
  });

  if (error) {
    throw error;
  }

  return data;
};

// Products
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as DbProduct[];
};

export const createProduct = async (product: Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as DbProduct;
};

export const updateProduct = async (id: number, updates: Partial<DbProduct>) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as DbProduct;
};

export const deleteProduct = async (id: number) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
};

// Categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as DbCategory[];
};

export const createCategory = async (category: Omit<DbCategory, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as DbCategory;
};

export const updateCategory = async (id: string, updates: Partial<DbCategory>) => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as DbCategory;
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
};

// Reviews
export const getReviews = async (productId: number) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as DbReview[];
};

export const createReview = async (review: Omit<DbReview, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as DbReview;
};

export const updateReview = async (id: number, updates: Partial<DbReview>) => {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as DbReview;
};

export const deleteReview = async (id: number) => {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
};