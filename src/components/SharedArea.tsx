import { ShoppingCart, CreditCard, Check } from 'lucide-react';
import { Button } from './ui/button';

interface SharedCartItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  fromPlayer?: number;
}

interface SharedAreaProps {
  sharedCart: SharedCartItem[];
  showConfirmation: boolean;
  onUpdateQuantity: (dishId: string, newQuantity: number) => void;
  onPayment: () => void;
}

export function SharedArea({
  sharedCart,
  showConfirmation,
  onUpdateQuantity,
  onPayment,
}: SharedAreaProps) {
  const totalPrice = sharedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = sharedCart.reduce((sum, item) => sum + item.quantity, 0);

  // Grouper les plats identiques
  const groupedItems = sharedCart.reduce((acc, item) => {
    const existing = acc.find(i => i.dishId === item.dishId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, [] as SharedCartItem[]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-orange-50 to-orange-100">
      {showConfirmation ? (
        <div className="flex-1 bg-green-500 flex flex-col items-center justify-center">
          <div className="bg-white rounded-full p-3 mb-2">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <div className="text-white text-base font-bold">COMMANDE VALIDÉE ✓</div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-1.5 flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-bold">PANIER COMMUN</span>
            <div className="flex items-center gap-1">
              <ShoppingCart className="w-3 h-3" />
              <span className="text-xs">{totalItems}</span>
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-1.5 min-h-0">
            {groupedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-orange-400">
                <ShoppingCart className="w-6 h-6 mb-1 opacity-40" />
                <p className="text-[9px]">Panier commun vide</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {groupedItems.map((item) => (
                  <div
                    key={item.dishId}
                    className="bg-orange-50 rounded px-1.5 py-0.5 border border-orange-200 flex-shrink-0"
                  >
                    <div className="text-[10px] font-medium mb-0.5 leading-tight">{item.name}</div>
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.dishId, item.quantity - 1)}
                          className="w-4 h-4 rounded bg-orange-200 hover:bg-orange-300 flex items-center justify-center text-[9px]"
                        >
                          −
                        </button>
                        <span className="w-3 text-center text-[10px] font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.dishId, item.quantity + 1)}
                          className="w-4 h-4 rounded bg-orange-200 hover:bg-orange-300 flex items-center justify-center text-[9px]"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[10px] font-bold text-orange-600">
                        {(item.price * item.quantity).toFixed(2)}€
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-white border-t-2 border-orange-300 p-1.5 flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-bold text-gray-700">Total: {totalPrice.toFixed(2)}€</span>
            <Button
              onClick={onPayment}
              disabled={sharedCart.length === 0}
              className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] px-2 py-0.5 h-auto"
            >
              <CreditCard className="w-2.5 h-2.5 mr-0.5" />
              PAYER
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
