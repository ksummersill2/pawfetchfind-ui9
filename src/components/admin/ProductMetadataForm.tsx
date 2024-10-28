import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface ProductMetadata {
  life_stages: {
    suitable_for_puppy: boolean;
    suitable_for_adult: boolean;
    suitable_for_senior: boolean;
    min_age_months?: number;
    max_age_months?: number;
  };
  size_suitability: {
    suitable_for_small: boolean;
    suitable_for_medium: boolean;
    suitable_for_large: boolean;
    suitable_for_giant: boolean;
    min_weight_kg?: number;
    max_weight_kg?: number;
  };
  health_benefits: Array<{
    health_condition_id: string;
    benefit_description: string;
  }>;
  breed_recommendations: Array<{
    breed_id: string;
    recommendation_strength: number;
    recommendation_reason: string;
  }>;
  ingredients?: string[];
  nutritional_info?: Record<string, any>;
  features?: string[];
  safety_warnings?: string[];
  activity_level_suitable?: [number, number];
}

interface ProductMetadataFormProps {
  productId?: string;
  initialData?: Partial<ProductMetadata>;
  onSubmit: (metadata: ProductMetadata) => void;
  onCancel: () => void;
}

const ProductMetadataForm: React.FC<ProductMetadataFormProps> = ({
  productId,
  initialData,
  onSubmit,
  onCancel
}) => {
  const [metadata, setMetadata] = useState<ProductMetadata>({
    life_stages: {
      suitable_for_puppy: false,
      suitable_for_adult: false,
      suitable_for_senior: false,
      ...initialData?.life_stages
    },
    size_suitability: {
      suitable_for_small: false,
      suitable_for_medium: false,
      suitable_for_large: false,
      suitable_for_giant: false,
      ...initialData?.size_suitability
    },
    health_benefits: initialData?.health_benefits || [],
    breed_recommendations: initialData?.breed_recommendations || [],
    ingredients: initialData?.ingredients || [],
    nutritional_info: initialData?.nutritional_info || {},
    features: initialData?.features || [],
    safety_warnings: initialData?.safety_warnings || [],
    activity_level_suitable: initialData?.activity_level_suitable || [1, 10]
  });

  const [healthConditions, setHealthConditions] = useState<Array<{ id: string; name: string }>>([]);
  const [breeds, setBreeds] = useState<Array<{ id: string; name: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newIngredient, setNewIngredient] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newWarning, setNewWarning] = useState('');

  useEffect(() => {
    fetchHealthConditions();
    fetchBreeds();
  }, []);

  const fetchHealthConditions = async () => {
    const { data } = await supabase
      .from('health_conditions')
      .select('id, name')
      .order('name');
    if (data) setHealthConditions(data);
  };

  const fetchBreeds = async () => {
    const { data } = await supabase
      .from('dog_breeds')
      .select('id, name')
      .order('name');
    if (data) setBreeds(data);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (metadata.life_stages.min_age_months && metadata.life_stages.max_age_months) {
      if (metadata.life_stages.min_age_months >= metadata.life_stages.max_age_months) {
        newErrors.age_range = 'Maximum age must be greater than minimum age';
      }
    }

    if (metadata.size_suitability.min_weight_kg && metadata.size_suitability.max_weight_kg) {
      if (metadata.size_suitability.min_weight_kg >= metadata.size_suitability.max_weight_kg) {
        newErrors.weight_range = 'Maximum weight must be greater than minimum weight';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(metadata);
    }
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setMetadata(prev => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), newIngredient.trim()]
      }));
      setNewIngredient('');
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setMetadata(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const addWarning = () => {
    if (newWarning.trim()) {
      setMetadata(prev => ({
        ...prev,
        safety_warnings: [...(prev.safety_warnings || []), newWarning.trim()]
      }));
      setNewWarning('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Life Stages */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Life Stages</h3>
        <div className="grid grid-cols-3 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={metadata.life_stages.suitable_for_puppy}
              onChange={e => setMetadata(prev => ({
                ...prev,
                life_stages: {
                  ...prev.life_stages,
                  suitable_for_puppy: e.target.checked
                }
              }))}
              className="rounded border-gray-300"
            />
            <span>Puppy</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={metadata.life_stages.suitable_for_adult}
              onChange={e => setMetadata(prev => ({
                ...prev,
                life_stages: {
                  ...prev.life_stages,
                  suitable_for_adult: e.target.checked
                }
              }))}
              className="rounded border-gray-300"
            />
            <span>Adult</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={metadata.life_stages.suitable_for_senior}
              onChange={e => setMetadata(prev => ({
                ...prev,
                life_stages: {
                  ...prev.life_stages,
                  suitable_for_senior: e.target.checked
                }
              }))}
              className="rounded border-gray-300"
            />
            <span>Senior</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Minimum Age (months)</label>
            <input
              type="number"
              value={metadata.life_stages.min_age_months || ''}
              onChange={e => setMetadata(prev => ({
                ...prev,
                life_stages: {
                  ...prev.life_stages,
                  min_age_months: parseInt(e.target.value) || undefined
                }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Maximum Age (months)</label>
            <input
              type="number"
              value={metadata.life_stages.max_age_months || ''}
              onChange={e => setMetadata(prev => ({
                ...prev,
                life_stages: {
                  ...prev.life_stages,
                  max_age_months: parseInt(e.target.value) || undefined
                }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300"
              min="0"
            />
          </div>
        </div>
        {errors.age_range && (
          <p className="text-red-500 text-sm">{errors.age_range}</p>
        )}
      </div>

      {/* Size Suitability */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Size Suitability</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={metadata.size_suitability.suitable_for_small}
              onChange={e => setMetadata(prev => ({
                ...prev,
                size_suitability: {
                  ...prev.size_suitability,
                  suitable_for_small: e.target.checked
                }
              }))}
              className="rounded border-gray-300"
            />
            <span>Small</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={metadata.size_suitability.suitable_for_medium}
              onChange={e => setMetadata(prev => ({
                ...prev,
                size_suitability: {
                  ...prev.size_suitability,
                  suitable_for_medium: e.target.checked
                }
              }))}
              className="rounded border-gray-300"
            />
            <span>Medium</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={metadata.size_suitability.suitable_for_large}
              onChange={e => setMetadata(prev => ({
                ...prev,
                size_suitability: {
                  ...prev.size_suitability,
                  suitable_for_large: e.target.checked
                }
              }))}
              className="rounded border-gray-300"
            />
            <span>Large</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={metadata.size_suitability.suitable_for_giant}
              onChange={e => setMetadata(prev => ({
                ...prev,
                size_suitability: {
                  ...prev.size_suitability,
                  suitable_for_giant: e.target.checked
                }
              }))}
              className="rounded border-gray-300"
            />
            <span>Giant</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Minimum Weight (kg)</label>
            <input
              type="number"
              value={metadata.size_suitability.min_weight_kg || ''}
              onChange={e => setMetadata(prev => ({
                ...prev,
                size_suitability: {
                  ...prev.size_suitability,
                  min_weight_kg: parseFloat(e.target.value) || undefined
                }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Maximum Weight (kg)</label>
            <input
              type="number"
              value={metadata.size_suitability.max_weight_kg || ''}
              onChange={e => setMetadata(prev => ({
                ...prev,
                size_suitability: {
                  ...prev.size_suitability,
                  max_weight_kg: parseFloat(e.target.value) || undefined
                }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300"
              min="0"
              step="0.1"
            />
          </div>
        </div>
        {errors.weight_range && (
          <p className="text-red-500 text-sm">{errors.weight_range}</p>
        )}
      </div>

      {/* Activity Level */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Level</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Minimum Activity Level (1-10)</label>
            <input
              type="number"
              value={metadata.activity_level_suitable?.[0] || 1}
              onChange={e => setMetadata(prev => ({
                ...prev,
                activity_level_suitable: [
                  parseInt(e.target.value) || 1,
                  prev.activity_level_suitable?.[1] || 10
                ]
              }))}
              className="mt-1 block w-full rounded-md border-gray-300"
              min="1"
              max="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Maximum Activity Level (1-10)</label>
            <input
              type="number"
              value={metadata.activity_level_suitable?.[1] || 10}
              onChange={e => setMetadata(prev => ({
                ...prev,
                activity_level_suitable: [
                  prev.activity_level_suitable?.[0] || 1,
                  parseInt(e.target.value) || 10
                ]
              }))}
              className="mt-1 block w-full rounded-md border-gray-300"
              min="1"
              max="10"
            />
          </div>
        </div>
      </div>

      {/* Health Benefits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Health Benefits</h3>
        <div className="space-y-4">
          {metadata.health_benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-1 space-y-2">
                <select
                  value={benefit.health_condition_id}
                  onChange={e => {
                    const newBenefits = [...metadata.health_benefits];
                    newBenefits[index].health_condition_id = e.target.value;
                    setMetadata(prev => ({ ...prev, health_benefits: newBenefits }));
                  }}
                  className="block w-full rounded-md border-gray-300"
                >
                  <option value="">Select Health Condition</option>
                  {healthConditions.map(condition => (
                    <option key={condition.id} value={condition.id}>
                      {condition.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={benefit.benefit_description}
                  onChange={e => {
                    const newBenefits = [...metadata.health_benefits];
                    newBenefits[index].benefit_description = e.target.value;
                    setMetadata(prev => ({ ...prev, health_benefits: newBenefits }));
                  }}
                  placeholder="Describe how this product helps with this condition"
                  className="block w-full rounded-md border-gray-300"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const newBenefits = metadata.health_benefits.filter((_, i) => i !== index);
                  setMetadata(prev => ({ ...prev, health_benefits: newBenefits }));
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setMetadata(prev => ({
              ...prev,
              health_benefits: [
                ...prev.health_benefits,
                { health_condition_id: '', benefit_description: '' }
              ]
            }))}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Health Benefit
          </button>
        </div>
      </div>

      {/* Breed Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Breed Recommendations</h3>
        <div className="space-y-4">
          {metadata.breed_recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-1 space-y-2">
                <select
                  value={rec.breed_id}
                  onChange={e => {
                    const newRecs = [...metadata.breed_recommendations];
                    newRecs[index].breed_id = e.target.value;
                    setMetadata(prev => ({ ...prev, breed_recommendations: newRecs }));
                  }}
                  className="block w-full rounded-md border-gray-300"
                >
                  <option value="">Select Breed</option>
                  {breeds.map(breed => (
                    <option key={breed.id} value={breed.id}>
                      {breed.name}
                    </option>
                  ))}
                </select>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium">Recommendation Strength (1-5)</label>
                    <input
                      type="number"
                      value={rec.recommendation_strength}
                      onChange={e => {
                        const newRecs = [...metadata.breed_recommendations];
                        newRecs[index].recommendation_strength = parseInt(e.target.value);
                        setMetadata(prev => ({ ...prev, breed_recommendations: newRecs }));
                      }}
                      min="1"
                      max="5"
                      className="block w-full rounded-md border-gray-300"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={rec.recommendation_reason}
                  onChange={e => {
                    const newRecs = [...metadata.breed_recommendations];
                    newRecs[index].recommendation_reason = e.target.value;
                    setMetadata(prev => ({ ...prev, breed_recommendations: newRecs }));
                  }}
                  placeholder="Reason for recommendation"
                  className="block w-full rounded-md border-gray-300"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const newRecs = metadata.breed_recommendations.filter((_, i) => i !== index);
                  setMetadata(prev => ({ ...prev, breed_recommendations: newRecs }));
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setMetadata(prev => ({
              ...prev,
              breed_recommendations: [
                ...prev.breed_recommendations,
                { breed_id: '', recommendation_strength: 3, recommendation_reason: '' }
              ]
            }))}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Breed Recommendation
          </button>
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ingredients</h3>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newIngredient}
              onChange={e => setNewIngredient(e.target.value)}
              placeholder="Add ingredient"
              className="flex-1 rounded-md border-gray-300"
            />
            <button
              type="button"
              onClick={addIngredient}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {metadata.ingredients?.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
              >
                <span>{ingredient}</span>
                <button
                  type="button"
                  onClick={() => setMetadata(prev => ({
                    ...prev,
                    ingredients: prev.ingredients?.filter((_, i) => i !== index)
                  }))}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Features</h3>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newFeature}
              onChange={e => setNewFeature(e.target.value)}
              placeholder="Add feature"
              className="flex-1 rounded-md border-gray-300"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {metadata.features?.map((feature, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
              >
                <span>{feature}</span>
                <button
                  type="button"
                  onClick={() => setMetadata(prev => ({
                    ...prev,
                    features: prev.features?.filter((_, i) => i !== index)
                  }))}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Warnings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Safety Warnings</h3>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newWarning}
              onChange={e => setNewWarning(e.target.value)}
              placeholder="Add safety warning"
              className="flex-1 rounded-md border-gray-300"
            />
            <button
              type="button"
              onClick={addWarning}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {metadata.safety_warnings?.map((warning, index) => (
              <div
                key={index}
                className="flex items-center bg-red-50 dark:bg-red-900/50 px-3 py-1 rounded-full"
              >
                <span>{warning}</span>
                <button
                  type="button"
                  onClick={() => setMetadata(prev => ({
                    ...prev,
                    safety_warnings: prev.safety_warnings?.filter((_, i) => i !== index)
                  }))}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Metadata
        </button>
      </div>
    </div>
  );
};

export default ProductMetadataForm;