import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSearch } from '@/contexts/SearchContext';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Star,
  Package,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

interface DashboardSearchFiltersProps {
  categories: string[];
  maxPrice: number;
  type: 'products' | 'tours';
  onFilterChange?: (filters: any) => void;
}

export const DashboardSearchFilters = ({ categories, maxPrice, type, onFilterChange }: DashboardSearchFiltersProps) => {
  const { filters, updateFilters, resetFilters, isFilterActive } = useSearch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock search suggestions - in real app, this would come from API
  const mockSuggestions = type === 'products' ? [
    'indigenous herbs', 'traditional medicine', 'eco-friendly products',
    'handmade crafts', 'organic products', 'cultural artifacts',
    'sustainable goods', 'local products', 'herbal remedies'
  ] : [
    'eco-tours', 'cultural tours', 'nature walks', 'wildlife tours',
    'heritage sites', 'adventure tours', 'educational tours', 'photography tours'
  ];

  useEffect(() => {
    if (filters.searchTerm.length > 2) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [filters.searchTerm, mockSuggestions]);

  const handleSearchChange = (value: string) => {
    updateFilters({ searchTerm: value });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };

  const handlePriceRangeChange = (value: number[]) => {
    updateFilters({ priceRange: value as [number, number] });
  };

  const handleSortChange = (value: string) => {
    updateFilters({ sortBy: value as any });
  };

  const handleInStockToggle = (checked: boolean) => {
    updateFilters({ inStock: checked });
  };

  const handleSuggestionClick = (suggestion: string) => {
    updateFilters({ searchTerm: suggestion });
    setShowSuggestions(false);
  };

  const clearAllFilters = () => {
    resetFilters();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(price);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-4 w-4" />
            {type === 'products' ? 'Product Search' : 'Tour Search'}
          </CardTitle>
          {isFilterActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Input with Suggestions */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${type}...`}
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4"
              onFocus={() => setShowSuggestions(filters.searchTerm.length > 2)}
            />
          </div>
          
          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-32 overflow-y-auto">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          <Label className="text-sm">Sort By</Label>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price_asc">Price (Low to High)</SelectItem>
              <SelectItem value="price_desc">Price (High to Low)</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-2">
          <Label className="text-sm">Price Range</Label>
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceRangeChange}
              max={maxPrice}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatPrice(filters.priceRange[0])}</span>
              <span>{formatPrice(filters.priceRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm">Categories</Label>
            <div className="flex flex-wrap gap-1">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={filters.categories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors text-xs"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                  {filters.categories.includes(category) && (
                    <X className="h-2 w-2 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {type === 'products' && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto text-sm">
                <span className="flex items-center gap-2">
                  <Filter className="h-3 w-3" />
                  Advanced Filters
                </span>
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-3 mt-3">
              {/* Stock Filter */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  checked={filters.inStock}
                  onCheckedChange={handleInStockToggle}
                />
                <Label htmlFor="inStock" className="flex items-center gap-2 text-sm">
                  <Package className="h-3 w-3" />
                  In Stock Only
                </Label>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Active Filters Display */}
        {isFilterActive && (
          <div className="space-y-2">
            <Label className="text-sm">Active Filters</Label>
            <div className="flex flex-wrap gap-1">
              {filters.searchTerm && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  Search: {filters.searchTerm}
                  <X 
                    className="h-2 w-2 cursor-pointer" 
                    onClick={() => updateFilters({ searchTerm: '' })}
                  />
                </Badge>
              )}
              
              {filters.categories.map((category) => (
                <Badge key={category} variant="secondary" className="gap-1 text-xs">
                  {category}
                  <X 
                    className="h-2 w-2 cursor-pointer" 
                    onClick={() => handleCategoryToggle(category)}
                  />
                </Badge>
              ))}
              
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  Price: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
                  <X 
                    className="h-2 w-2 cursor-pointer" 
                    onClick={() => updateFilters({ priceRange: [0, maxPrice] })}
                  />
                </Badge>
              )}
              
              {filters.inStock && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  In Stock
                  <X 
                    className="h-2 w-2 cursor-pointer" 
                    onClick={() => updateFilters({ inStock: false })}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
