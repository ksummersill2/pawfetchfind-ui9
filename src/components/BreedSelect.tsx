import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface BreedSelectProps {
  value: string;
  onChange: (breed: string) => void;
}

const BreedSelect: React.FC<BreedSelectProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [breeds, setBreeds] = useState<{ id: number; name: string }[]>([]);
  const [filteredBreeds, setFilteredBreeds] = useState<{ id: number; name: string }[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBreeds = async () => {
      const { data, error } = await supabase
        .from('dog_breeds')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching breeds:', error);
        return;
      }
      
      setBreeds(data || []);
    };

    fetchBreeds();
  }, []);

  useEffect(() => {
    const filtered = breeds.filter(breed =>
      breed.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBreeds(filtered);
  }, [searchTerm, breeds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (breedName: string) => {
    onChange(breedName);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:border-blue-500 dark:border-gray-600 dark:hover:border-blue-400"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
          {value || 'Select breed'}
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg dark:border-gray-600">
          <div className="p-2 border-b dark:border-gray-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-700"
                placeholder="Search breeds..."
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredBreeds.map((breed) => (
              <div
                key={breed.id}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleSelect(breed.name)}
              >
                {breed.name}
              </div>
            ))}
            {filteredBreeds.length === 0 && (
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                No breeds found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BreedSelect;