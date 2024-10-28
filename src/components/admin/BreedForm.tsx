import React, { useState } from 'react';
import { AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { DogBreed, BreedSizeVariation } from '../../types';
import BreedSizeVariationForm from './BreedSizeVariationForm';

interface BreedFormProps {
  breed?: DogBreed;
  onSubmit: (data: Omit<DogBreed, 'id'>) => void;
  onCancel: () => void;
}

const SIZE_CATEGORIES = [
  { id: 'toy', value: 'toy', label: 'Toy' },
  { id: 'mini', value: 'mini', label: 'Mini' },
  { id: 'small', value: 'small', label: 'Small' },
  { id: 'medium', value: 'medium', label: 'Medium' },
  { id: 'standard', value: 'standard', label: 'Standard' },
  { id: 'large', value: 'large', label: 'Large' },
  { id: 'giant', value: 'giant', label: 'Giant' }
];

const BreedForm: React.FC<BreedFormProps> = ({ breed, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<DogBreed, 'id'>>({
    name: breed?.name || '',
    description: breed?.description || '',
    has_size_variations: breed?.has_size_variations || false,
    size_variations: breed?.size_variations || []
  });

  const [showSizeVariationForm, setShowSizeVariationForm] = useState(false);
  const [editingSizeVariation, setEditingSizeVariation] = useState<BreedSizeVariation | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.has_size_variations && formData.size_variations.length === 0) {
      newErrors.size_variations = 'At least one size variation is required';
    }

    const sizeCategories = formData.size_variations.map(sv => sv.size_category);
    const uniqueCategories = new Set(sizeCategories);
    if (sizeCategories.length !== uniqueCategories.size) {
      newErrors.size_variations = 'Each size category can only be used once';
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

  const handleSizeVariationSubmit = (sizeVariation: BreedSizeVariation) => {
    if (editingSizeVariation) {
      setFormData(prev => ({
        ...prev,
        size_variations: prev.size_variations.map(sv =>
          sv.id === editingSizeVariation.id ? sizeVariation : sv
        )
      }));
    } else {
      const existingCategory = formData.size_variations.find(
        sv => sv.size_category === sizeVariation.size_category
      );

      if (existingCategory) {
        setErrors(prev => ({
          ...prev,
          size_variations: `Size category "${sizeVariation.size_category}" already exists`
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        size_variations: [...prev.size_variations, sizeVariation]
      }));
    }
    setShowSizeVariationForm(false);
    setEditingSizeVariation(null);
  };

  const handleRemoveSizeVariation = (sizeVariation: BreedSizeVariation) => {
    setFormData(prev => ({
      ...prev,
      size_variations: prev.size_variations.filter(sv => sv.id !== sizeVariation.id)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="breed-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Breed Name
        </label>
        <input
          id="breed-name"
          type="text"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={`w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 ${
            errors.name ? 'border-red-500' : ''
          }`}
          required
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="breed-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="breed-description"
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className={`w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 ${
            errors.description ? 'border-red-500' : ''
          }`}
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.description}
          </p>
        )}
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.has_size_variations}
            onChange={e => setFormData(prev => ({
              ...prev,
              has_size_variations: e.target.checked,
              size_variations: e.target.checked ? prev.size_variations : []
            }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Has size variations
          </span>
        </label>
      </div>

      {formData.has_size_variations && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Size Variations
            </h3>
            <button
              type="button"
              onClick={() => {
                setEditingSizeVariation(null);
                setShowSizeVariationForm(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Size Variation
            </button>
          </div>

          {errors.size_variations && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.size_variations}
            </p>
          )}

          <div className="space-y-4">
            {formData.size_variations.map((sizeVariation) => (
              <div
                key={sizeVariation.id || sizeVariation.size_category}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {sizeVariation.size_category} Size
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {sizeVariation.size_description}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSizeVariation(sizeVariation);
                        setShowSizeVariationForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      aria-label={`Edit ${sizeVariation.size_category} size variation`}
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSizeVariation(sizeVariation)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      aria-label={`Remove ${sizeVariation.size_category} size variation`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSizeVariationForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingSizeVariation ? 'Edit Size Variation' : 'Add Size Variation'}
            </h2>
            <BreedSizeVariationForm
              breedId={breed?.id || ''}
              initialData={editingSizeVariation}
              existingSizeCategories={formData.size_variations
                .filter(sv => sv.id !== editingSizeVariation?.id)
                .map(sv => sv.size_category)}
              onSubmit={handleSizeVariationSubmit}
              onCancel={() => {
                setShowSizeVariationForm(false);
                setEditingSizeVariation(null);
              }}
            />
          </div>
        </div>
      )}

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
          {breed ? 'Update Breed' : 'Create Breed'}
        </button>
      </div>
    </form>
  );
};

export default BreedForm;