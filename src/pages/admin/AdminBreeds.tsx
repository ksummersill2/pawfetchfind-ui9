import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { PlusCircle, Trash2, Edit2, Search, Upload } from 'lucide-react';
import BreedForm from '../../components/admin/BreedForm';
import { DogBreed } from '../../types';
import BreedImportModal from '../../components/admin/BreedImportModal';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';

const AdminBreeds: React.FC = () => {
  const [breeds, setBreeds] = useState<DogBreed[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingBreed, setEditingBreed] = useState<DogBreed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [breedToDelete, setBreedToDelete] = useState<DogBreed | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBreeds();
  }, []);

  const fetchBreeds = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('dog_breeds')
        .select(`
          *,
          size_variations:breed_size_variations (
            id,
            size_category,
            size_description,
            dietary_needs,
            health_issues,
            care_instructions,
            special_considerations,
            characteristics:breed_characteristics (
              id,
              gender,
              min_height_cm,
              max_height_cm,
              min_weight_kg,
              max_weight_kg,
              life_expectancy_years,
              energy_level,
              grooming_needs,
              shedding_level,
              trainability,
              barking_level,
              good_with_children,
              good_with_other_dogs,
              good_with_strangers,
              exercise_needs_minutes,
              dietary_needs,
              health_issues,
              care_instructions,
              special_considerations
            )
          )
        `)
        .order('name');

      if (fetchError) throw fetchError;

      // Transform the data to separate male and female characteristics
      const transformedData = data?.map(breed => ({
        ...breed,
        size_variations: breed.size_variations?.map(variation => ({
          ...variation,
          male_characteristics: variation.characteristics?.find(c => c.gender === 'male'),
          female_characteristics: variation.characteristics?.find(c => c.gender === 'female'),
          characteristics: undefined // Remove the original characteristics array
        }))
      }));

      setBreeds(transformedData || []);
    } catch (err) {
      console.error('Error fetching breeds:', err);
      setError('Failed to load breeds');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this breed?')) return;

    try {
      const { error } = await supabase
        .from('dog_breeds')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchBreeds();
    } catch (err) {
      console.error('Error deleting breed:', err);
      setError('Failed to delete breed');
    }
  };

  const filteredBreeds = breeds.filter(breed =>
    breed.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    breed.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dog Breeds</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Upload className="w-5 h-5 mr-2" />
            Import CSV
          </button>
          <button
            onClick={() => {
              setEditingBreed(null);
              setShowForm(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Breed
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search breeds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredBreeds.map((breed) => (
          <div
            key={breed.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {breed.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {breed.size_variations?.length || 0} size variations
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingBreed(breed);
                    setShowForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setBreedToDelete(breed)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {breed.description}
            </p>
          </div>
        ))}
      </div>

      {filteredBreeds.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No breeds found matching your search criteria.
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingBreed ? 'Edit Breed' : 'Add Breed'}
            </h2>
            <BreedForm
              breed={editingBreed || undefined}
              onSubmit={async (data) => {
                try {
                  if (editingBreed) {
                    const { error } = await supabase
                      .from('dog_breeds')
                      .update(data)
                      .eq('id', editingBreed.id);
                    if (error) throw error;
                  } else {
                    const { error } = await supabase
                      .from('dog_breeds')
                      .insert([data]);
                    if (error) throw error;
                  }
                  setShowForm(false);
                  setEditingBreed(null);
                  fetchBreeds();
                } catch (err) {
                  console.error('Error saving breed:', err);
                  setError('Failed to save breed');
                }
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingBreed(null);
              }}
            />
          </div>
        </div>
      )}

      {showImportModal && (
        <BreedImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={fetchBreeds}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!breedToDelete}
        title="Delete Breed"
        message={`Are you sure you want to delete ${breedToDelete?.name}? This action cannot be undone.`}
        onConfirm={async () => {
          if (!breedToDelete) return;
          setIsDeleting(true);
          try {
            const { error } = await supabase
              .from('dog_breeds')
              .delete()
              .eq('id', breedToDelete.id);
            if (error) throw error;
            setBreedToDelete(null);
            fetchBreeds();
          } catch (err) {
            console.error('Error deleting breed:', err);
            setError('Failed to delete breed');
          } finally {
            setIsDeleting(false);
          }
        }}
        onCancel={() => setBreedToDelete(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default AdminBreeds;