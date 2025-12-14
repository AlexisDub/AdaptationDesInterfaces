import { type Dish } from '../data/dishes';
import { Button } from './ui/button';
import { Star, Plus, Minus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface DishCardProps {
  dish: Dish;
  onAddToCart: (dish: Dish, quantity?: number) => void;
  compact?: boolean;
  showDescription?: boolean;
  onClick?: (dish: Dish) => void;
  deviceType?: 'tablet' | 'smartphone';
  quantity?: number;
  onUpdateQuantity?: (dishId: string, change: number) => void;
}

export function DishCard({ 
  dish, 
  onAddToCart, 
  compact = false, 
  showDescription = true, 
  onClick,
  deviceType,
  quantity = 0,
  onUpdateQuantity
}: DishCardProps) {
  const isTablet = deviceType === 'tablet';
  const hasQuantity = quantity > 0;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTablet && onUpdateQuantity) {
      onUpdateQuantity(dish.id, 1);
    } else {
      onAddToCart(dish);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTablet && onUpdateQuantity) {
      onUpdateQuantity(dish.id, -1);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group relative"
      onClick={() => onClick?.(dish)}
    >
      {/* Quantity Badge - Top Right */}
      {isTablet && hasQuantity && (
        <div className="absolute top-2 right-2 bg-orange-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm z-10 shadow-lg">
          {quantity}
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <ImageWithFallback
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {dish.isSpecialOfDay && !hasQuantity && (
          <div className={`absolute top-2 right-2 bg-orange-600 text-white rounded-full flex items-center gap-1 ${deviceType === 'smartphone' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'}`}>
            <Star className={`${deviceType === 'smartphone' ? 'w-2.5 h-2.5' : 'w-3 h-3'} fill-current`} />
            {deviceType === 'tablet' && 'Plat du jour'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={deviceType === 'smartphone' ? 'p-2' : 'p-3'}>
        <div className={`flex items-start justify-between gap-2 ${deviceType === 'smartphone' ? 'mb-1' : 'mb-2'}`}>
          <h4 className={`text-neutral-900 line-clamp-2 flex-1 ${deviceType === 'smartphone' ? 'text-xs leading-tight' : ''}`}>{dish.name}</h4>
          <span className={`text-orange-600 whitespace-nowrap ${deviceType === 'smartphone' ? 'text-xs' : 'text-sm'}`}>{dish.price.toFixed(2)}€</span>
        </div>

        {/* Tablet Mode: Quantity Controls */}
        {isTablet && (
          <div className="mt-2">
            {hasQuantity ? (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRemoveClick}
                  className="h-8 flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center bg-orange-50 border border-orange-200 rounded py-1.5 text-sm text-orange-600">
                  {quantity}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddClick}
                  className="h-8 flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleAddClick}
                className="w-full bg-orange-600 hover:bg-orange-700 h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}