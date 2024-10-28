import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import ProductMetadataForm from './ProductMetadataForm';

interface Category {
  id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: string;
  vendor: string;
  image: string;
  additional_images: string[];
  affiliate_type: 'amazon' | null;
  affiliate_link: string;
  life_stages?: {
    suitable_for_puppy: boolean;
    suitable_for_adult: boolean;
    suitable_for_senior: boolean;
    min_age_months?: number;
    max_age_months?: number;
  };
  size_suitability?: {
    suitable_for_small: boolean;
    suitable_for_medium: boolean;
    suitable_for_large: boolean;
    suitable_for_giant: boolean;
    min_weight_kg?: number;
    max_weight_kg?: number;
  };
  health_benefits?: Array<{
    health_condition_id: string;
    benefit_description: string;
  }>;
  breed_recommendations?: Array<{
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

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductFormData>(initialData || {
    name: '',
    description: '',
    price: 0,
    category_id: '',
    vendor: '',
    image: '',
    additional_images: [],
    affiliate_type: null,
    affiliate_link: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [showMetadataForm, setShowMetadataForm] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    
    setCategories(data || []);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.image && !imageFile) {
      newErrors.image = 'Product image is required';
    }

    if (formData.affiliate_type === 'amazon' && !formData.affiliate_link) {
      newErrors.affiliate_link = 'Affiliate link is required when Amazon is selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image: publicUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors(prev => ({ ...prev, image: 'Failed to upload image' }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim() && !formData.additional_images.includes(newImageUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        additional_images: [...prev.additional_images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additional_images: prev.additional_images.filter((_, i) => i !== index)
    }));
  };

  const handleMetadataSubmit = (metadata: any) => {
    setFormData(prev => ({
      ...prev,
      life_stages: metadata.life_stages,
      size_suitability: metadata.size_suitability,
      health_benefits: metadata.health_benefits,
      breed_recommendations: metadata.breed_recommendations,
      ingredients: metadata.ingredients,
      nutritional_info: metadata.nutritional_info,
      features: metadata.features,
      safety_warnings: metadata.safety_warnings,
      activity_level_suitable: metadata.activity_level_suitable
    }));
    setShowMetadataForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (imageFile) {
      await handleImageUpload(imageFile);
    }

    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 
                ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Price
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              className={`w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700
                ${errors.price ? 'border-red-500' : ''}`}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className={`w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700
                ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={e => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
              className={`w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700
                ${errors.category_id ? 'border-red-500' : ''}`}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vendor
            </label>
            <input
              type="text"
              value={formData.vendor}
              onChange={e => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Product Image
          </label>
          <div className="flex items-center space-x-4">
            {formData.image && (
              <div className="relative">
                <img
                  src={formData.image}
                  alt="Product"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <label className="flex-1">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="Enter image URL"
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    />
                  </div>
                </label>
                <span className="text-gray-500">or</span>
                <label className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData(prev => ({ ...prev, image: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
            </div>
          </div>
        </div>

        {/* Additional Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Images
          </label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {formData.additional_images.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Additional ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAdditionalImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Affiliate Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Affiliate Type
            </label>
            <select
              value={formData.affiliate_type || ''}
              onChange={e => setFormData(prev => ({
                ...prev,
                affiliate_type: e.target.value as 'amazon' | null
              }))}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="">None</option>
              <option value="amazon">Amazon</option>
            </select>
          </div>

          {formData.affiliate_type && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Affiliate Link
              </label>
              <div className="flex items-center space-x-2">
                <LinkIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={formData.affiliate_link}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    affiliate_link: e.target.value
                  }))}
                  placeholder="Enter affiliate link"
                  className={`flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700
                    ${errors.affiliate_link ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.affiliate_link && (
                <p className="text-red-500 text-sm mt-1">{errors.affiliate_link}</p>
              )}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-between space-x-3">
          <button
            type="button"
            onClick={() => setShowMetadataForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add Metadata
          </button>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : initialData ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>

      {showMetadataForm && (
        <div className="mt-6 border-t dark:border-gray-700 pt-6">
          <ProductMetadataForm
            productId={initialData?.id}
            initialData={{
              life_stages: formData.life_stages,
              size_suitability: formData.size_suitability,
              health_benefits: formData.health_benefits,
              breed_recommendations: formData.breed_recommendations,
              ingredients: formData.ingredients,
              nutritional_info: formData.nutritional_info,
              features: formData.features,
              safety_warnings: formData.safety_warnings,
              activity_level_suitable: formData.activity_level_suitable
            }}
            onSubmit={handleMetadataSubmit}
            onCancel={() => setShowMetadataForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ProductForm;