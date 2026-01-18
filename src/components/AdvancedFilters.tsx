import { Leaf, Flame, Heart, Sprout, Globe2, X } from 'lucide-react';
import { Button } from './ui/button';
import type { Dish } from '../data/dishes';

export interface AdvancedFilterOptions {
  dietary: ('vegetarian' | 'vegan' | 'glutenFree')[];
  characteristics: ('light' | 'local' | 'spicy')[];
  cuisine: ('française' | 'italienne' | 'asiatique' | 'méditerranéenne')[];
}

interface AdvancedFiltersProps {
  filters: AdvancedFilterOptions;
  onFiltersChange: (filters: AdvancedFilterOptions) => void;
  deviceType: 'tablet' | 'smartphone';
}

export function AdvancedFilters({ filters, onFiltersChange, deviceType }: AdvancedFiltersProps) {
  const hasActiveFilters = 
    filters.dietary.length > 0 || 
    filters.characteristics.length > 0 || 
    filters.cuisine.length > 0;

  const toggleDietary = (value: 'vegetarian' | 'vegan' | 'glutenFree') => {
    const newDietary = filters.dietary.includes(value)
      ? filters.dietary.filter(v => v !== value)
      : [...filters.dietary, value];
    onFiltersChange({ ...filters, dietary: newDietary });
  };

  const toggleCharacteristic = (value: 'light' | 'local' | 'spicy') => {
    const newChar = filters.characteristics.includes(value)
      ? filters.characteristics.filter(v => v !== value)
      : [...filters.characteristics, value];
    onFiltersChange({ ...filters, characteristics: newChar });
  };

  const toggleCuisine = (value: 'française' | 'italienne' | 'asiatique' | 'méditerranéenne') => {
    const newCuisine = filters.cuisine.includes(value)
      ? filters.cuisine.filter(v => v !== value)
      : [...filters.cuisine, value];
    onFiltersChange({ ...filters, cuisine: newCuisine });
  };

  const clearAll = () => {
    onFiltersChange({ dietary: [], characteristics: [], cuisine: [] });
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-700">Filtres</span>
          {hasActiveFilters && (
            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">
              Actifs
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-6 text-xs text-neutral-500 hover:text-neutral-700"
          >
            Tout effacer
          </Button>
        )}
      </div>

      {/* Dietary Filters */}
      <div>
        <div className="text-xs text-neutral-600 mb-2 flex items-center gap-1">
          <Leaf className="w-3 h-3" />
          Régime alimentaire
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            label="🥬 Végétarien"
            active={filters.dietary.includes('vegetarian')}
            onClick={() => toggleDietary('vegetarian')}
            color="green"
          />
          <FilterChip
            label="🌱 Végan"
            active={filters.dietary.includes('vegan')}
            onClick={() => toggleDietary('vegan')}
            color="green"
          />
          <FilterChip
            label="🌾 Sans gluten"
            active={filters.dietary.includes('glutenFree')}
            onClick={() => toggleDietary('glutenFree')}
            color="amber"
          />
        </div>
      </div>

      {/* Characteristics */}
      <div>
        <div className="text-xs text-neutral-600 mb-2 flex items-center gap-1">
          <Heart className="w-3 h-3" />
          Caractéristiques
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            label="💪 Léger"
            active={filters.characteristics.includes('light')}
            onClick={() => toggleCharacteristic('light')}
            color="blue"
          />
          <FilterChip
            label="🌿 Produits locaux"
            active={filters.characteristics.includes('local')}
            onClick={() => toggleCharacteristic('local')}
            color="green"
          />
          <FilterChip
            label="🌶️ Épicé"
            active={filters.characteristics.includes('spicy')}
            onClick={() => toggleCharacteristic('spicy')}
            color="red"
          />
        </div>
      </div>

      {/* Cuisine Type */}
      <div>
        <div className="text-xs text-neutral-600 mb-2 flex items-center gap-1">
          <Globe2 className="w-3 h-3" />
          Type de cuisine
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            label="🇫🇷 Française"
            active={filters.cuisine.includes('française')}
            onClick={() => toggleCuisine('française')}
            color="orange"
          />
          <FilterChip
            label="🇮🇹 Italienne"
            active={filters.cuisine.includes('italienne')}
            onClick={() => toggleCuisine('italienne')}
            color="orange"
          />
          <FilterChip
            label="🥢 Asiatique"
            active={filters.cuisine.includes('asiatique')}
            onClick={() => toggleCuisine('asiatique')}
            color="orange"
          />
          <FilterChip
            label="🌊 Méditerranéenne"
            active={filters.cuisine.includes('méditerranéenne')}
            onClick={() => toggleCuisine('méditerranéenne')}
            color="orange"
          />
        </div>
      </div>
    </div>
  );
}

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color: 'green' | 'amber' | 'blue' | 'red' | 'orange';
}

function FilterChip({ label, active, onClick, color }: FilterChipProps) {
  const colorClasses = {
    green: active 
      ? 'bg-green-600 text-white border-green-600' 
      : 'bg-white text-green-700 border-green-300 hover:bg-green-50',
    amber: active
      ? 'bg-amber-600 text-white border-amber-600'
      : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50',
    blue: active
      ? 'bg-blue-600 text-white border-blue-600'
      : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50',
    red: active
      ? 'bg-red-600 text-white border-red-600'
      : 'bg-white text-red-700 border-red-300 hover:bg-red-50',
    orange: active
      ? 'bg-orange-600 text-white border-orange-600'
      : 'bg-white text-orange-700 border-orange-300 hover:bg-orange-50',
  };

  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-xs rounded-full border-2 transition-all ${colorClasses[color]}`}
    >
      {label}
    </button>
  );
}

export function applyAdvancedFilters(dishes: Dish[], filters: AdvancedFilterOptions): Dish[] {
  return dishes.filter(dish => {
    // Dietary filters (OR logic within dietary)
    if (filters.dietary.length > 0) {
      const matchesDietary = filters.dietary.some(diet => {
        if (diet === 'vegetarian') return dish.isVegetarian === true;
        if (diet === 'vegan') return dish.isVegan === true;
        if (diet === 'glutenFree') return dish.isGlutenFree === true;
        return false;
      });
      if (!matchesDietary) return false;
    }

    // Characteristics (AND logic)
    if (filters.characteristics.includes('light') && dish.isLight !== true) return false;
    if (filters.characteristics.includes('local') && dish.isLocal !== true) return false;
    if (filters.characteristics.includes('spicy') && (!dish.spicyLevel || dish.spicyLevel === 0)) return false;

    // Cuisine (OR logic) - skip if dish has no cuisine property
    if (filters.cuisine.length > 0) {
      if (!dish.cuisine || !filters.cuisine.includes(dish.cuisine)) return false;
    }

    return true;
  });
}
