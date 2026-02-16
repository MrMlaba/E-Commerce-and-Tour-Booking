import { createContext, useContext, useState, ReactNode } from 'react';

export interface SearchFilters {
  searchTerm: string;
  categories: string[];
  priceRange: [number, number];
  sortBy: 'name' | 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  inStock: boolean;
  minRating?: number;
}

interface SearchContextType {
  filters: SearchFilters;
  updateFilters: (newFilters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  isFilterActive: boolean;
}

const defaultFilters: SearchFilters = {
  searchTerm: '',
  categories: [],
  priceRange: [0, 10000],
  sortBy: 'name',
  inStock: false,
  minRating: undefined,
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider = ({ children }: SearchProviderProps) => {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const isFilterActive = 
    filters.searchTerm !== '' ||
    filters.categories.length > 0 ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== 10000 ||
    filters.sortBy !== 'name' ||
    filters.inStock ||
    filters.minRating !== undefined;

  return (
    <SearchContext.Provider value={{
      filters,
      updateFilters,
      resetFilters,
      isFilterActive
    }}>
      {children}
    </SearchContext.Provider>
  );
};
