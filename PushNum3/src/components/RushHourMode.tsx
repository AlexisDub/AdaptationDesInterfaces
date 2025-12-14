import { useState } from 'react';
import { dishes, type Dish } from '../data/dishes';
import { Button } from './ui/button';
import { Clock, Zap, Coffee, Utensils, Sparkles, TrendingUp, Timer, Leaf, Pizza, ChevronRight, ChevronDown, ChevronUp, SlidersHorizontal, ArrowLeft, X, Minus, Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { IngredientSearchBar, type IngredientFilters } from './IngredientSearchBar';
import { AdvancedFilters, type AdvancedFilterOptions, applyAdvancedFilters } from './AdvancedFilters';
import { ViewModeToggle, type DisplayMode } from './ViewModeToggle';

interface RushHourModeProps {
  deviceType: 'tablet' | 'smartphone';
  onAddToCart: (dish: Dish) => void;
  getItemQuantity?: (dishId: string) => number;
}

type TimePreference = '30min' | '1h' | null;
type ViewMode = 'suggestions' | 'all-dishes' | 'category-detail';

interface RushCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  iconColor: string;
  bgColor: string;
  badgeText: string;
  imageUrl: string;
  filterFn: (dishes: Dish[]) => Dish[];
}

export function RushHourMode({ deviceType, onAddToCart, getItemQuantity }: RushHourModeProps) {
  const [timePreference, setTimePreference] = useState<TimePreference>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('suggestions');
  const [selectedRushCategory, setSelectedRushCategory] = useState<string | null>(null);
  const [ingredientFilters, setIngredientFilters] = useState<IngredientFilters>({ included: [], excluded: [] });
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterOptions>({
    dietary: [],
    characteristics: [],
    cuisine: []
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'entrée' | 'plat' | 'dessert'>('all');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');

  if (!timePreference) {
    return (
      <div className={`p-4 ${deviceType === 'tablet' ? 'max-w-2xl mx-auto' : 'max-w-md mx-auto'}`}>
        <div className={`text-center ${deviceType === 'tablet' ? 'mb-6' : 'mb-4'}`}>
          <div className={`inline-flex items-center justify-center ${
            deviceType === 'tablet' ? 'w-16 h-16' : 'w-10 h-10'
          } bg-orange-100 rounded-full ${deviceType === 'tablet' ? 'mb-3' : 'mb-2'}`}>
            <Clock className={`${deviceType === 'tablet' ? 'w-8 h-8' : 'w-5 h-5'} text-orange-600`} />
          </div>
          <h2 className={`text-neutral-900 ${deviceType === 'tablet' ? 'mb-2' : 'mb-1 text-lg'}`}>Heure de pointe</h2>
          <p className={`text-neutral-600 ${deviceType === 'tablet' ? 'text-sm' : 'text-xs'}`}>
            Combien de temps avez-vous ?
          </p>
        </div>

        <div className={deviceType === 'tablet' ? 'space-y-2' : 'space-y-1.5'}>
          <button
            onClick={() => setTimePreference('30min')}
            className={`w-full bg-white border-2 border-neutral-300 rounded-xl ${
              deviceType === 'tablet' ? 'p-3' : 'p-2'
            } hover:border-orange-500 hover:bg-orange-50 transition-all text-left group`}
          >
            <div className="flex items-center gap-2">
              <div className={`${deviceType === 'tablet' ? 'w-10 h-10' : 'w-8 h-8'} bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0`}>
                <Zap className={`${deviceType === 'tablet' ? 'w-5 h-5' : 'w-4 h-4'} text-red-600`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-neutral-900 ${deviceType === 'tablet' ? 'text-sm' : 'text-xs'}`}>30 min - Plats rapides</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setTimePreference('1h')}
            className={`w-full bg-white border-2 border-neutral-300 rounded-xl ${
              deviceType === 'tablet' ? 'p-3' : 'p-2'
            } hover:border-orange-500 hover:bg-orange-50 transition-all text-left group`}
          >
            <div className="flex items-center gap-2">
              <div className={`${deviceType === 'tablet' ? 'w-10 h-10' : 'w-8 h-8'} bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors flex-shrink-0`}>
                <Clock className={`${deviceType === 'tablet' ? 'w-5 h-5' : 'w-4 h-4'} text-orange-600`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-neutral-900 ${deviceType === 'tablet' ? 'text-sm' : 'text-xs'}`}>1h - Sélection équilibrée</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Filtrer les plats selon la contrainte de temps
  const maxPrepTime = timePreference === '30min' ? 30 : 60;
  const dishesFilteredByTime = dishes.filter(d => d.prepTime <= maxPrepTime);

  // Définir les catégories Rush
  const rushCategories: RushCategory[] = [
    {
      id: 'express-light',
      name: 'Express & Léger',
      description: 'Rapide et sain',
      icon: Leaf,
      iconColor: 'text-green-600',
      bgColor: 'from-green-500 to-emerald-600',
      badgeText: '< 15 min',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
      filterFn: (dishes) => dishes.filter(d => d.prepTime <= 15 && d.isLight).sort((a, b) => a.prepTime - b.prepTime)
    },
    {
      id: 'popular-fast',
      name: 'Les plus demandés',
      description: 'Favoris des clients',
      icon: TrendingUp,
      iconColor: 'text-orange-600',
      bgColor: 'from-orange-500 to-red-600',
      badgeText: 'Popularité ★★★★+',
      imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
      filterFn: (dishes) => dishes.filter(d => d.popularity >= 4).sort((a, b) => a.prepTime - b.prepTime)
    },
    {
      id: 'complete-meals',
      name: 'Plats complets',
      description: 'Un vrai repas',
      icon: Pizza,
      iconColor: 'text-purple-600',
      bgColor: 'from-purple-500 to-pink-600',
      badgeText: 'Plats principaux',
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
      filterFn: (dishes) => dishes.filter(d => d.category === 'plat').sort((a, b) => a.prepTime - b.prepTime)
    },
    {
      id: 'quick-starters',
      name: 'Entrées rapides',
      description: 'Pour bien commencer',
      icon: Utensils,
      iconColor: 'text-blue-600',
      bgColor: 'from-blue-500 to-cyan-600',
      badgeText: 'Entrées',
      imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800',
      filterFn: (dishes) => dishes.filter(d => d.category === 'entrée').sort((a, b) => a.prepTime - b.prepTime)
    },
    {
      id: 'quick-desserts',
      name: 'Desserts rapides',
      description: 'Pour terminer',
      icon: Coffee,
      iconColor: 'text-pink-600',
      bgColor: 'from-pink-500 to-rose-600',
      badgeText: 'Desserts',
      imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
      filterFn: (dishes) => dishes.filter(d => d.category === 'dessert').sort((a, b) => a.prepTime - b.prepTime)
    }
  ];

  // Calculer les plats pour chaque catégorie
  const categoriesWithDishes = rushCategories.map(cat => ({
    ...cat,
    dishes: cat.filterFn(dishesFilteredByTime),
    count: cat.filterFn(dishesFilteredByTime).length
  })).filter(cat => cat.count > 0);

  // Pour la vue "all-dishes" : appliquer tous les filtres
  let filteredDishes = dishesFilteredByTime;

  // Appliquer les filtres d'ingrédients
  filteredDishes = filteredDishes.filter(dish => {
    const hasAllIncluded = ingredientFilters.included.every(ingredient => 
      dish.ingredients.some(dishIngredient => 
        dishIngredient.toLowerCase().includes(ingredient.toLowerCase())
      )
    );

    const hasNoExcluded = !ingredientFilters.excluded.some(ingredient => 
      dish.ingredients.some(dishIngredient => 
        dishIngredient.toLowerCase().includes(ingredient.toLowerCase())
      )
    );

    return hasAllIncluded && hasNoExcluded;
  });

  // Appliquer les filtres avancés
  filteredDishes = applyAdvancedFilters(filteredDishes, advancedFilters);

  // Appliquer le filtre de catégorie
  if (selectedCategory !== 'all') {
    filteredDishes = filteredDishes.filter(d => d.category === selectedCategory);
  }

  const handleCategoryChange = (category: 'all' | 'entrée' | 'plat' | 'dessert') => {
    setSelectedCategory(category);
  };

  const handleCategoryCardClick = (categoryId: string) => {
    setSelectedRushCategory(categoryId);
    setViewMode('category-detail');
  };

  const handleBackToSuggestions = () => {
    setSelectedRushCategory(null);
    setViewMode('suggestions');
  };

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
  };

  const handleCloseModal = () => {
    setSelectedDish(null);
  };

  const handleAddToCartFromModal = (dish: Dish) => {
    onAddToCart(dish);
    handleCloseModal();
  };

  return (
    <div className={deviceType === 'smartphone' ? 'p-2 relative' : 'p-4 relative'}>
      {/* En-tête avec indicateur de temps - SUPPRIMÉ POUR GAGNER DE LA PLACE */}
      
      {/* Toggle View Mode - Seulement si pas en mode category-detail */}
      {viewMode !== 'category-detail' && (
        <div className={`flex gap-2 ${deviceType === 'smartphone' ? 'mb-2' : 'mb-4'}`}>
          <button
            onClick={() => setViewMode('suggestions')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
              viewMode === 'suggestions'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white text-neutral-700 border border-neutral-300 hover:border-orange-400'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Suggestions</span>
            </div>
          </button>
          <button
            onClick={() => setViewMode('all-dishes')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
              viewMode === 'all-dishes'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-white text-neutral-700 border border-neutral-300 hover:border-orange-400'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Utensils className="w-4 h-4" />
              <span>Tous les plats &le; {maxPrepTime} min</span>
            </div>
          </button>
        </div>
      )}

      {/* Vue Suggestions : Cartes de catégories */}
      {viewMode === 'suggestions' && (
        <div className={`grid gap-4 ${deviceType === 'tablet' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {categoriesWithDishes.map(category => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryCardClick(category.id)}
                className="group bg-white rounded-xl overflow-hidden border-2 border-neutral-200 hover:border-orange-400 transition-all text-left shadow-sm hover:shadow-md"
              >
                {/* Image de fond */}
                <div className="relative h-32 overflow-hidden">
                  <ImageWithFallback
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.bgColor} opacity-60`}></div>
                  
                  {/* Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-neutral-900">
                    {category.badgeText}
                  </div>

                  {/* Compteur de plats */}
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-neutral-900">
                    {category.count} {category.count > 1 ? 'plats' : 'plat'}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-5 h-5 ${category.iconColor}`} />
                      <h3 className="text-neutral-900 font-medium">{category.name}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-orange-600 transition-colors" />
                  </div>
                  <p className="text-sm text-neutral-600">{category.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Vue Détail Catégorie */}
      {viewMode === 'category-detail' && selectedRushCategory && (() => {
        const category = categoriesWithDishes.find(c => c.id === selectedRushCategory);
        if (!category) return null;
        
        const IconComponent = category.icon;
        const categoryDishes = category.dishes;
        
        return (
          <div>
            {/* Bouton retour */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToSuggestions}
              className="mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux suggestions
            </Button>

            {/* En-tête de la catégorie */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <IconComponent className={`w-6 h-6 ${category.iconColor}`} />
                <h2 className="text-neutral-900 text-xl">{category.name}</h2>
              </div>
              <p className="text-neutral-600 text-sm">{category.count} {category.count > 1 ? 'plats disponibles' : 'plat disponible'}</p>
            </div>

            {/* Grille ou liste de plats */}
            <div className={displayMode === 'grid' ? `grid ${deviceType === 'tablet' ? 'grid-cols-4 gap-3' : 'grid-cols-3 gap-2'}` : 'space-y-1'}>
              {categoryDishes.map(dish => {
                const quantity = getItemQuantity ? getItemQuantity(dish.id) : 0;
                
                // Mode liste pour smartphone - Très compact sans image
                if (displayMode === 'list' && deviceType === 'smartphone') {
                  return (
                    <div
                      key={dish.id}
                      onClick={() => handleDishClick(dish)}
                      className="bg-white rounded-lg px-3 py-2 flex gap-2 items-center border border-neutral-200 hover:border-orange-400 transition-colors cursor-pointer active:bg-neutral-50"
                    >
                      {/* Temps de préparation */}
                      <div className="flex items-center gap-1 text-orange-600 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{dish.prepTime}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm text-neutral-900 line-clamp-1 flex-1">{dish.name}</h3>
                          <span className="text-sm text-orange-600 flex-shrink-0">{dish.price.toFixed(2)}€</span>
                        </div>
                      </div>
                      {quantity > 0 ? (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentQty = getItemQuantity ? getItemQuantity(dish.id) : 0;
                              if (currentQty > 1) {
                                onAddToCart(dish);
                              }
                            }}
                            className="w-7 h-7 bg-neutral-100 rounded-full flex items-center justify-center hover:bg-neutral-200 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm text-neutral-700 min-w-[1.5rem] text-center">{quantity}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(dish);
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
                            onAddToCart(dish);
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
                  <DishQuickCard
                    key={dish.id}
                    dish={dish}
                    onAddToCart={onAddToCart}
                    onDishClick={handleDishClick}
                    deviceType={deviceType}
                    getItemQuantity={getItemQuantity}
                  />
                );
              })}
            </div>
            
            {/* View Mode Toggle - Only on smartphone when dishes are present */}
            {deviceType === 'smartphone' && categoryDishes.length > 0 && (
              <ViewModeToggle
                displayMode={displayMode}
                onToggle={() => setDisplayMode(displayMode === 'grid' ? 'list' : 'grid')}
              />
            )}
          </div>
        );
      })()}

      {/* Vue "Tous les plats" avec filtres sticky */}
      {viewMode === 'all-dishes' && (
        <div>
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

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-neutral-600">
              <span>{filteredDishes.length} {filteredDishes.length > 1 ? 'plats disponibles' : 'plat disponible'}</span>
              {(ingredientFilters.included.length > 0 || 
                ingredientFilters.excluded.length > 0 ||
                advancedFilters.dietary.length > 0 ||
                advancedFilters.characteristics.length > 0 ||
                advancedFilters.cuisine.length > 0 ||
                selectedCategory !== 'all') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIngredientFilters({ included: [], excluded: [] });
                    setAdvancedFilters({ dietary: [], characteristics: [], cuisine: [] });
                    setSelectedCategory('all');
                  }}
                  className="text-xs"
                >
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>

          {/* Liste des plats */}
          {filteredDishes.length > 0 ? (
            <div className={displayMode === 'grid' ? `grid ${deviceType === 'tablet' ? 'grid-cols-4 gap-3 mt-4' : 'grid-cols-3 gap-2 mt-1'}` : 'space-y-1 mt-1'}>
              {filteredDishes.map(dish => {
                const quantity = getItemQuantity ? getItemQuantity(dish.id) : 0;
                
                // Mode liste pour smartphone - Très compact sans image
                if (displayMode === 'list' && deviceType === 'smartphone') {
                  return (
                    <div
                      key={dish.id}
                      onClick={() => handleDishClick(dish)}
                      className="bg-white rounded-lg px-3 py-2 flex gap-2 items-center border border-neutral-200 hover:border-orange-400 transition-colors cursor-pointer active:bg-neutral-50"
                    >
                      {/* Temps de préparation */}
                      <div className="flex items-center gap-1 text-orange-600 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{dish.prepTime}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm text-neutral-900 line-clamp-1 flex-1">{dish.name}</h3>
                          <span className="text-sm text-orange-600 flex-shrink-0">{dish.price.toFixed(2)}€</span>
                        </div>
                      </div>
                      {quantity > 0 ? (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentQty = getItemQuantity ? getItemQuantity(dish.id) : 0;
                              if (currentQty > 1) {
                                onAddToCart(dish);
                              }
                            }}
                            className="w-7 h-7 bg-neutral-100 rounded-full flex items-center justify-center hover:bg-neutral-200 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm text-neutral-700 min-w-[1.5rem] text-center">{quantity}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(dish);
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
                            onAddToCart(dish);
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
                  <DishQuickCard
                    key={dish.id}
                    dish={dish}
                    onAddToCart={onAddToCart}
                    onDishClick={handleDishClick}
                    deviceType={deviceType}
                    getItemQuantity={getItemQuantity}
                  />
                );
              })}
            </div>
          ) : (
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
        </div>
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
                {/* Badge temps de préparation */}
                <div className="absolute top-3 left-3 bg-orange-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedDish.prepTime} min
                </div>
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

                {/* Additional info */}
                {selectedDish.isLight && (
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <Leaf className="w-4 h-4" />
                    <span className="text-sm">Plat léger</span>
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
                  onClick={() => handleAddToCartFromModal(selectedDish)}
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

// Composant carte de plat optimisé pour le mode Rush
interface DishQuickCardProps {
  dish: Dish;
  onAddToCart: (dish: Dish) => void;
  onDishClick: (dish: Dish) => void;
  deviceType: 'tablet' | 'smartphone';
  getItemQuantity?: (dishId: string) => number;
}

function DishQuickCard({ dish, onAddToCart, onDishClick, deviceType, getItemQuantity }: DishQuickCardProps) {
  const quantity = getItemQuantity?.(dish.id) || 0;
  const isSmartphone = deviceType === 'smartphone';
  
  return (
    <div className="bg-white rounded-xl border-2 border-neutral-200 hover:border-orange-400 transition-all overflow-hidden group">
      <div 
        className="relative cursor-pointer" 
        onClick={() => onDishClick(dish)}
      >
        <ImageWithFallback
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full aspect-square object-cover"
        />
        {/* Badge temps de préparation */}
        <div className={`absolute top-2 right-2 bg-orange-600 text-white rounded-full flex items-center gap-1 shadow-md ${isSmartphone ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'}`}>
          <Clock className={`${isSmartphone ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
          {dish.prepTime}
        </div>
        {dish.isLight && (
          <div className={`absolute bottom-2 left-2 bg-green-600 text-white rounded-full flex items-center gap-1 shadow-md ${isSmartphone ? 'p-1' : 'px-2 py-1'}`}>
            <Leaf className={`${isSmartphone ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
          </div>
        )}
      </div>
      
      <div className={isSmartphone ? 'p-2' : 'p-3'}>
        <div className={isSmartphone ? 'mb-1' : 'mb-2'}>
          <div className={`text-neutral-900 line-clamp-1 mb-1 ${isSmartphone ? 'text-xs leading-tight' : 'text-sm'}`}>{dish.name}</div>
          <div className={`text-orange-600 ${isSmartphone ? 'text-xs' : 'font-medium'}`}>{dish.price.toFixed(2)}€</div>
        </div>
        
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(dish);
          }}
          className={`w-full bg-orange-600 hover:bg-orange-700 ${isSmartphone ? 'text-xs py-1 h-6' : 'text-xs py-2'}`}
        >
          Ajouter
        </Button>
        
        {/* Quantity indicator - Only for tablet */}
        {deviceType === 'tablet' && quantity > 0 && (
          <div className="mt-2 text-center text-xs text-neutral-600 bg-orange-50 rounded py-1">
            {quantity} dans le panier
          </div>
        )}
      </div>
    </div>
  );
}