import React, { useState } from 'react';
import { Dog as DogIcon, Info, Plus, Heart, X, Trash2, AlertCircle } from 'lucide-react';
import { Dog } from '../types';
import DogDetails from './DogDetails';
import DogForm from './DogForm';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

interface DogSelectorProps {
  dogs: Dog[];
  activeDogId: number | null;
  onDogSelect: (dogId: number | null) => void;
  isAdminPanel?: boolean;
}

interface DeleteConfirmationProps {
  dog: Dog;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ dog, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
      <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 mb-4">
        <AlertCircle className="w-6 h-6" />
        <h3 className="text-lg font-semibold">Delete Dog Profile</h3>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Are you sure you want to delete {dog.name}'s profile? This action cannot be undone.
      </p>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const DogSelector: React.FC<DogSelectorProps> = ({ 
  dogs, 
  activeDogId, 
  onDogSelect,
  isAdminPanel = false 
}) => {
  const [detailsDog, setDetailsDog] = useState<Dog | null>(null);
  const [showDogForm, setShowDogForm] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(dogs.length === 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dogToDelete, setDogToDelete] = useState<Dog | null>(null);
  const { user } = useAuth();

  // Don't show empty state in admin panel
  if (dogs.length === 0 && isAdminPanel) {
    return null;
  }

  const handleNoDog = () => {
    onDogSelect(null);
    setShowEmptyState(false);
  };

  const handleDogFormSubmit = async (data: any) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Insert the new dog into the database
      const { data: newDog, error } = await supabase
        .from('dogs')
        .insert([{
          ...data,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Close the form and update UI
      setShowDogForm(false);
      setShowEmptyState(false);
      
      // Select the newly added dog
      if (newDog) {
        onDogSelect(newDog.id);
      }
      
      // Refresh the page to show the new dog
      window.location.reload();
    } catch (err) {
      console.error('Error adding dog:', err);
      alert('Failed to add dog. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDog = async () => {
    if (!dogToDelete) return;

    try {
      const { error } = await supabase
        .from('dogs')
        .delete()
        .eq('id', dogToDelete.id);

      if (error) throw error;

      // If the deleted dog was active, select another dog or null
      if (activeDogId === dogToDelete.id) {
        const remainingDogs = dogs.filter(d => d.id !== dogToDelete.id);
        onDogSelect(remainingDogs[0]?.id || null);
      }

      // Refresh the page to update the dog list
      window.location.reload();
    } catch (err) {
      console.error('Error deleting dog:', err);
      alert('Failed to delete dog. Please try again.');
    } finally {
      setDogToDelete(null);
    }
  };

  const handleCloseEmptyState = () => {
    setShowEmptyState(false);
    onDogSelect(null);
  };

  return (
    <div className="relative">
      {showEmptyState && !isAdminPanel ? (
        // Empty state with engaging CTA
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Add Your First Dog
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                Get personalized recommendations and track your dog's health by adding their profile
              </p>
            </div>
            <button
              onClick={handleCloseEmptyState}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowDogForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your Dog
            </button>
            <button
              onClick={handleNoDog}
              className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              I Don't Have a Dog
            </button>
          </div>
        </div>
      ) : (
        // Dog profiles list with add button
        <div className="space-y-4">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {dogs.map((dog) => (
              <div key={dog.id} className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => onDogSelect(dog.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${
                    activeDogId === dog.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 hover:bg-blue-50 dark:hover:border-blue-800 dark:hover:bg-blue-900/30'
                  }`}
                >
                  {dog.image ? (
                    <img
                      src={dog.image}
                      alt={dog.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <DogIcon className="w-6 h-6" />
                  )}
                  <span className="font-medium whitespace-nowrap">{dog.name}</span>
                </button>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setDetailsDog(dog)}
                    className="p-2 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
                    aria-label={`View ${dog.name}'s details`}
                  >
                    <Info className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setDogToDelete(dog)}
                    className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                    aria-label={`Delete ${dog.name}'s profile`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add another dog button */}
            <button
              onClick={() => setShowDogForm(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-full border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:border-blue-500 dark:hover:bg-blue-900/30 transition-all group"
            >
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>
              <span className="font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Add Dog
              </span>
            </button>
          </div>
        </div>
      )}

      {showDogForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Dog</h2>
            <DogForm
              onSubmit={handleDogFormSubmit}
              onCancel={() => setShowDogForm(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}

      {detailsDog && (
        <DogDetails
          dog={detailsDog}
          onClose={() => setDetailsDog(null)}
        />
      )}

      {dogToDelete && (
        <DeleteConfirmation
          dog={dogToDelete}
          onConfirm={handleDeleteDog}
          onCancel={() => setDogToDelete(null)}
        />
      )}
    </div>
  );
};

export default DogSelector;