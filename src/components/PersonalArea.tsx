import { useState } from 'react';
import { MenuView } from './MenuView';
import { OrderConfirmation } from './OrderConfirmation';
import { ImportCartModal } from './ImportCartModal';
import { ShoppingCart, CreditCard, Plus, X, Download } from 'lucide-react';
import { Button } from './ui/button';
import type { CartItem } from './CartSidebar';
import type { Dish } from '../data/dishes';

interface PersonalCart {
  playerId: number;
  items: CartItem[];
}

interface PersonalAreaProps {
  playerId: number;
  cart: PersonalCart;
  dishes: Dish[];
  dishesLoading: boolean;
  showConfirmation: boolean;
  onAddToCart: (playerId: number, dish: Dish, quantity?: number) => void;
  onUpdateQuantity: (playerId: number, dishId: string, newQuantity: number) => void;
  onSendToShared: (playerId: number) => void;
  onPayment: (playerId: number) => void;
  onResetConfirmation: () => void;
}

export function PersonalArea({
  playerId,
  cart,
  dishes,
  dishesLoading,
  showConfirmation,
  onAddToCart,
  onUpdateQuantity,
  onSendToShared,
  onPayment,
  onResetConfirmation,
}: PersonalAreaProps) {
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.items.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);

  const getItemQuantity = (dishId: string): number => {
    const item = cart.items.find(item => item.dish.id === dishId);
    return item?.quantity || 0;
  };

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
  };

  const handleCloseDishDetail = () => {
    setSelectedDish(null);
  };

  const handleAddDish = (dish: Dish) => {
    onAddToCart(playerId, dish, 1);
    setSelectedDish(null);
  };

  const handleImportValidate = (reference: string) => {
    console.log('Import panier avec référence:', reference);
    // Fonction mockée - ne fait rien pour le moment
    setShowImportModal(false);
  };

  const playerColors = {
    1: 'bg-blue-500',
    2: 'bg-green-500',
    3: 'bg-purple-500',
    4: 'bg-pink-500',
  };

  const playerBorderColors = {
    1: 'border-blue-500',
    2: 'border-green-500',
    3: 'border-purple-500',
    4: 'border-pink-500',
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className={`${playerColors[playerId as keyof typeof playerColors]} text-white p-1.5 flex items-center justify-between flex-shrink-0`}>
        <span className="text-xs font-semibold">Convive {playerId}</span>
        <div className="flex items-center gap-1 text-xs">
          <ShoppingCart className="w-3 h-3" />
          {totalItems}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Menu */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 relative">
          {showConfirmation ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden bg-white p-[20%]">
              <div className="w-full h-full flex items-center justify-center" style={{transform: 'scale(0.45)', transformOrigin: 'center'}}>
                <OrderConfirmation
                  onReset={onResetConfirmation}
                  deviceType="tablet"
                />
              </div>
            </div>
          ) : selectedDish ? (
            <div className="absolute inset-0 bg-white z-10 flex flex-col">
              <button onClick={handleCloseDishDetail} className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 z-20">
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="flex-1 overflow-y-auto p-2">
                <img src={selectedDish.imageUrl} alt={selectedDish.name} className="w-full h-32 object-cover rounded mb-2" />
                <h3 className="text-sm font-bold mb-1">{selectedDish.name}</h3>
                <p className="text-[10px] text-gray-600 mb-2">{selectedDish.description}</p>
                <div className="text-xs font-bold text-orange-600 mb-2">{selectedDish.price.toFixed(2)}€</div>
                <div className="text-[9px] text-gray-500 mb-1">Ingrédients: {selectedDish.ingredients.join(', ')}</div>
                <div className="text-[9px] text-gray-500">Temps de préparation: {selectedDish.prepTime} min</div>
              </div>
              <div className="p-2 border-t">
                <Button onClick={() => handleAddDish(selectedDish)} 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 h-auto">
                  <Plus className="w-3 h-3 mr-1" />Ajouter au panier
                </Button>
              </div>
            </div>
          ) : (
            <MenuView 
              deviceType="tablet" 
              showSuggestions={false} 
              onDishHover={() => {}} 
              onDishLeave={() => {}} 
              disableModal={true}
              onAddToCart={handleDishClick} 
              getItemQuantity={getItemQuantity}
              dishes={dishes}
              loading={dishesLoading}
              size="compact"
            />
          )}
        </div>

        {/* Panier personnel */}
        <div className={`w-2/5 border-l-2 ${playerBorderColors[playerId as keyof typeof playerBorderColors]} bg-neutral-50 flex flex-col p-1.5 min-w-0 relative`}>
          <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
            <div className="text-xs font-semibold">Mon Panier</div>
            <button 
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-0.5 text-green-600 hover:text-green-700 transition-colors"
              title="Importer un panier"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-0.5 min-h-0">
            {cart.items.map(item => (
              <div key={item.dish.id} className="bg-white rounded px-1 py-0.5 text-[10px]">
                <div className="font-medium truncate leading-tight">{item.dish.name}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => onUpdateQuantity(playerId, item.dish.id, item.quantity - 1)} className="w-4 h-4 bg-gray-200 rounded text-[9px]">−</button>
                    <span className="w-3 text-center text-[10px]">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(playerId, item.dish.id, item.quantity + 1)} className="w-4 h-4 bg-gray-200 rounded text-[9px]">+</button>
                  </div>
                  <span className="text-[10px]">{(item.dish.price * item.quantity).toFixed(2)}€</span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-1 space-y-0.5 flex-shrink-0">
            <div className="text-[10px]">Total: <span className="font-bold">{totalPrice.toFixed(2)}€</span></div>
            <Button onClick={() => onSendToShared(playerId)} disabled={cart.items.length === 0} 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-[10px] py-0.5 h-auto font-semibold">
              <ShoppingCart className="w-2.5 h-2.5 mr-0.5" />Panier Commun
            </Button>
            <Button onClick={() => onPayment(playerId)} disabled={cart.items.length === 0} 
              className="w-full bg-green-600 text-white text-[10px] py-0.5 h-auto">
              <CreditCard className="w-2.5 h-2.5 mr-0.5" />Payer
            </Button>
          </div>

          {/* Modal d'import */}
          <ImportCartModal 
            open={showImportModal}
            onClose={() => setShowImportModal(false)}
            onValidate={handleImportValidate}
          />
        </div>
      </div>
    </div>
  );
}
