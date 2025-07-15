'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchBoxProps {
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSuggestions?: boolean;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
  initialValue?: string;
  suggestions?: string[];
}

export default function SearchBox({
  placeholder = 'Search blog posts...',
  className = '',
  size = 'md',
  showSuggestions = true,
  onSearch,
  autoFocus = false,
  initialValue = '',
  suggestions: propSuggestions = []
}: Readonly<SearchBoxProps>) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>(propSuggestions);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim() && showSuggestions) {
        if (propSuggestions.length > 0) {
          // Filter provided suggestions based on query
          const filteredSuggestions = propSuggestions
            .filter((suggestion) =>
              suggestion.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 5);
          setSuggestions(filteredSuggestions);
          setShowSuggestionsList(filteredSuggestions.length > 0);
        } else {
          // If no suggestions provided, show empty list
          setSuggestions([]);
          setShowSuggestionsList(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestionsList(false);
      }
      setSelectedSuggestion(-1);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, showSuggestions, propSuggestions]);

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setShowSuggestionsList(false);

    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Navigate to search page
      const params = new URLSearchParams({ q: searchQuery.trim() });
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
        handleSearch(suggestions[selectedSuggestion]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowSuggestionsList(false);
      setSelectedSuggestion(-1);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestionsList(false);
    setSelectedSuggestion(-1);
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestionsList(false);
        setSelectedSuggestion(-1);
      }
    }, 150);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon
            className={`${iconSizes[size]} text-gray-400 dark:text-gray-500`}
            aria-hidden="true"
          />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestionsList(true);
            }
          }}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`
            block w-full pl-10 pr-10 border border-gray-300 dark:border-gray-600 
            rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
            transition-colors duration-200
            ${sizeClasses[size]}
          `}
          aria-label="Search blog posts"
          aria-expanded={showSuggestionsList}
          aria-haspopup="listbox"
          aria-controls="search-suggestions"
          role="combobox"
          aria-autocomplete="list"
          aria-activedescendant={
            selectedSuggestion >= 0
              ? `suggestion-${selectedSuggestion}`
              : undefined
          }
        />

        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label="Clear search"
            >
              <XMarkIcon className={iconSizes[size]} />
            </button>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestionsList && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          id="search-suggestions"
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => {
            const isSelected = selectedSuggestion === index;
            const buttonClasses = `
              w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg
              ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-900 dark:text-gray-100'
              }
            `;

            return (
              <button
                key={suggestion}
                id={`suggestion-${index}`}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={buttonClasses}
                aria-current={isSelected ? 'true' : 'false'}
              >
                <div className="flex items-center">
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">{suggestion}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
