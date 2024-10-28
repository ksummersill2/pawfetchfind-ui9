import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clearButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOverlay = target.classList?.contains('search-overlay');
      const isSearchContent = searchRef.current?.contains(target);
      
      // Close if clicking the overlay or outside the search content
      if (isOverlay || (!isSearchContent && isExpanded)) {
        setIsExpanded(false);
        setQuery('');
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
        setQuery('');
        inputRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const updatedSearches = [
        query,
        ...recentSearches.filter(s => s !== query)
      ].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsExpanded(false);
      setQuery('');
    }
  };

  const handleSearchClick = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleRecentSearchClick = (search: string) => {
    navigate(`/search?q=${encodeURIComponent(search)}`);
    setIsExpanded(false);
    setQuery('');
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="relative z-50">
      {/* Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 search-overlay"
          aria-hidden="true"
        />
      )}
      
      {/* Search Container */}
      <div 
        ref={searchRef}
        className={`${
          isExpanded 
            ? 'fixed inset-0 pt-4 px-4 z-50 flex flex-col items-center'
            : 'relative w-full'
        }`}
      >
        <div className={`${
          isExpanded 
            ? 'w-full max-w-3xl'
            : 'w-full'
        }`}>
          {/* Search Input */}
          <div className="relative">
            <Search 
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isExpanded ? 'text-blue-500' : 'text-gray-400'
              }`}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={handleSearchClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  handleSubmit(e);
                }
              }}
              placeholder="Search products..."
              className={`w-full pl-10 pr-10 py-3 border rounded-lg dark:border-gray-600 dark:bg-gray-800 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white
                ${isExpanded ? 'text-lg shadow-lg' : 'text-base'}`}
            />
            {query && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuery('');
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search Results */}
          {isExpanded && (
            <div className="fixed inset-x-0 top-[4.5rem] bottom-0 bg-white dark:bg-gray-900 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 py-4">
                {recentSearches.length > 0 && (
                  <div className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Recent Searches
                      </h3>
                      <button
                        ref={clearButtonRef}
                        onClick={clearRecentSearches}
                        className="text-sm text-blue-500 hover:text-blue-600"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearchClick(search)}
                          className="flex items-center w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <Search className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-700 dark:text-gray-300">{search}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;