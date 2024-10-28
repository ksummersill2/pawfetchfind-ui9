import React, { useState } from 'react';
import { AlertCircle, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import BreedCharacteristicsForm from './BreedCharacteristicsForm';
import { BreedSizeVariation, BreedCharacteristics } from '../../types';

interface BreedSizeVariationFormProps {
  breedId: string;
  initialData?: BreedSizeVariation;
  onSubmit: (data: BreedSizeVariation) => void;
  onCancel: () => void;
}

const BreedSizeVariationForm: React.FC<BreedSizeVariationFormProps> = ({
  breedId,
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<BreedSizeVariation>({
    id: initialData?.id || crypto.randomUUID(),
    breed_id: breedId,
    size_category: initialData?.size_category || 'medium',
    size_description: initialData?.size_description || '',
    image: initialData?.image || '',
    shared_characteristics: initialData?.shared_characteristics || false,
    male_characteristics: initialData?.male_characteristics || {
      min_height_cm: 0,
      max_height_cm: 0,
      min_weight_kg: 0,
      max_weight_kg: 0,
      life_expectancy_years: 0,
      energy_level: 5,
      grooming_needs: 5,
      shedding_level: 5,
      trainability: 5,
      barking_level: 5,
      good_with_children: true,
      good_with_other_dogs: true,
      good_with_strangers: true,
      exercise_needs_minutes: 60,
      dietary_needs: '',
      health_issues: [],
      care_instructions: '',
      special_considerations: ''
    },
    female_characteristics: initialData?.female_characteristics || {
      min_height_cm: 0,
      max_height_cm: 0,
      min_weight_kg: 0,
      max_weight_kg: 0,
      life_expectancy_years: 0,
      energy_level: 5,
      grooming_needs: 5,
      shedding_level: 5,
      trainability: 5,
      barking_level: 5,
      good_with_children: true,
      good_with_other_dogs: true,
      good_with_strangers: true,
      exercise_needs_minutes: 60,
      dietary_needs: '',
      health_issues: [],
      care_instructions: '',
      special_considerations: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.size_description.trim()) {
      newErrors.size_description = 'Size description is required';
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

  const handleCharacteristicsChange = (gender: 'male' | 'female', data: BreedCharacteristics) => {
    setFormData(prev => ({
      ...prev,
      [`${gender}_characteristics`]: data
    }));
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Only image files are allowed' }));
        return;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

      if (!fileExt || !validExtensions.includes(fileExt)) {
        setErrors(prev => ({ ...prev, image: 'Invalid file type. Only JPG, PNG, WebP, and GIF are allowed' }));
        return;
      }

      const filePath = `${breedId}/${formData.size_category}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('breeds')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('breeds')
        .getPublicUrl(filePath);

      if (publicUrl) {
        setFormData(prev => ({ ...prev, image: publicUrl }));
        setErrors(prev => ({ ...prev, image: undefined }));
      } else {
        setErrors(prev => ({ ...prev, image: 'Failed to retrieve public URL. Please try again.' }));
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setErrors(prev => ({ ...prev, image: 'Failed to upload image. Please try again.' }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Size Category
        </label>
        <select
          value={formData.size_category}
          onChange={e => setFormData(prev => ({
            ...prev,
            size_category: e.target.value as 'small' | 'medium' | 'large' | 'giant'
          }))}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="giant">Giant</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Size Description
        </label>
        <textarea
          value={formData.size_description}
          onChange={e => setFormData(prev => ({ ...prev, size_description: e.target.value }))}
          rows={3}
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          required
        />
        {errors.size_description && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.size_description}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Size Variation Image
        </label>
        <div className="mt-1 flex items-center space-x-4">
          {formData.image && (
            <img
              src={formData.image}
              alt={`${formData.size_category} size variation`}
              className="w-24 h-24 object-cover rounded-lg"
            />
          )}
          <label className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <Upload className="w-5 h-5 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(file);
                }
              }}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        {errors.image && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.image}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="shared_characteristics"
          checked={formData.shared_characteristics}
          onChange={e => setFormData(prev => ({
            ...prev,
            shared_characteristics: e.target.checked,
            female_characteristics: e.target.checked ? prev.male_characteristics : prev.female_characteristics
          }))}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="shared_characteristics" className="text-sm text-gray-700 dark:text-gray-300">
          Use same characteristics for both male and female
        </label>
      </div>

      {formData.shared_characteristics ? (
        <div className="border-t dark:border-gray-700 pt-6">
          <BreedCharacteristicsForm
            gender="both"
            data={formData.male_characteristics}
            onChange={data => {
              setFormData(prev => ({
                ...prev,
                male_characteristics: data,
                female_characteristics: data
              }));
            }}
            errors={errors}
          />
        </div>
      ) : (
        <>
          <div className="border-t dark:border-gray-700 pt-6">
            <BreedCharacteristicsForm
              gender="male"
              data={formData.male_characteristics}
              onChange={data => handleCharacteristicsChange('male', data)}
              errors={errors}
            />
          </div>

          <div className="border-t dark:border-gray-700 pt-6">
            <BreedCharacteristicsForm
              gender="female"
              data={formData.female_characteristics}
              onChange={data => handleCharacteristicsChange('female', data)}
              errors={errors}
            />
          </div>
        </>
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
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {initialData ? 'Update Size Variation' : 'Add Size Variation'}
        </button>
      </div>
    </div>
  );
};

export default BreedSizeVariationForm;