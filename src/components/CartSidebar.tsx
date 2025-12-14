import { ShoppingCart, Plus, Minus, Trash2, Users } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useState } from 'react';
import type { Dish } from '../data/dishes';

export interface CartItem {
  dish: Dish;
  quantity: number;
}

interface CartSidebarProps {
  items: CartItem[];
  onUpdateQuantity: (dishId: string, newQuantity: number) => void;
  onRemoveItem: (dishId: string) => void;
  onValidateOrder?: () => void;
}

export function CartSidebar({ items, onUpdateQuantity, onRemoveItem, onValidateOrder }: CartSidebarProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);

  const handleConfirmOrder = () => {
    setShowConfirmDialog(false);
    if (onValidateOrder) {
      onValidateOrder();
    }
  };

  return (
    <div className="w-80 bg-white border-l border-neutral-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 bg-gradient-to-r from-orange-50 to-orange-100">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingCart className="w-5 h-5 text-orange-600" />
          <h3 className="text-orange-900">Commande en cours</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-orange-700">
          <Users className="w-4 h-4" />
          <span>{totalItems} {totalItems > 1 ? 'articles' : 'article'}</span>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-3 opacity-20">🍽️</div>
            <p className="text-neutral-500 text-sm">
              Aucun plat ajouté
            </p>
            <p className="text-neutral-400 text-xs mt-1">
              Commencez votre commande
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const isReward = item.dish.id.startsWith('reward-');
              
              return (
                <div
                  key={item.dish.id}
                  className="bg-neutral-50 rounded-lg p-3 border border-neutral-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-neutral-900 text-sm mb-1">
                        {item.dish.name}
                      </div>
                      <div className={`text-sm ${isReward ? 'text-green-600' : 'text-orange-600'}`}>
                        {isReward ? (
                          <span className="flex items-center gap-1">
                            <span>GRATUIT 🎁</span>
                          </span>
                        ) : (
                          `${item.dish.price.toFixed(2)}€ × ${item.quantity}`
                        )}
                      </div>
                    </div>
                    {!isReward && (
                      <button
                        onClick={() => onRemoveItem(item.dish.id)}
                        className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Quantity Controls - Disabled for rewards */}
                  {!isReward && (
                    <>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateQuantity(item.dish.id, Math.max(0, item.quantity - 1))}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <div className="flex-1 text-center bg-white border border-neutral-200 rounded py-1 text-sm">
                          {item.quantity}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateQuantity(item.dish.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Subtotal */}
                      <div className="mt-2 pt-2 border-t border-neutral-200 flex justify-between text-sm">
                        <span className="text-neutral-600">Sous-total</span>
                        <span className="text-neutral-900">
                          {(item.dish.price * item.quantity).toFixed(2)}€
                        </span>
                      </div>
                    </>
                  )}

                  {/* Reward badge */}
                  {isReward && (
                    <div className="mt-2 pt-2 border-t border-neutral-200">
                      <div className="text-xs text-green-600 text-center italic">
                        ⭐ Cadeau gagné avec tes étoiles
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer - Total */}
      {items.length > 0 && (
        <div className="p-4 border-t border-neutral-200 bg-neutral-50">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Articles ({totalItems})</span>
              <span>{totalPrice.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-900">Total</span>
              <span className="text-orange-600 text-xl">
                {totalPrice.toFixed(2)}€
              </span>
            </div>
          </div>
          <Button
            className="w-full bg-orange-600 hover:bg-orange-700"
            size="lg"
            onClick={() => setShowConfirmDialog(true)}
          >
            Valider la commande
          </Button>
        </div>
      )}

      {/* Confirm Order Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la commande</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment valider cette commande ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleConfirmOrder}
            >
              Valider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}