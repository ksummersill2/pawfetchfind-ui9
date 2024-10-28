import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface LifeStage {
  id: string;
  breed_id: string;
  stage_name: 'puppy' | 'junior' | 'adult' | 'senior' | 'geriatric';
  start_age_months: number;
  end_age_months: number;
  min_weight_kg: number;
  max_weight_kg: number;
  daily_calories_per_kg: number;
}

export const useBreedLifeStages = (breedId: string) => {
  const [stages, setStages] = useState<LifeStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLifeStages();
  }, [breedId]);

  const fetchLifeStages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('breed_life_stages')
        .select('*')
        .eq('breed_id', breedId)
        .order('start_age_months');

      if (error) throw error;
      setStages(data || []);
    } catch (err) {
      console.error('Error fetching breed life stages:', err);
      setError('Failed to load life stages');
    } finally {
      setLoading(false);
    }
  };

  const saveLifeStages = async (stages: Omit<LifeStage, 'id' | 'breed_id'>[]) => {
    try {
      setLoading(true);
      
      // Delete existing stages
      const { error: deleteError } = await supabase
        .from('breed_life_stages')
        .delete()
        .eq('breed_id', breedId);

      if (deleteError) throw deleteError;

      // Insert new stages
      const { error: insertError } = await supabase
        .from('breed_life_stages')
        .insert(stages.map(stage => ({
          ...stage,
          breed_id: breedId
        })));

      if (insertError) throw insertError;

      await fetchLifeStages();
      return true;
    } catch (err) {
      console.error('Error saving breed life stages:', err);
      setError('Failed to save life stages');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyCalories = async (ageMonths: number, weightKg: number) => {
    try {
      const { data, error } = await supabase
        .rpc('calculate_daily_calories', {
          breed_id: breedId,
          age_months: ageMonths,
          weight_kg: weightKg
        });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error calculating daily calories:', err);
      return null;
    }
  };

  return {
    stages,
    loading,
    error,
    saveLifeStages,
    calculateDailyCalories,
    refreshStages: fetchLifeStages
  };
};