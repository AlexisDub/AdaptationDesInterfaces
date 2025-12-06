import { useState, useMemo } from 'react';
import { Search, X, Check, Ban } from 'lucide-react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { dishes } from '../data/dishes';

export interface IngredientFilters {
  included: string[];
  excluded: string[];
}

interface IngredientSearchBarProps {
  onFiltersChange: (filters: IngredientFilters) => void;
  deviceType: 'tablet' | 'smartphone';
}

export function IngredientSearchBar({ onFiltersChange, deviceType }: IngredientSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [includedIngredients, setIncludedIngredients] = useState<string[]>([]);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get all unique ingredients from dishes
  const allIngredients = useMemo(() => {
    const ingredientsSet = new Set<string>();
    dishes.forEach(dish => {
      dish.ingredients.forEach(ingredient => {
        ingredientsSet.add(ingredient.toLowerCase());
      });
    });
    return Array.from(ingredientsSet).sort();
  }, []);

  // Filter ingredients based on search term
  const filteredSuggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    return allIngredients.filter(ingredient => 
      ingredient.includes(normalizedSearch) &&
      !includedIngredients.includes(ingredient) &&
      !excludedIngredients.includes(ingredient)
    ).slice(0, 8); // Limit to 8 suggestions
  }, [searchTerm, allIngredients, includedIngredients, excludedIngredients]);

  const handleIncludeIngredient = (ingredient: string) => {
    const newIncluded = [...includedIngredients, ingredient];
    setIncludedIngredients(newIncluded);
    setSearchTerm('');
    setShowSuggestions(false);
    onFiltersChange({ included: newIncluded, excluded: excludedIngredients });
  };

  const handleExcludeIngredient = (ingredient: string) => {
    const newExcluded = [...excludedIngredients, ingredient];
    setExcludedIngredients(newExcluded);
    setSearchTerm('');
    setShowSuggestions(false);
    onFiltersChange({ included: includedIngredients, excluded: newExcluded });
  };

  const handleRemoveIncluded = (ingredient: string) => {
    const newIncluded = includedIngredients.filter(i => i !== ingredient);
    setIncludedIngredients(newIncluded);
    onFiltersChange({ included: newIncluded, excluded: excludedIngredients });
  };

  const handleRemoveExcluded = (ingredient: string) => {
    const newExcluded = excludedIngredients.filter(i => i !== ingredient);
    setExcludedIngredients(newExcluded);
    onFiltersChange({ included: includedIngredients, excluded: newExcluded });
  };

  const handleClearAll = () => {
    setIncludedIngredients([]);
    setExcludedIngredients([]);
    setSearchTerm('');
    onFiltersChange({ included: [], excluded: [] });
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Rechercher par ingrédient (ex: pâtes, poulet)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 pr-4 py-2 border-neutral-300 focus:border-orange-500"
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-neutral-200 max-h-64 overflow-y-auto">
            {filteredSuggestions.map((ingredient) => (
              <div
                key={ingredient}
                className="flex items-center justify-between p-2 hover:bg-neutral-50 cursor-pointer group"
              >
                <span className="text-sm text-neutral-700 flex-1 px-2 capitalize">
                  {ingredient}
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleIncludeIngredient(ingredient)}
                    className="h-7 px-2 text-xs hover:bg-green-100 hover:text-green-700"
                    title="Inclure cet ingrédient"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Avec
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleExcludeIngredient(ingredient)}
                    className="h-7 px-2 text-xs hover:bg-red-100 hover:text-red-700"
                    title="Exclure cet ingrédient"
                  >
                    <Ban className="w-3 h-3 mr-1" />
                    Sans
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters */}
      {(includedIngredients.length > 0 || excludedIngredients.length > 0) && (
        <div className="flex flex-col gap-2">
          {/* Included Ingredients */}
          {includedIngredients.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-neutral-600">Avec:</span>
              {includedIngredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="secondary"
                  className="bg-green-100 text-green-800 hover:bg-green-200 capitalize flex items-center gap-1 pr-1"
                >
                  <Check className="w-3 h-3" />
                  {ingredient}
                  <button
                    onClick={() => handleRemoveIncluded(ingredient)}
                    className="ml-1 hover:bg-green-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Excluded Ingredients */}
          {excludedIngredients.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-neutral-600">Sans:</span>
              {excludedIngredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="secondary"
                  className="bg-red-100 text-red-800 hover:bg-red-200 capitalize flex items-center gap-1 pr-1"
                >
                  <Ban className="w-3 h-3" />
                  {ingredient}
                  <button
                    onClick={() => handleRemoveExcluded(ingredient)}
                    className="ml-1 hover:bg-red-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Clear All Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearAll}
            className="self-start text-xs text-neutral-600 hover:text-neutral-900"
          >
            <X className="w-3 h-3 mr-1" />
            Effacer tous les filtres
          </Button>
        </div>
      )}
    </div>
  );
}
