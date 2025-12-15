import { type Dish } from '../data/dishes';
import { Star, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';

interface SuggestionsPanelProps {
  specialOfDay?: Dish;
  popularDishes: Dish[];
  onAddToCart: (dish: Dish) => void;
  deviceType: 'tablet' | 'smartphone';
}

export function SuggestionsPanel({ 
  specialOfDay, 
  popularDishes, 
  onAddToCart,
  deviceType 
}: SuggestionsPanelProps) {
  const topDishes = popularDishes.slice(0, deviceType === 'tablet' ? 3 : 2);

  return (
    <div className="space-y-3">
      {/* Special of Day */}
      {specialOfDay && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <div className="flex items-center gap-2 mb-2 text-white">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm">Plat du jour recommandé</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white">{specialOfDay.name}</div>
              <div className="text-white/80 text-sm">{specialOfDay.price.toFixed(2)}€</div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="bg-white text-orange-600 hover:bg-white/90 border-none"
              onClick={() => onAddToCart(specialOfDay)}
            >
              Choisir
            </Button>
          </div>
        </div>
      )}

      {/* Popular Dishes */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
        <div className="flex items-center gap-2 mb-2 text-white">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">Plats suggérés</span>
        </div>
        <div className="space-y-2">
          {topDishes.map((dish) => (
            <div key={dish.id} className="flex items-center justify-between text-sm">
              <span className="text-white">{dish.name}</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8 px-3"
                onClick={() => onAddToCart(dish)}
              >
                +
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
