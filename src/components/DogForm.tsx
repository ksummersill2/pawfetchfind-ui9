import React, { useState, useEffect } from 'react';
import { AlertCircle, Upload } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

interface DogFormData {
  name: string;
  breed: string;
  age: number;
  weight: number;
  activity_level: number;
  image?: string;
  health_conditions?: string[];
}

interface DogFormProps {
  onSubmit: (data: DogFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: DogFormData;
}

const DogForm: React.FC<DogFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<DogFormData>(initialData || {
    name: '',
    breed: '',
    age: 0,
    weight: 0,
    activity_level: 5,
    health_conditions: []
  });

  const [breeds, setBreeds] = useState<{ id: string; name: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchBreeds();
  }, []);

  const fetchBreeds = async () => {
    try {
      const { data, error } = await supabase
        .from('dog_breeds')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setBreeds(data || []);
    } catch (err) {
      console.error('Error fetching breeds:', err);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.breed) {
      newErrors.breed = 'Breed is required';
    }

    if (formData.age < 0 || formData.age > 30) {
      newErrors.age = 'Age must be between 0 and 30 years';
    }

    if (formData.weight < 0.5 || formData.weight > 200) {
      newErrors.weight = 'Weight must be between 0.5 and 200 lbs';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Error submitting form:', err);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to save dog profile'
      }));
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('dog-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('dog-photos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image: publicUrl }));
    } catch (err) {
      console.error('Error uploading image:', err);
      setErrors(prev => ({
        ...prev,
        image: 'Failed to upload image'
      }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Dog's Photo
        </label>
        <div className="mt-1 flex items-center space-x-4">
          {formData.image && (
            <img
              src={formData.image}
              alt="Preview"
              className="w-20 h-20 rounded-full object-cover"
            />
          )}
          <label className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <Upload className="w-5 h-5 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Photo'}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Breed
          </label>
          <select
            value={formData.breed}
            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
              errors.breed ? 'border-red-500' : ''
            }`}
            required
          >
            <option value="">Select a breed</option>
            {breeds.map((breed) => (
              <option key={breed.id} value={breed.name}>
                {breed.name}
              </option>
            ))}
          </select>
          {errors.breed && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.breed}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Age (years)
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
            className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
              errors.age ? 'border-red-500' : ''
            }`}
            min="0"
            max="30"
            step="0.1"
            required
          />
          {errors.age && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.age}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Weight (lbs)
          </label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
            className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
              errors.weight ? 'border-red-500' : ''
            }`}
            min="0.5"
            max="200"
            step="0.1"
            required
          />
          {errors.weight && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.weight}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Activity Level (1-10)
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.activity_level}
          onChange={(e) => setFormData({ ...formData, activity_level: Number(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Low Energy</span>
          <span>{formData.activity_level}</span>
          <span>High Energy</span>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Dog
        </button>
      </div>
    </form>
  );
};

export default DogForm;