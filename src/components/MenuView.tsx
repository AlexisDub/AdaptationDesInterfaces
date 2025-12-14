import { useState, useEffect } from 'react';
import { dishes, type Dish } from '../data/dishes';
import { DishCard } from './DishCard';
import { SuggestionsPanel } from './SuggestionsPanel';
import { IngredientSearchBar, type IngredientFilters } from './IngredientSearchBar';
import { AdvancedFilters, type AdvancedFilterOptions, applyAdvancedFilters } from './AdvancedFilters';
import { Sparkles, X, Plus, Minus, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ViewModeToggle, type DisplayMode } from './ViewModeToggle';

interface MenuViewProps {
  deviceType: 'tablet' | 'smartphone';
  showSuggestions: boolean;
  onDishHover: (dishId: string) => void;
  onDishLeave: () => void;
  onAddToCart: (dish: Dish, quantity?: number) => void;
  getItemQuantity?: (dishId: string) => number;
}

export function MenuView({ 
  deviceType, 
  onAddToCart,
  getItemQuantity
}: MenuViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'entrée' | 'plat' | 'dessert'>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [modalOpenTime, setModalOpenTime] = useState<number | null>(null);
  const [showModalSuggestions, setShowModalSuggestions] = useState(false);
  const [ingredientFilters, setIngredientFilters] = useState<IngredientFilters>({ included: [], excluded: [] });
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterOptions>({
    dietary: [],
    characteristics: [],
    cuisine: []
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');

  // Filter dishes by ingredients
  const ingredientFilteredDishes = dishes.filter(dish => {
    // Check if dish contains all included ingredients
    const hasAllIncluded = ingredientFilters.included.every(ingredient => 
      dish.ingredients.some(dishIngredient => 
        dishIngredient.toLowerCase().includes(ingredient.toLowerCase())
      )
    );

    // Check if dish doesn't contain any excluded ingredients
    const hasNoExcluded = !ingredientFilters.excluded.some(ingredient => 
      dish.ingredients.some(dishIngredient => 
        dishIngredient.toLowerCase().includes(ingredient.toLowerCase())
      )
    );

    return hasAllIncluded && hasNoExcluded;
  });

  // Apply advanced filters
  const advancedFilteredDishes = applyAdvancedFilters(ingredientFilteredDishes, advancedFilters);

  // Filter dishes by category
  const categoryFilteredDishes = selectedCategory === 'all' 
    ? advancedFilteredDishes 
    : advancedFilteredDishes.filter(d => d.category === selectedCategory);

  // Get unique subcategories for the selected category
  const subcategories = selectedCategory !== 'all'
    ? Array.from(new Set(categoryFilteredDishes.map(d => d.subcategory).filter(Boolean)))
    : [];

  // Filter by subcategory if selected
  const filteredDishes = selectedSubcategory
    ? categoryFilteredDishes.filter(d => d.subcategory === selectedSubcategory)
    : categoryFilteredDishes;

  const popularDishes = dishes.filter(d => d.popularity >= 4);
  const specialOfDay = dishes.find(d => d.isSpecialOfDay);

  // Reset subcategory when category changes
  const handleCategoryChange = (cat: 'all' | 'entrée' | 'plat' | 'dessert') => {
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
  };

  // Hesitation detection in modal
  useEffect(() => {
    if (selectedDish && modalOpenTime) {
      const timer = setTimeout(() => {
        setShowModalSuggestions(true);
      }, 6000); // 6 seconds - Reduced from 10

      return () => clearTimeout(timer);
    } else {
      setShowModalSuggestions(false);
    }
  }, [selectedDish, modalOpenTime]);

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
    setModalOpenTime(Date.now());
    setShowModalSuggestions(false);
  };

  const handleCloseModal = () => {
    setSelectedDish(null);
    setModalOpenTime(null);
    setShowModalSuggestions(false);
  };

  const handleAddToCart = (dish: Dish) => {
    onAddToCart(dish);
    handleCloseModal();
  };

  return (
    <div className={deviceType === 'smartphone' ? 'p-2' : 'p-4'}>
      {/* Sticky Filters Section */}
      <div className={`sticky top-0 z-20 bg-gradient-to-br from-orange-50 to-white ${
        deviceType === 'smartphone' 
          ? '-mx-2 px-2 -mt-2 pt-2 pb-1' 
          : '-mx-4 px-4 -mt-4 pt-4 pb-4'
      }`}>
        {/* Ingredient Search Bar */}
        <div className={deviceType === 'smartphone' ? 'mb-2' : 'mb-3'}>
          <IngredientSearchBar 
            onFiltersChange={setIngredientFilters}
            deviceType={deviceType}
          />
        </div>

        {/* Category Filter + Advanced Filters Toggle - Single Line */}
        <div className={`flex gap-1.5 overflow-x-auto pb-2 ${deviceType === 'smartphone' ? 'mb-2' : 'mb-3'}`}>
          {['all', 'entrée', 'plat', 'dessert'].map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat as any)}
              className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors text-sm ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-neutral-700 border border-neutral-300 hover:border-orange-400'
              }`}
            >
              {cat === 'all' ? 'Tout' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
          
          {/* Advanced Filters Toggle Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-2.5 py-2 rounded-lg whitespace-nowrap transition-colors text-sm flex items-center gap-1 ${
              showAdvancedFilters || 
              advancedFilters.dietary.length > 0 || 
              advancedFilters.characteristics.length > 0 || 
              advancedFilters.cuisine.length > 0
                ? 'bg-blue-600 text-white'
                : 'bg-white text-neutral-700 border border-neutral-300 hover:border-blue-400'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtres</span>
            {showAdvancedFilters ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            {(advancedFilters.dietary.length > 0 || 
              advancedFilters.characteristics.length > 0 || 
              advancedFilters.cuisine.length > 0) && (
              <span className="bg-white text-blue-600 px-1.5 py-0.5 rounded-full text-xs">
                {advancedFilters.dietary.length + advancedFilters.characteristics.length + advancedFilters.cuisine.length}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters - Collapsible */}
        {showAdvancedFilters && (
          <div className="mb-3 animate-in slide-in-from-top-2 duration-200">
            <AdvancedFilters
              filters={advancedFilters}
              onFiltersChange={setAdvancedFilters}
              deviceType={deviceType}
            />
          </div>
        )}

        {/* Subcategory Filter */}
        {subcategories.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedSubcategory(null)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs transition-colors ${
                selectedSubcategory === null
                  ? 'bg-orange-100 text-orange-700 border border-orange-300'
                  : 'bg-neutral-50 text-neutral-600 border border-neutral-200 hover:border-orange-300'
              }`}
            >
              Tous
            </button>
            {subcategories.map((subcat) => (
              <button
                key={subcat}
                onClick={() => setSelectedSubcategory(subcat as string)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs transition-colors ${
                  selectedSubcategory === subcat
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-neutral-50 text-neutral-600 border border-neutral-200 hover:border-orange-300'
                }`}
              >
                {subcat}
              </button>
            ))}
          </div>
        )}

        {/* Results Count */}
        {(ingredientFilters.included.length > 0 || ingredientFilters.excluded.length > 0) && (
          <div className="text-xs text-neutral-600">
            {filteredDishes.length} {filteredDishes.length > 1 ? 'plats trouvés' : 'plat trouvé'}
          </div>
        )}
      </div>

      {/* Dishes Grid */}
      <div className={displayMode === 'grid' ? `
        grid
        ${deviceType === 'tablet' ? 'grid-cols-4 gap-3 mt-4' : 'grid-cols-3 gap-2 mt-1'}
      ` : 'space-y-1 mt-1'}>
        {filteredDishes.map((dish) => {
          const quantity = getItemQuantity ? getItemQuantity(dish.id) : 0;
          
          // Mode liste pour smartphone - Très compact sans image
          if (displayMode === 'list' && deviceType === 'smartphone') {
            return (
              <div
                key={dish.id}
                onClick={() => handleDishClick(dish)}
                className="bg-white rounded-lg px-3 py-2 flex gap-2 items-center border border-neutral-200 hover:border-orange-400 transition-colors cursor-pointer active:bg-neutral-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base text-neutral-900 line-clamp-1 flex-1">{dish.name}</h3>
                    <span className="text-base text-orange-600 flex-shrink-0">{dish.price.toFixed(2)}€</span>
                  </div>
                </div>
                {quantity > 0 ? (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(dish, -1);
                      }}
                      className="w-7 h-7 bg-neutral-100 rounded-full flex items-center justify-center hover:bg-neutral-200 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-base text-neutral-700 min-w-[1.5rem] text-center">{quantity}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(dish, 1);
                      }}
                      className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(dish, 1);
                    }}
                    className="flex-shrink-0 w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          }
          
          // Mode grille (par défaut)
          return (
            <DishCard
              key={dish.id}
              dish={dish}
              onAddToCart={onAddToCart}
              onClick={handleDishClick}
              compact={true}
              showDescription={false}
              deviceType={deviceType}
              quantity={quantity}
              onUpdateQuantity={(dishId, change) => {
                const currentQuantity = getItemQuantity ? getItemQuantity(dishId) : 0;
                const newQuantity = Math.max(0, currentQuantity + change);
                onAddToCart(dish, change);
              }}
            />
          );
        })}
      </div>

      {/* No Results Message */}
      {filteredDishes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-600 mb-2">Aucun plat trouvé avec ces filtres</p>
          <p className="text-sm text-neutral-500">Essayez de modifier vos critères de recherche</p>
        </div>
      )}

      {/* View Mode Toggle - Only on smartphone when dishes are present */}
      {deviceType === 'smartphone' && filteredDishes.length > 0 && (
        <ViewModeToggle
          displayMode={displayMode}
          onToggle={() => setDisplayMode(displayMode === 'grid' ? 'list' : 'grid')}
        />
      )}

      {/* Dish Detail Modal */}
      {selectedDish && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal}
        >
          <div
            className={`bg-white rounded-2xl overflow-hidden flex flex-col ${
              deviceType === 'tablet' ? 'max-w-2xl w-full max-h-[90vh]' : 'max-w-md w-full max-h-[90vh]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Fixed */}
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors z-10"
            >
              <X className="w-5 h-5 text-neutral-900" />
            </button>

            {/* Modal Content - Scrollable (including image) */}
            <div className="flex-1 overflow-y-auto">
              {/* Modal Header with Image */}
              <div className="relative">
                <ImageWithFallback
                  src={selectedDish.imageUrl}
                  alt={selectedDish.name}
                  className="w-full aspect-video object-cover"
                />
                {selectedDish.isSpecialOfDay && (
                  <div className="absolute top-3 left-3 bg-orange-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Plat du jour
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-neutral-900">{selectedDish.name}</h2>
                  <span className="text-orange-600 text-xl ml-3">{selectedDish.price.toFixed(2)}€</span>
                </div>

                {/* Ingredients */}
                <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                  <h3 className="text-neutral-900 mb-2">Ingrédients</h3>
                  <p className="text-neutral-700">{selectedDish.description}</p>
                </div>

                {/* Hesitation Suggestions */}
                {showModalSuggestions && (
                  <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5" />
                        <span>Vous hésitez ? Voici d'autres suggestions</span>
                      </div>
                      <SuggestionsPanel
                        specialOfDay={specialOfDay}
                        popularDishes={popularDishes}
                        onAddToCart={handleAddToCart}
                        deviceType={deviceType}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions - Fixed at bottom */}
            <div className="flex-shrink-0 p-6 pt-0 bg-white border-t border-neutral-200">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCloseModal}
                >
                  Retour
                </Button>
                <Button
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  onClick={() => handleAddToCart(selectedDish)}
                >
                  Ajouter au panier
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}