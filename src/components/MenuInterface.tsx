import { useState, useEffect } from 'react';
import { MenuView } from './MenuView';
import { RushHourMode } from './RushHourMode';
import { ChildMode } from './ChildMode';
import { CartSidebar, type CartItem } from './CartSidebar';
import { CartPage } from './CartPage';
import { OrderConfirmation } from './OrderConfirmation';
import { Button } from './ui/button';
import { Clock, ArrowLeft, ShoppingCart } from 'lucide-react';
import { dishes, type Dish } from '../data/dishes';
import type { UserMode } from '../App';
import { addPrepTime } from '../data/rushService';

interface MenuInterfaceProps {
  deviceType: 'tablet' | 'smartphone';
  isRushHour: boolean;
  userMode: UserMode;
  tableNumber: number;
  onResetMode: () => void;
}

export type ViewMode = 'normal' | 'rush' | 'child' | 'cart' | 'order-confirmation';

export function MenuInterface({ deviceType, isRushHour, userMode, tableNumber, onResetMode }: MenuInterfaceProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(userMode === 'child' ? 'child' : 'normal');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showRushBanner, setShowRushBanner] = useState(true);

  // Update viewMode when userMode changes
  useEffect(() => {
    setViewMode(userMode === 'child' ? 'child' : 'normal');
  }, [userMode]);

  const handleAddToCart = (dish: Dish, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.dish.id === dish.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { dish, quantity }];
    });
  };

  const handleUpdateQuantity = (dishId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(dishId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.dish.id === dishId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const handleRemoveItem = (dishId: string) => {
    setCart(prevCart => prevCart.filter(item => item.dish.id !== dishId));
  };

  const getItemQuantity = (dishId: string): number => {
    const item = cart.find(item => item.dish.id === dishId);
    return item?.quantity || 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleActivateRushMode = () => {
    setShowRushBanner(false);
    setViewMode('rush');
  };

  const handleValidateOrder = () => {
    // Calculer le temps total de préparation de la commande
    const totalPrepTime = cart.reduce((sum, item) => {
      const itemTime = item.dish.prepTime * item.quantity;
      console.log(`[Validation] ${item.dish.name} x${item.quantity}: ${item.dish.prepTime}min x ${item.quantity} = ${itemTime}min`);
      return sum + itemTime;
    }, 0);
    
    console.log(`[Validation] Temps total de cette commande: ${totalPrepTime}min`);
    
    // Calculer le prix total et préparer les données de commande
    const totalPrice = cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);
    
    // Préparer les données de commande au format backend
    const orderData = {
      orderId: `ORDER-${Date.now()}`,
      timestamp: new Date().toISOString(),
      tableNumber: tableNumber, // Numéro de table
      deviceType: deviceType,
      userMode: userMode || 'normal',
      items: cart.map(item => ({
        dishId: item.dish.id,
        quantity: item.quantity,
        price: item.dish.price,
        isReward: item.dish.id.startsWith('reward-')
      })),
      totalPrice: totalPrice,
      totalItems: totalItems,
      estimatedPrepTime: totalPrepTime
    };
    
    // Log pour debug - À envoyer au backend via POST /api/orders
    console.log('[Validation] Données de commande à envoyer au backend:', JSON.stringify(orderData, null, 2));
    
    // TODO: Remplacer par un vrai appel API
    // fetch('/api/orders', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(orderData)
    // });
    
    // Ajouter ce temps au compteur cumulé pour la simulation du mode Rush
    if (totalPrepTime > 0) {
      addPrepTime(totalPrepTime);
    }
    
    setViewMode('order-confirmation');
  };

  const handleBackToMenu = () => {
    setCart([]);
    setViewMode('normal');
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-orange-50 to-white overflow-hidden">
      {/* Header */}
      <div className={`border-b border-orange-200 bg-white/80 backdrop-blur-sm flex-shrink-0 ${
        deviceType === 'smartphone' ? 'p-2' : 'p-4'
      }`}>
        <div className={`flex items-center justify-between ${
          deviceType === 'smartphone' ? 'mb-1' : 'mb-3'
        }`}>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={onResetMode}
              className="hover:bg-neutral-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className={`text-orange-900 ${
                deviceType === 'smartphone' ? 'text-base' : ''
              }`}>Restaurant Le Gourmet</h2>
            </div>
          </div>
          
          {/* Cart Button - Only on smartphone and not in cart/confirmation views */}
          {deviceType === 'smartphone' && viewMode !== 'cart' && viewMode !== 'order-confirmation' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewMode('cart')}
              className="flex items-center gap-2 border-orange-300 text-orange-600 hover:bg-orange-50 relative"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          ) : (
            <div className="text-sm text-neutral-600">
              Panier: {totalItems} {totalItems > 1 ? 'articles' : 'article'}
            </div>
          )}
        </div>

        {/* Mode Selection - Only show in Rush mode to allow going back */}
        {userMode === 'normal' && viewMode === 'rush' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setViewMode('normal');
              setShowRushBanner(true);
            }}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Retour au menu normal
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto relative">
          {viewMode === 'normal' && (
            <>
              {/* Rush Hour Banner - Only show if rush hour and banner not dismissed */}
              {isRushHour && showRushBanner && userMode === 'normal' && (
                <div className={`sticky top-0 z-10 mx-4 mt-4 ${deviceType === 'smartphone' ? 'mb-2' : ''}`}>
                  <div className={`bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg border-2 border-orange-600 ${
                    deviceType === 'smartphone' ? 'p-2' : 'p-4'
                  }`}>
                    {deviceType === 'smartphone' ? (
                      // Compact smartphone version - single line
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs truncate">⚠️ Temps d'attente élevé</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-white text-orange-600 hover:bg-orange-50 border-none shadow-md text-xs px-2 py-1 h-auto flex-shrink-0"
                          onClick={handleActivateRushMode}
                        >
                          Mode Rush
                        </Button>
                      </div>
                    ) : (
                      // Tablet version - full layout
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="bg-white/20 p-2 rounded-full">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span>⚠️</span>
                              <span>Temps d'attente élevé</span>
                            </div>
                            <p className="text-sm text-white/90">
                              Nous sommes en heure de pointe. Optez pour notre service rapide !
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-white text-orange-600 hover:bg-orange-50 border-none shadow-md whitespace-nowrap"
                          onClick={handleActivateRushMode}
                        >
                          Je souhaite manger rapidement
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <MenuView
                deviceType={deviceType}
                showSuggestions={false}
                onDishHover={() => {}}
                onDishLeave={() => {}}
                onAddToCart={handleAddToCart}
                getItemQuantity={getItemQuantity}
              />
            </>
          )}
          {viewMode === 'rush' && (
            <RushHourMode
              deviceType={deviceType}
              onAddToCart={(dish) => handleAddToCart(dish, 1)}
              getItemQuantity={getItemQuantity}
            />
          )}
          {viewMode === 'child' && (
            <ChildMode
              deviceType={deviceType}
              onAddToCart={(dish) => handleAddToCart(dish, 1)}
              cart={cart}
              onBackToMenu={() => setViewMode('normal')}
            />
          )}
          {viewMode === 'cart' && (
            <CartPage
              items={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onBack={() => setViewMode('normal')}
              onCheckout={handleValidateOrder}
            />
          )}
          {viewMode === 'order-confirmation' && (
            <OrderConfirmation
              onReset={handleBackToMenu}
              deviceType={deviceType}
            />
          )}
        </div>

        {/* Cart Sidebar - Only show on tablet in normal or rush mode */}
        {deviceType === 'tablet' && (viewMode === 'normal' || viewMode === 'rush') && (
          <CartSidebar
            items={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onValidateOrder={handleValidateOrder}
          />
        )}
      </div>
    </div>
  );
}