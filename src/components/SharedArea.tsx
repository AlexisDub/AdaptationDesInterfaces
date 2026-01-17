import { ShoppingCart, Plus, Minus, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import type { CartItem } from './CartSidebar';

interface SharedCartItem extends CartItem {
  fromPlayer?: number;
}

interface SharedAreaProps {
  sharedCart: SharedCartItem[];
  onUpdateQuantity: (dishId: string, newQuantity: number) => void;
  onPayment: () => void;
}

export function SharedArea({ sharedCart, onUpdateQuantity, onPayment }: SharedAreaProps) {
  const totalItems = sharedCart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = sharedCart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);

  // Grouper les plats identiques
  const groupedItems = sharedCart.reduce((acc, item) => {
    const existing = acc.find(i => i.dish.id === item.dish.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, [] as SharedCartItem[]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3">
        <div className="flex items-center justify-center gap-2 mb-1">
          <ShoppingCart className="w-5 h-5" />
          <h2 className="text-xl font-bold">PANIER COMMUN</h2>
          <ShoppingCart className="w-5 h-5" />
        </div>
        <div className="text-center text-xs opacity-90">
          {totalItems} {totalItems > 1 ? 'articles' : 'article'} • Table partagée
        </div>
      </div>

      {/* Zone de contenu */}
      <div className="flex-1 overflow-y-auto p-3">
        {sharedCart.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-2 opacity-20">🍽️</div>
            <p className="text-neutral-500 text-sm">
              Panier commun vide
            </p>
            <p className="text-neutral-400 text-xs mt-1">
              Envoyez vos plats ici pour commander ensemble
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {groupedItems.map((item) => (
              <div
                key={item.dish.id}
                className="bg-orange-50 rounded-lg p-3 border-2 border-orange-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-neutral-900 font-semibold text-sm mb-1">
                      {item.dish.name}
                    </div>
                    <div className="text-orange-600 font-medium text-xs">
                      {item.dish.price.toFixed(2)}€ / unité
                    </div>
                  </div>
                </div>

                {/* Contrôles de quantité */}
                <div className="flex items-center justify-between bg-white rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.dish.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-orange-200 hover:bg-orange-300 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-bold w-10 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.dish.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-orange-200 hover:bg-orange-300 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-base font-bold text-orange-600">
                    {(item.dish.price * item.quantity).toFixed(2)}€
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer avec total et bouton de paiement */}
      <div className="border-t-4 border-orange-500 bg-white p-4">
        <div className="flex items-center justify-center gap-8">
          <div className="text-left">
            <div className="text-xs text-neutral-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-orange-600">
              {totalPrice.toFixed(2)}€
            </div>
          </div>
          
          <Button
            onClick={onPayment}
            disabled={sharedCart.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-xl font-bold gap-3 rounded-xl"
            variant="default"
          >
            <CreditCard className="w-6 h-6" />
            PAYER
          </Button>
        </div>
      </div>
    </div>
  );
}
