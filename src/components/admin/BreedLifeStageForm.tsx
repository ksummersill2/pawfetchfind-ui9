import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { BreedLifeStage } from '../../types';

interface BreedLifeStageFormProps {
  breedId: string;
  lifeStage?: BreedLifeStage;
  onSubmit: (data: Omit<BreedLifeStage, 'id'>) => void;
  onCancel: () => void;
}

const BreedLifeStageForm: React.FC<BreedLifeStageFormProps> = ({
  breedId,
  lifeStage,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<BreedLifeStage, 'id'>>({
    breed_id: breedId,
    gender: lifeStage?.gender || 'male',
    stage_name: lifeStage?.stage_name || 'puppy',
    start_age_months: lifeStage?.start_age_months || 0,
    end_age_months: lifeStage?.end_age_months || null,
    average_weight_kg: lifeStage?.average_weight_kg || 0,
    min_weight_kg: lifeStage?.min_weight_kg || 0,
    max_weight_kg: lifeStage?.max_weight_kg || 0,
    average_height_cm: lifeStage?.average_height_cm || 0,
    min_height_cm: lifeStage?.min_height_cm || 0,
    max_height_cm: lifeStage?.max_height_cm || 0,
    low_activity_multiplier: lifeStage?.low_activity_multiplier || 1.2,
    medium_activity_multiplier: lifeStage?.medium_activity_multiplier || 1.4,
    high_activity_multiplier: lifeStage?.high_activity_multiplier || 1.6,
    very_high_activity_multiplier: lifeStage?.very_high_activity_multiplier || 1.8,
    base_calories_per_kg: lifeStage?.base_calories_per_kg || 130
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.min_weight_kg >= formData.max_weight_kg) {
      newErrors.weight_range = 'Maximum weight must be greater than minimum weight';
    }

    if (formData.min_height_cm >= formData.max_height_cm) {
      newErrors.height_range = 'Maximum height must be greater than minimum height';
    }

    if (formData.average_weight_kg < formData.min_weight_kg || formData.average_weight_kg > formData.max_weight_kg) {
      newErrors.average_weight = 'Average weight must be between minimum and maximum weight';
    }

    if (formData.average_height_cm < formData.min_height_cm || formData.average_height_cm > formData.max_height_cm) {
      newErrors.average_height = 'Average height must be between minimum and maximum height';
    }

    if (formData.start_age_months < 0) {
      newErrors.age_range = 'Start age cannot be negative';
    }

    if (formData.end_age_months !== null && formData.end_age_months <= formData.start_age_months) {
      newErrors.age_range = 'End age must be greater than start age';
    }

    const multipliers = [
      formData.low_activity_multiplier,
      formData.medium_activity_multiplier,
      formData.high_activity_multiplier,
      formData.very_high_activity_multiplier
    ];

    for (let i = 1; i < multipliers.length; i++) {
      if (multipliers[i] <= multipliers[i - 1]) {
        newErrors.multipliers = 'Activity multipliers must increase from low to very high';
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gender
          </label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              gender: e.target.value as 'male' | 'female'
            }))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Life Stage
          </label>
          <select
            value={formData.stage_name}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              stage_name: e.target.value as 'puppy' | 'adult' | 'senior'
            }))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="puppy">Puppy</option>
            <option value="adult">Adult</option>
            <option value="senior">Senior</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Age Range (months)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={formData.start_age_months}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                start_age_months: Number(e.target.value)
              }))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              min="0"
              placeholder="Start"
            />
            <span>to</span>
            <input
              type="number"
              value={formData.end_age_months || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                end_age_months: e.target.value ? Number(e.target.value) : null
              }))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              min="0"
              placeholder="End (optional)"
            />
          </div>
          {errors.age_range && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.age_range}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Physical Characteristics</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Weight Range (kg)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <input
                type="number"
                value={formData.min_weight_kg}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  min_weight_kg: Number(e.target.value)
                }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                min="0"
                step="0.1"
                placeholder="Min"
              />
              <span className="text-xs text-gray-500">Minimum</span>
            </div>
            <div>
              <input
                type="number"
                value={formData.average_weight_kg}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  average_weight_kg: Number(e.target.value)
                }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                min="0"
                step="0.1"
                placeholder="Average"
              />
              <span className="text-xs text-gray-500">Average</span>
            </div>
            <div>
              <input
                type="number"
                value={formData.max_weight_kg}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  max_weight_kg: Number(e.target.value)
                }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                min="0"
                step="0.1"
                placeholder="Max"
              />
              <span className="text-xs text-gray-500">Maximum</span>
            </div>
          </div>
          {errors.weight_range && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.weight_range}
            </p>
          )}
          {errors.average_weight && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.average_weight}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Height Range (cm)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <input
                type="number"
                value={formData.min_height_cm}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  min_height_cm: Number(e.target.value)
                }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                min="0"
                step="0.1"
                placeholder="Min"
              />
              <span className="text-xs text-gray-500">Minimum</span>
            </div>
            <div>
              <input
                type="number"
                value={formData.average_height_cm}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  average_height_cm: Number(e.target.value)
                }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                min="0"
                step="0.1"
                placeholder="Average"
              />
              <span className="text-xs text-gray-500">Average</span>
            </div>
            <div>
              <input
                type="number"
                value={formData.max_height_cm}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  max_height_cm: Number(e.target.value)
                }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                min="0"
                step="0.1"
                placeholder="Max"
              />
              <span className="text-xs text-gray-500">Maximum</span>
            </div>
          </div>
          {errors.height_range && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.height_range}
            </p>
          )}
          {errors.average_height && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.average_height}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activity & Nutrition</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Base Calories per kg
          </label>
          <input
            type="number"
            value={formData.base_calories_per_kg}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              base_calories_per_kg: Number(e.target.value)
            }))}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            min="0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'low_activity_multiplier', label: 'Low Activity Multiplier' },
            { key: 'medium_activity_multiplier', label: 'Medium Activity Multiplier' },
            { key: 'high_activity_multiplier', label: 'High Activity Multiplier' },
            { key: 'very_high_activity_multiplier', label: 'Very High Activity Multiplier' }
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
              </label>
              <input
                type="number"
                value={formData[key as keyof typeof formData]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  [key]: Number(e.target.value)
                }))}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                min="1"
                step="0.1"
              />
            </div>
          ))}
        </div>
        {errors.multipliers && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.multipliers}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {lifeStage ? 'Update Life Stage' : 'Add Life Stage'}
        </button>
      </div>
    </form>
  );
};

export default BreedLifeStageForm;