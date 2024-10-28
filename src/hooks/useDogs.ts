import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export interface Dog {
  id: string;
  user_id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  activity_level: number;
  image: string | null;
  health_conditions: string[];
  created_at: string;
  updated_at: string;
}

export const useDogs = () => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDogs();
    }
  }, [user]);

  const fetchDogs = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('dogs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setDogs(data || []);
    } catch (err) {
      console.error('Error fetching dogs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dogs');
    } finally {
      setLoading(false);
    }
  };

  const addDog = async (dogData: Omit<Dog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('dogs')
        .insert([{ ...dogData, user_id: user?.id }])
        .select()
        .single();

      if (insertError) throw insertError;
      setDogs(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding dog:', err);
      throw err;
    }
  };

  const updateDog = async (id: string, updates: Partial<Dog>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('dogs')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setDogs(prev => prev.map(dog => dog.id === id ? data : dog));
      return data;
    } catch (err) {
      console.error('Error updating dog:', err);
      throw err;
    }
  };

  const deleteDog = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('dogs')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (deleteError) throw deleteError;
      setDogs(prev => prev.filter(dog => dog.id !== id));
    } catch (err) {
      console.error('Error deleting dog:', err);
      throw err;
    }
  };

  return {
    dogs,
    loading,
    error,
    addDog,
    updateDog,
    deleteDog,
    refreshDogs: fetchDogs
  };
};