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
  size?: 'normal' | 'compact';
}

export function DishCard({ 
  dish, 
  onAddToCart, 
  compact = false, 
  showDescription = true, 
  onClick,
  deviceType,
  quantity = 0,
  onUpdateQuantity,
  size = 'normal'
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
        <div className={`absolute bg-orange-600 text-white rounded-full flex items-center justify-center z-10 shadow-lg ${size === 'compact' ? 'top-0.5 right-0.5 w-4 h-4 text-[8px]' : 'top-2 right-2 w-7 h-7 text-sm'}`}>
          {quantity}
        </div>
      )}

      {/* Image */}
      <div className={`relative overflow-hidden ${size === 'compact' ? 'aspect-square' : 'aspect-video'}`}>
        <ImageWithFallback
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {dish.isSpecialOfDay && !hasQuantity && (
          <div className={`absolute bg-orange-600 text-white rounded-full flex items-center ${size === 'compact' ? 'top-0.5 right-0.5 p-0.5' : deviceType === 'smartphone' ? 'top-2 right-2 px-1.5 py-0.5 gap-1' : 'top-2 right-2 px-2 py-1 gap-1'}`}>
            <Star className={`${size === 'compact' ? 'w-2 h-2' : deviceType === 'smartphone' ? 'w-2.5 h-2.5' : 'w-3 h-3'} fill-current`} />
            {deviceType === 'tablet' && size !== 'compact' && <span className="text-xs">Plat du jour</span>}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={size === 'compact' ? 'p-1' : deviceType === 'smartphone' ? 'p-2' : 'p-3'}>
        <div className={`flex items-start justify-between gap-0.5 ${size === 'compact' ? 'mb-0' : deviceType === 'smartphone' ? 'mb-1' : 'mb-2'}`}>
          <h4 className={`text-neutral-900 line-clamp-1 flex-1 ${size === 'compact' ? 'text-[8px] leading-tight' : deviceType === 'smartphone' ? 'text-xs leading-tight' : ''}`}>{dish.name}</h4>
          <span className={`text-orange-600 whitespace-nowrap ${size === 'compact' ? 'text-[8px]' : deviceType === 'smartphone' ? 'text-xs' : 'text-sm'}`}>{dish.price.toFixed(2)}€</span>
        </div>

        {/* Tablet Mode: Quantity Controls */}
        {isTablet && (
          <div className={size === 'compact' ? 'mt-0' : 'mt-2'}>
            {hasQuantity ? (
              <div className="flex items-center gap-0.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRemoveClick}
                  className={`flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 ${size === 'compact' ? 'h-4 py-0 px-0' : 'h-8'}`}
                >
                  <Minus className={size === 'compact' ? 'w-2 h-2' : 'w-4 h-4'} />
                </Button>
                <div className={`flex-1 text-center bg-orange-50 border border-orange-200 rounded text-orange-600 ${size === 'compact' ? 'py-0 text-[8px] leading-none' : 'py-1.5 text-sm'}`}>
                  {quantity}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddClick}
                  className={`flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 ${size === 'compact' ? 'h-4 py-0 px-0' : 'h-8'}`}
                >
                  <Plus className={size === 'compact' ? 'w-2 h-2' : 'w-4 h-4'} />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleAddClick}
                className={`w-full bg-orange-500 text-white hover:bg-orange-600 ${size === 'compact' ? 'h-4 py-0 px-0 text-[8px]' : 'h-8'}`}
              >
                <Plus className={size === 'compact' ? 'w-2 h-2' : 'w-4 h-4'} />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}