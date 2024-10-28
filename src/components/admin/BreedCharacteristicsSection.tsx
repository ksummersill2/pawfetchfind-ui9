import React from 'react';
import { BreedCharacteristics } from '../../types';

interface BreedCharacteristicsSectionProps {
  gender: 'male' | 'female' | 'both';
  data: BreedCharacteristics;
  onChange: (data: BreedCharacteristics) => void;
}

const BreedCharacteristicsSection: React.FC<BreedCharacteristicsSectionProps> = ({
  gender,
  data,
  onChange
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
        {gender === 'both' ? 'Both Genders' : `${gender} Characteristics`}
      </h3>

      {/* Rest of the component remains the same */}
      {/* Physical Measurements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Height Range (cm)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={data.min_height_cm}
              onChange={e => onChange({ ...data, min_height_cm: Number(e.target.value) })}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              min="0"
              step="0.1"
              placeholder="Min"
            />
            <span>to</span>
            <input
              type="number"
              value={data.max_height_cm}
              onChange={e => onChange({ ...data, max_height_cm: Number(e.target.value) })}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              min="0"
              step="0.1"
              placeholder="Max"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Weight Range (kg)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={data.min_weight_kg}
              onChange={e => onChange({ ...data, min_weight_kg: Number(e.target.value) })}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              min="0"
              step="0.1"
              placeholder="Min"
            />
            <span>to</span>
            <input
              type="number"
              value={data.max_weight_kg}
              onChange={e => onChange({ ...data, max_weight_kg: Number(e.target.value) })}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              min="0"
              step="0.1"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Life Expectancy */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Life Expectancy (years)
        </label>
        <input
          type="number"
          value={data.life_expectancy_years}
          onChange={e => onChange({ ...data, life_expectancy_years: Number(e.target.value) })}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          min="0"
          step="0.5"
        />
      </div>

      {/* Characteristic Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'energy_level', label: 'Energy Level' },
          { key: 'grooming_needs', label: 'Grooming Needs' },
          { key: 'shedding_level', label: 'Shedding Level' },
          { key: 'trainability', label: 'Trainability' },
          { key: 'barking_level', label: 'Barking Level' }
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {label} (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={data[key as keyof typeof data]}
              onChange={e => onChange({ ...data, [key]: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Low</span>
              <span>{data[key as keyof typeof data]}</span>
              <span>High</span>
            </div>
          </div>
        ))}
      </div>

      {/* Exercise Needs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Exercise Needs (minutes/day)
        </label>
        <input
          type="number"
          value={data.exercise_needs_minutes}
          onChange={e => onChange({ ...data, exercise_needs_minutes: Number(e.target.value) })}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          min="0"
          step="5"
        />
      </div>

      {/* Compatibility Checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { key: 'good_with_children', label: 'Good with Children' },
          { key: 'good_with_other_dogs', label: 'Good with Other Dogs' },
          { key: 'good_with_strangers', label: 'Good with Strangers' }
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={data[key as keyof typeof data] as boolean}
              onChange={e => onChange({ ...data, [key]: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default BreedCharacteristicsSection;