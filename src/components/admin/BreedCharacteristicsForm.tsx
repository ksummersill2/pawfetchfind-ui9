import React from 'react';
import { AlertCircle } from 'lucide-react';
import { BreedCharacteristics } from '../../types';

interface BreedCharacteristicsFormProps {
  gender: 'male' | 'female' | 'both';
  data: BreedCharacteristics;
  onChange: (data: BreedCharacteristics) => void;
  errors?: Record<string, string>;
}

const BreedCharacteristicsForm: React.FC<BreedCharacteristicsFormProps> = ({
  gender,
  data,
  onChange,
  errors = {}
}) => {
  const handleChange = (key: keyof BreedCharacteristics, value: any) => {
    onChange({
      ...data,
      [key]: value
    });
  };

  const handleHealthIssueAdd = (issue: string) => {
    const healthIssues = data.health_issues || [];
    if (issue.trim() && !healthIssues.includes(issue.trim())) {
      handleChange('health_issues', [...healthIssues, issue.trim()]);
    }
  };

  const handleHealthIssueRemove = (issue: string) => {
    const healthIssues = data.health_issues || [];
    handleChange('health_issues', healthIssues.filter(i => i !== issue));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
        {gender === 'both' ? 'Both Genders' : `${gender} Characteristics`}
      </h3>

      {/* Physical Measurements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Height Range (cm)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={data.min_height_cm || ''}
              onChange={e => handleChange('min_height_cm', Number(e.target.value))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              min="0"
              step="0.1"
              placeholder="Min"
            />
            <span>to</span>
            <input
              type="number"
              value={data.max_height_cm || ''}
              onChange={e => handleChange('max_height_cm', Number(e.target.value))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              min="0"
              step="0.1"
              placeholder="Max"
            />
          </div>
          {errors.height && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.height}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Weight Range (kg)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={data.min_weight_kg || ''}
              onChange={e => handleChange('min_weight_kg', Number(e.target.value))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              min="0"
              step="0.1"
              placeholder="Min"
            />
            <span>to</span>
            <input
              type="number"
              value={data.max_weight_kg || ''}
              onChange={e => handleChange('max_weight_kg', Number(e.target.value))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              min="0"
              step="0.1"
              placeholder="Max"
            />
          </div>
          {errors.weight && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.weight}
            </p>
          )}
        </div>
      </div>

      {/* Life Expectancy */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Life Expectancy (years)
        </label>
        <input
          type="number"
          value={data.life_expectancy_years || ''}
          onChange={e => handleChange('life_expectancy_years', Number(e.target.value))}
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
              value={data[key as keyof typeof data] || 5}
              onChange={e => handleChange(key as keyof BreedCharacteristics, Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Low</span>
              <span>{data[key as keyof typeof data] || 5}</span>
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
          value={data.exercise_needs_minutes || ''}
          onChange={e => handleChange('exercise_needs_minutes', Number(e.target.value))}
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
              onChange={e => handleChange(key as keyof BreedCharacteristics, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {label}
            </span>
          </label>
        ))}
      </div>

      {/* Health Issues */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Health Issues
        </label>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add health issue"
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  handleHealthIssueAdd((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            <button
              type="button"
              onClick={() => {
                const input = document.querySelector('input[placeholder="Add health issue"]') as HTMLInputElement;
                handleHealthIssueAdd(input.value);
                input.value = '';
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data.health_issues || []).map((issue, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700"
              >
                {issue}
                <button
                  type="button"
                  onClick={() => handleHealthIssueRemove(issue)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Care Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Care Instructions
        </label>
        <textarea
          value={data.care_instructions || ''}
          onChange={e => handleChange('care_instructions', e.target.value)}
          rows={3}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
        />
      </div>

      {/* Dietary Needs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Dietary Needs
        </label>
        <textarea
          value={data.dietary_needs || ''}
          onChange={e => handleChange('dietary_needs', e.target.value)}
          rows={3}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
        />
      </div>

      {/* Special Considerations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Special Considerations
        </label>
        <textarea
          value={data.special_considerations || ''}
          onChange={e => handleChange('special_considerations', e.target.value)}
          rows={3}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
        />
      </div>
    </div>
  );
};

export default BreedCharacteristicsForm;