import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface FilterProps {
  categoryId: string;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedVendors: string[];
  setSelectedVendors: (vendors: string[]) => void;
  filters: any;
  setFilters: (filters: any) => void;
}

const ProductFilters: React.FC<FilterProps> = ({
  categoryId,
  priceRange,
  setPriceRange,
  selectedVendors,
  setSelectedVendors,
  filters,
  setFilters
}) => {
  // Category-specific filters
  const categoryFilters = {
    food: {
      lifestage: ['Puppy', 'Adult', 'Senior'],
      dietType: ['Grain-Free', 'Raw', 'Limited Ingredient', 'Weight Management'],
      specialNeeds: ['Joint Health', 'Digestive Health', 'Skin & Coat', 'Dental Care'],
      proteinSource: ['Chicken', 'Beef', 'Fish', 'Lamb', 'Turkey'],
      kibbleSize: ['Small Breed', 'Medium Breed', 'Large Breed']
    },
    toys: {
      playStyle: ['Chewer', 'Fetcher', 'Puzzle Solver', 'Cuddler'],
      material: ['Plush', 'Rubber', 'Rope', 'Nylon'],
      size: ['Small', 'Medium', 'Large'],
      features: ['Squeaker', 'Treat Dispensing', 'Water Friendly', 'Interactive']
    },
    bedding: {
      size: ['Small', 'Medium', 'Large', 'Extra Large'],
      style: ['Bolster', 'Mat', 'Cave', 'Orthopedic', 'Cooling'],
      features: ['Washable Cover', 'Waterproof', 'Memory Foam', 'Anti-Anxiety']
    },
    health: {
      type: ['Supplements', 'First Aid', 'Medications', 'Dental Care'],
      concern: ['Joint Health', 'Anxiety', 'Digestion', 'Immune Support'],
      form: ['Chews', 'Tablets', 'Liquid', 'Powder']
    }
  };

  const currentFilters = categoryFilters[categoryId as keyof typeof categoryFilters] || {};

  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Price Range</h3>
        <div className="space-y-4">
          <input
            type="range"
            min="0"
            max="200"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Fun Filters - Based on Dog Profile */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Perfect for Your Dog</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.sizeAppropriate}
              onChange={(e) => setFilters({ ...filters, sizeAppropriate: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Size Appropriate</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.ageAppropriate}
              onChange={(e) => setFilters({ ...filters, ageAppropriate: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Age Appropriate</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.activityLevel}
              onChange={(e) => setFilters({ ...filters, activityLevel: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Matches Activity Level</span>
          </label>
        </div>
      </div>

      {/* Category-Specific Filters */}
      {Object.entries(currentFilters).map(([filterName, options]) => (
        <div key={filterName} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white capitalize">
            {filterName.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
          <div className="space-y-3">
            {(options as string[]).map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters[filterName]?.includes(option)}
                  onChange={(e) => {
                    const currentFilters = filters[filterName] || [];
                    setFilters({
                      ...filters,
                      [filterName]: e.target.checked
                        ? [...currentFilters, option]
                        : currentFilters.filter((f: string) => f !== option)
                    });
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductFilters;