import { useState } from 'react';
import { MenuView } from './MenuView';
import { ShoppingCart, CreditCard, Send } from 'lucide-react';
import { Button } from './ui/button';
import type { CartItem } from './CartSidebar';
import type { Dish } from '../data/dishes';

interface PersonalCart {
  playerId: number;
  items: CartItem[];
}

interface PersonalAreaProps {
  playerId: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  cart: PersonalCart;
  onAddToCart: (playerId: number, dish: Dish, quantity?: number) => void;
  onUpdateQuantity: (playerId: number, dishId: string, newQuantity: number) => void;
  onRemoveItem: (playerId: number, dishId: string) => void;
  onSendToShared: (playerId: number) => void;
  onPayment: (playerId: number) => void;
  isRushHour: boolean;
}

export function PersonalArea({
  playerId,
  position,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onSendToShared,
  onPayment,
  isRushHour,
}: PersonalAreaProps) {
  const [showMenu, setShowMenu] = useState(true);
  const [showCart, setShowCart] = useState(false);

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.items.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);

  const getItemQuantity = (dishId: string): number => {
    const item = cart.items.find(item => item.dish.id === dishId);
    return item?.quantity || 0;
  };

  const handleAddDish = (dish: Dish) => {
    onAddToCart(playerId, dish, 1);
  };

  const playerColors = {
    1: 'bg-blue-500',
    2: 'bg-green-500',
    3: 'bg-purple-500',
    4: 'bg-pink-500',
  };

  const playerTextColors = {
    1: 'text-blue-600',
    2: 'text-green-600',
    3: 'text-purple-600',
    4: 'text-pink-600',
  };

  const playerBorderColors = {
    1: 'border-blue-500',
    2: 'border-green-500',
    3: 'border-purple-500',
    4: 'border-pink-500',
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header avec numéro de joueur */}
      <div className={`${playerColors[playerId as keyof typeof playerColors]} text-white p-2 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold" 
               style={{ color: playerColors[playerId as keyof typeof playerColors].replace('bg-', '') }}>
            {playerId}
          </div>
          <span className="text-sm font-semibold">Convive {playerId}</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <ShoppingCart className="w-4 h-4" />
          <span>{totalItems}</span>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Menu - 60% de la largeur */}
        <div className="flex-1 overflow-hidden">
          <MenuView
            deviceType="tablet"
            showSuggestions={false}
            onDishHover={() => {}}
            onDishLeave={() => {}}
            onAddToCart={handleAddDish}
            getItemQuantity={getItemQuantity}
          />
        </div>

        {/* Panier personnel - 40% de la largeur */}
        <div className={`w-2/5 border-l-2 ${playerBorderColors[playerId as keyof typeof playerBorderColors]} bg-neutral-50 flex flex-col`}>
          {/* Header du panier */}
          <div className="p-3 border-b border-neutral-200">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-4 h-4 text-neutral-600" />
              <h3 className="text-sm font-semibold text-neutral-800">Mon Panier</h3>
            </div>
            <div className="text-xs text-neutral-600">
              {totalItems} {totalItems > 1 ? 'articles' : 'article'}
            </div>
          </div>

          {/* Items du panier */}
          <div className="flex-1 overflow-y-auto p-3">
            {cart.items.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2 opacity-20">🍽️</div>
                <p className="text-neutral-400 text-xs">Panier vide</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.items.map((item) => (
                  <div
                    key={item.dish.id}
                    className="bg-white rounded-lg p-2 border border-neutral-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-neutral-900 text-xs font-medium mb-1">
                          {item.dish.name}
                        </div>
                        <div className="text-orange-600 text-xs">
                          {item.dish.price.toFixed(2)}€
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveItem(playerId, item.dish.id)}
                        className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                      >
                        ×
                      </button>
                    </div>

                    {/* Contrôles de quantité */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(playerId, item.dish.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center text-xs"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(playerId, item.dish.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-xs font-semibold text-neutral-700">
                        {(item.dish.price * item.quantity).toFixed(2)}€
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer avec actions */}
          <div className="p-3 border-t border-neutral-200 space-y-2">
            {/* Total */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-neutral-700">Total</span>
              <span className="text-lg font-bold text-orange-600">
                {totalPrice.toFixed(2)}€
              </span>
            </div>

            {/* Bouton envoyer au panier commun */}
            <Button
              onClick={() => onSendToShared(playerId)}
              disabled={cart.items.length === 0}
              className={`w-full ${playerColors[playerId as keyof typeof playerColors]} hover:opacity-90 text-white text-xs py-2 gap-2`}
              variant="default"
            >
              <Send className="w-4 h-4" />
              Envoyer au panier commun
            </Button>

            {/* Bouton payer individuellement */}
            <Button
              onClick={() => onPayment(playerId)}
              disabled={cart.items.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2 gap-2"
              variant="default"
            >
              <CreditCard className="w-4 h-4" />
              Payer ({totalPrice.toFixed(2)}€)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
