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
    <div className="h-full flex flex-col">
      {showConfirmation ? (
        <div className="flex-1 bg-green-600 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="mb-3">
              <svg className="w-20 h-20 mx-auto text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-black mb-2 text-white drop-shadow-md">COMMANDE VALIDÉE</h2>
          </div>
        </div>
      ) : (
        <div className="h-full bg-white rounded-xl border-4 border-orange-500 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-orange-500 text-white p-1.5 text-center flex-shrink-0">
            <h2 className="text-sm font-bold">PANIER COMMUN</h2>
            <div className="text-[10px]">{totalItems} articles</div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-1.5 min-h-0">
            {groupedItems.length === 0 ? (
              <div className="text-center py-2 text-neutral-400 text-xs">Panier vide</div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {groupedItems.map((item) => (
                  <div
                    key={item.dishId}
                    className="bg-orange-50 rounded p-1 border border-orange-200 flex-shrink-0"
                  >
                    <div className="font-semibold text-[10px] truncate max-w-[120px] mb-0.5">{item.name}</div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateQuantity(item.dishId, item.quantity - 1)}
                        className="w-4 h-4 bg-orange-200 rounded flex items-center justify-center text-[9px]"
                      >
                        −
                      </button>
                      <span className="font-bold text-[10px] min-w-[12px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.dishId, item.quantity + 1)}
                        className="w-4 h-4 bg-orange-200 rounded flex items-center justify-center text-[9px]"
                      >
                        +
                      </button>
                      <span className="font-bold text-[10px] ml-1">{(item.price * item.quantity).toFixed(2)}€</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t-4 border-orange-500 bg-white p-1.5 flex items-center justify-center gap-2 flex-shrink-0">
            <div className="text-sm font-bold text-orange-600">
              {totalPrice.toFixed(2)}€
            </div>
            <Button
              onClick={onPayment}
              disabled={sharedCart.length === 0}
              className="bg-green-600 text-white px-3 py-1 text-xs font-bold h-auto"
            >
              <CreditCard className="w-3 h-3 mr-1" />PAYER
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
