import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import BreedLifeStageForm from './BreedLifeStageForm';

interface LifeStage {
  id: string;
  breed_id: string;
  stage_name: 'puppy' | 'adult' | 'senior';
  start_age_months: number;
  end_age_months: number | null;
  average_weight_kg: number;
  min_weight_kg: number;
  max_weight_kg: number;
  low_activity_multiplier: number;
  medium_activity_multiplier: number;
  high_activity_multiplier: number;
  very_high_activity_multiplier: number;
  base_calories_per_kg: number;
}

interface BreedLifeStagesProps {
  breedId: string;
}

const BreedLifeStages: React.FC<BreedLifeStagesProps> = ({ breedId }) => {
  const [lifeStages, setLifeStages] = useState<LifeStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStage, setEditingStage] = useState<LifeStage | null>(null);

  useEffect(() => {
    fetchLifeStages();
  }, [breedId]);

  const fetchLifeStages = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('breed_life_stages')
        .select('*')
        .eq('breed_id', breedId)
        .order('start_age_months');

      if (fetchError) throw fetchError;
      setLifeStages(data || []);
    } catch (err) {
      console.error('Error fetching life stages:', err);
      setError('Failed to load life stages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (stageData: LifeStage) => {
    try {
      if (editingStage) {
        const { error } = await supabase
          .from('breed_life_stages')
          .update(stageData)
          .eq('id', editingStage.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('breed_life_stages')
          .insert([stageData]);

        if (error) throw error;
      }

      setShowForm(false);
      setEditingStage(null);
      fetchLifeStages();
    } catch (err) {
      console.error('Error saving life stage:', err);
      setError('Failed to save life stage');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this life stage?')) return;

    try {
      const { error } = await supabase
        .from('breed_life_stages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchLifeStages();
    } catch (err) {
      console.error('Error deleting life stage:', err);
      setError('Failed to delete life stage');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading life stages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Life Stages
        </h3>
        <button
          onClick={() => {
            setEditingStage(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Life Stage
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingStage ? 'Edit Life Stage' : 'Add Life Stage'}
            </h2>
            <BreedLifeStageForm
              breedId={breedId}
              lifeStage={editingStage || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingStage(null);
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {lifeStages.map((stage) => (
          <div
            key={stage.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {stage.stage_name} Stage
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stage.start_age_months} - {stage.end_age_months ?? '∞'} months
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingStage(stage);
                    setShowForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(stage.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Weight Range</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {stage.min_weight_kg} - {stage.max_weight_kg} kg
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Average Weight</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {stage.average_weight_kg} kg
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Base Calories</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {stage.base_calories_per_kg} kcal/kg
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Activity Multipliers</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {stage.low_activity_multiplier}x - {stage.very_high_activity_multiplier}x
                </p>
              </div>
            </div>
          </div>
        ))}

        {lifeStages.length === 0 && (
          <p className="text-center text-gray-600 dark:text-gray-400 py-4">
            No life stages defined yet. Click "Add Life Stage" to get started.
          </p>
        )}
      </div>
    </div>
  );
};

export default BreedLifeStages;