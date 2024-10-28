import React, { useState } from 'react';
import { AlertCircle, Plus, X, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface HealthCondition {
  id: string;
  name: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  common_symptoms: string[];
  dietary_restrictions: string[];
  exercise_restrictions: string[];
}

interface DogHealthCondition {
  id: string;
  condition_id: string;
  diagnosed_date: string;
  notes: string;
  condition: HealthCondition;
}

interface DogHealthConditionsProps {
  dogId: string;
  existingConditions: DogHealthCondition[];
  onUpdate: () => void;
}

const DogHealthConditions: React.FC<DogHealthConditionsProps> = ({
  dogId,
  existingConditions,
  onUpdate
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [diagnosedDate, setDiagnosedDate] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [availableConditions, setAvailableConditions] = useState<HealthCondition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    fetchAvailableConditions();
  }, []);

  const fetchAvailableConditions = async () => {
    try {
      const { data, error } = await supabase
        .from('health_conditions')
        .select('*')
        .order('name');

      if (error) throw error;
      setAvailableConditions(data || []);
    } catch (err) {
      console.error('Error fetching health conditions:', err);
      setError('Failed to load health conditions');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCondition || !diagnosedDate) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('dog_health_conditions')
        .insert([{
          dog_id: dogId,
          condition_id: selectedCondition,
          diagnosed_date: diagnosedDate,
          notes: notes.trim()
        }]);

      if (error) throw error;

      setShowAddForm(false);
      setSelectedCondition('');
      setDiagnosedDate('');
      setNotes('');
      onUpdate();
    } catch (err) {
      console.error('Error adding health condition:', err);
      setError('Failed to add health condition');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCondition = async (conditionId: string) => {
    try {
      const { error } = await supabase
        .from('dog_health_conditions')
        .delete()
        .eq('id', conditionId);

      if (error) throw error;
      onUpdate();
    } catch (err) {
      console.error('Error removing health condition:', err);
      setError('Failed to remove health condition');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      case 'severe':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Health Conditions
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Condition
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Condition
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              required
            >
              <option value="">Select a condition</option>
              {availableConditions
                .filter(condition => !existingConditions.some(ec => ec.condition_id === condition.id))
                .map(condition => (
                  <option key={condition.id} value={condition.id}>
                    {condition.name}
                  </option>
                ))
              }
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Diagnosed Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={diagnosedDate}
                onChange={(e) => setDiagnosedDate(e.target.value)}
                className="w-full pl-10 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              placeholder="Add any specific notes about this condition..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Condition'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {existingConditions.map((dogCondition) => (
          <div
            key={dogCondition.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {dogCondition.condition.name}
                  </h4>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    getSeverityColor(dogCondition.condition.severity)
                  }`}>
                    {dogCondition.condition.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Diagnosed: {new Date(dogCondition.diagnosed_date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleRemoveCondition(dogCondition.id)}
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {dogCondition.notes && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {dogCondition.notes}
              </p>
            )}

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-1">Symptoms</h5>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                  {dogCondition.condition.common_symptoms.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-1">Dietary Restrictions</h5>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                  {dogCondition.condition.dietary_restrictions.map((restriction, index) => (
                    <li key={index}>{restriction}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-1">Exercise Restrictions</h5>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                  {dogCondition.condition.exercise_restrictions.map((restriction, index) => (
                    <li key={index}>{restriction}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}

        {existingConditions.length === 0 && !showAddForm && (
          <p className="text-center text-gray-600 dark:text-gray-400 py-4">
            No health conditions added yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default DogHealthConditions;