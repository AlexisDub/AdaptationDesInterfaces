import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, ChefHat } from 'lucide-react';
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
import type { CartItem } from './CartSidebar';

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (dishId: string, newQuantity: number) => void;
  onRemoveItem: (dishId: string) => void;
  onBack: () => void;
  onCheckout: () => void;
}

export function CartPage({ items, onUpdateQuantity, onRemoveItem, onBack, onCheckout }: CartPageProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);

  const handleConfirmOrder = () => {
    setShowConfirmDialog(false);
    onCheckout();
  };

  return (
    <div className="h-full bg-gradient-to-br from-orange-50 to-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-orange-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onBack}
            className="hover:bg-neutral-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
            <h2 className="text-orange-900">Mon Panier</h2>
          </div>
        </div>
        <div className="text-sm text-orange-700 ml-10">
          {totalItems} {totalItems > 1 ? 'articles' : 'article'}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-7xl mb-4 opacity-20">🍽️</div>
            <p className="text-neutral-600 mb-2">Votre panier est vide</p>
            <p className="text-neutral-400 text-sm mb-6">
              Ajoutez des plats pour commencer
            </p>
            <Button
              onClick={onBack}
              variant="outline"
              className="border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              Retour au menu
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const isReward = item.dish.id.startsWith('reward-');
              
              return (
                <div
                  key={item.dish.id}
                  className={`bg-white rounded-xl p-4 border shadow-sm ${
                    isReward ? 'border-green-300 bg-green-50/30' : 'border-neutral-200'
                  }`}
                >
                  {/* Dish Info */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.dish.imageUrl}
                        alt={item.dish.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-neutral-900 text-sm line-clamp-2">
                          {item.dish.name}
                        </h4>
                        {!isReward && (
                          <button
                            onClick={() => onRemoveItem(item.dish.id)}
                            className="text-neutral-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className={`text-sm ${isReward ? 'text-green-600' : 'text-orange-600'}`}>
                        {isReward ? (
                          <span className="flex items-center gap-1">
                            <span>GRATUIT 🎁</span>
                          </span>
                        ) : (
                          `${item.dish.price.toFixed(2)}€`
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls - Only for non-rewards */}
                  {!isReward ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateQuantity(item.dish.id, Math.max(0, item.quantity - 1))}
                          className="h-9 w-9 p-0 border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="flex-1 text-center bg-orange-50 border border-orange-200 rounded py-2 text-sm text-orange-600">
                          {item.quantity}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateQuantity(item.dish.id, item.quantity + 1)}
                          className="h-9 w-9 p-0 border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Subtotal */}
                      <div className="pt-3 border-t border-neutral-200 flex justify-between text-sm">
                        <span className="text-neutral-600">Sous-total</span>
                        <span className="text-neutral-900">
                          {(item.dish.price * item.quantity).toFixed(2)}€
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="pt-3 border-t border-green-200">
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

      {/* Footer - Total & Validate */}
      {items.length > 0 && (
        <div className="p-4 border-t border-neutral-200 bg-white flex-shrink-0 space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Articles ({totalItems})</span>
              <span>{totalPrice.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-900">Total</span>
              <span className="text-orange-600 text-2xl">
                {totalPrice.toFixed(2)}€
              </span>
            </div>
          </div>
          <Button
            className="w-full bg-orange-600 hover:bg-orange-700 h-12"
            size="lg"
            onClick={() => setShowConfirmDialog(true)}
          >
            <ChefHat className="w-5 h-5 mr-2" />
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
              Voulez-vous vraiment passer cette commande ?
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
            <Button type="button" onClick={handleConfirmOrder}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}