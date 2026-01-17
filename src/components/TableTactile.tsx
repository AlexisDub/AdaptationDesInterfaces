import { useState } from 'react';
import { MenuView } from './MenuView';
import { OrderConfirmation } from './OrderConfirmation';
import { ShoppingCart, CreditCard, Send, Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import type { CartItem } from './CartSidebar';
import type { Dish } from '../data/dishes';
import { addPrepTime } from '../data/rushService';

// Type pour représenter le panier d'un convive
interface PersonalCart {
  playerId: number;
  items: CartItem[];
}

// Type pour les plats dans le panier commun
interface SharedCartItem extends CartItem {
  fromPlayer?: number; // Pour savoir qui a ajouté le plat
}

interface TableTactileProps {
  tableNumber: number;
  isRushHour: boolean;
}

export function TableTactile({ tableNumber, isRushHour }: TableTactileProps) {
  console.log('TableTactile loaded!', { tableNumber, isRushHour });
  
  // État pour les 4 paniers personnels
  const [personalCarts, setPersonalCarts] = useState<PersonalCart[]>([
    { playerId: 1, items: [] },
    { playerId: 2, items: [] },
    { playerId: 3, items: [] },
    { playerId: 4, items: [] },
  ]);

  // Panier commun partagé
  const [sharedCart, setSharedCart] = useState<SharedCartItem[]>([]);

  // État de confirmation de commande
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderData, setConfirmedOrderData] = useState<any>(null);

  // Ajouter un plat au panier personnel
  const handleAddToPersonalCart = (playerId: number, dish: Dish, quantity: number = 1) => {
    setPersonalCarts(prevCarts =>
      prevCarts.map(cart => {
        if (cart.playerId === playerId) {
          const existingItem = cart.items.find(item => item.dish.id === dish.id);
          if (existingItem) {
            return {
              ...cart,
              items: cart.items.map(item =>
                item.dish.id === dish.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return {
            ...cart,
            items: [...cart.items, { dish, quantity }],
          };
        }
        return cart;
      })
    );
  };

  // Mettre à jour la quantité dans un panier personnel
  const handleUpdatePersonalQuantity = (playerId: number, dishId: string, newQuantity: number) => {
    setPersonalCarts(prevCarts =>
      prevCarts.map(cart => {
        if (cart.playerId === playerId) {
          if (newQuantity <= 0) {
            return {
              ...cart,
              items: cart.items.filter(item => item.dish.id !== dishId),
            };
          }
          return {
            ...cart,
            items: cart.items.map(item =>
              item.dish.id === dishId
                ? { ...item, quantity: newQuantity }
                : item
            ),
          };
        }
        return cart;
      })
    );
  };

  // Retirer un item d'un panier personnel
  const handleRemoveFromPersonalCart = (playerId: number, dishId: string) => {
    setPersonalCarts(prevCarts =>
      prevCarts.map(cart => {
        if (cart.playerId === playerId) {
          return {
            ...cart,
            items: cart.items.filter(item => item.dish.id !== dishId),
          };
        }
        return cart;
      })
    );
  };

  // Envoyer le panier personnel vers le panier commun
  const handleSendToSharedCart = (playerId: number) => {
    const personalCart = personalCarts.find(cart => cart.playerId === playerId);
    if (!personalCart || personalCart.items.length === 0) return;

    setSharedCart(prevShared => {
      const newShared = [...prevShared];
      
      personalCart.items.forEach(personalItem => {
        const existingIndex = newShared.findIndex(
          item => item.dish.id === personalItem.dish.id
        );
        
        if (existingIndex >= 0) {
          // Si le plat existe déjà dans le panier commun, augmenter la quantité
          newShared[existingIndex] = {
            ...newShared[existingIndex],
            quantity: newShared[existingIndex].quantity + personalItem.quantity,
          };
        } else {
          // Sinon, ajouter le plat au panier commun
          newShared.push({
            ...personalItem,
            fromPlayer: playerId,
          });
        }
      });
      
      return newShared;
    });

    // Vider le panier personnel après l'envoi
    setPersonalCarts(prevCarts =>
      prevCarts.map(cart =>
        cart.playerId === playerId
          ? { ...cart, items: [] }
          : cart
      )
    );
  };

  // Mettre à jour la quantité dans le panier commun
  const handleUpdateSharedQuantity = (dishId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSharedCart(prevShared => prevShared.filter(item => item.dish.id !== dishId));
    } else {
      setSharedCart(prevShared =>
        prevShared.map(item =>
          item.dish.id === dishId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  // Paiement individuel d'un convive
  const handlePersonalPayment = (playerId: number) => {
    const personalCart = personalCarts.find(cart => cart.playerId === playerId);
    if (!personalCart || personalCart.items.length === 0) return;

    // Calculer le temps de préparation
    const totalPrepTime = personalCart.items.reduce((sum, item) => {
      return sum + (item.dish.prepTime * item.quantity);
    }, 0);

    // Ajouter le temps de préparation au système
    addPrepTime(totalPrepTime);

    const totalPrice = personalCart.items.reduce(
      (sum, item) => sum + (item.dish.price * item.quantity),
      0
    );

    const orderData = {
      orderId: `TABLE-${tableNumber}-P${playerId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      tableNumber: tableNumber,
      deviceType: 'table-tactile' as const,
      playerId: playerId,
      userMode: 'normal' as const,
      items: personalCart.items.map(item => ({
        dishId: item.dish.id,
        quantity: item.quantity,
        price: item.dish.price,
        name: item.dish.name,
      })),
      totalPrice: totalPrice,
      totalPrepTime: totalPrepTime,
    };

    // Vider le panier personnel
    setPersonalCarts(prevCarts =>
      prevCarts.map(cart =>
        cart.playerId === playerId
          ? { ...cart, items: [] }
          : cart
      )
    );

    // Afficher la confirmation
    setConfirmedOrderData(orderData);
    setOrderConfirmed(true);

    console.log(`[Paiement individuel] Joueur ${playerId}:`, orderData);
  };

  // Paiement groupé de la commande commune
  const handleSharedPayment = () => {
    if (sharedCart.length === 0) return;

    // Calculer le temps de préparation
    const totalPrepTime = sharedCart.reduce((sum, item) => {
      return sum + (item.dish.prepTime * item.quantity);
    }, 0);

    // Ajouter le temps de préparation au système
    addPrepTime(totalPrepTime);

    const totalPrice = sharedCart.reduce(
      (sum, item) => sum + (item.dish.price * item.quantity),
      0
    );

    const orderData = {
      orderId: `TABLE-${tableNumber}-SHARED-${Date.now()}`,
      timestamp: new Date().toISOString(),
      tableNumber: tableNumber,
      deviceType: 'table-tactile' as const,
      userMode: 'normal' as const,
      items: sharedCart.map(item => ({
        dishId: item.dish.id,
        quantity: item.quantity,
        price: item.dish.price,
        name: item.dish.name,
      })),
      totalPrice: totalPrice,
      totalPrepTime: totalPrepTime,
    };

    // Vider le panier commun
    setSharedCart([]);

    // Afficher la confirmation
    setConfirmedOrderData(orderData);
    setOrderConfirmed(true);

    console.log('[Paiement groupé]:', orderData);
  };

  // Revenir de la page de confirmation
  const handleBackToTable = () => {
    setOrderConfirmed(false);
    setConfirmedOrderData(null);
  };

  // Fonction pour rendre une zone personnelle
  const renderPersonalArea = (playerId: number, isRotated: boolean) => {
    const cart = personalCarts.find(c => c.playerId === playerId)!;
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);

    const getItemQuantity = (dishId: string): number => {
      const item = cart.items.find(item => item.dish.id === dishId);
      return item?.quantity || 0;
    };

    const handleAddDish = (dish: Dish) => {
      handleAddToPersonalCart(playerId, dish, 1);
    };

    const playerColors = { 1: 'bg-blue-500', 2: 'bg-green-500', 3: 'bg-purple-500', 4: 'bg-pink-500' };
    const playerBorderColors = { 1: 'border-blue-500', 2: 'border-green-500', 3: 'border-purple-500', 4: 'border-pink-500' };

    const content = (
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className={`${playerColors[playerId as keyof typeof playerColors]} text-white p-2 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-800">
              {playerId}
            </div>
            <span className="text-sm font-semibold">Convive {playerId}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <ShoppingCart className="w-4 h-4" />
            <span>{totalItems}</span>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 flex overflow-hidden">
          {/* Menu */}
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

          {/* Panier personnel */}
          <div className={`w-2/5 border-l-2 ${playerBorderColors[playerId as keyof typeof playerBorderColors]} bg-neutral-50 flex flex-col`}>
            <div className="p-2 border-b border-neutral-200">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart className="w-4 h-4 text-neutral-600" />
                <h3 className="text-xs font-semibold text-neutral-800">Mon Panier</h3>
              </div>
              <div className="text-xs text-neutral-600">{totalItems} {totalItems > 1 ? 'articles' : 'article'}</div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {cart.items.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-2xl mb-1 opacity-20">🍽️</div>
                  <p className="text-neutral-400 text-xs">Panier vide</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.items.map((item) => (
                    <div key={item.dish.id} className="bg-white rounded-lg p-2 border border-neutral-200">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <div className="text-neutral-900 text-xs font-medium">{item.dish.name}</div>
                          <div className="text-orange-600 text-xs">{item.dish.price.toFixed(2)}€</div>
                        </div>
                        <button onClick={() => handleRemoveFromPersonalCart(playerId, item.dish.id)} className="text-neutral-400 hover:text-red-500 text-sm">×</button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleUpdatePersonalQuantity(playerId, item.dish.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-neutral-200 hover:bg-neutral-300 text-xs">−</button>
                          <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => handleUpdatePersonalQuantity(playerId, item.dish.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-neutral-200 hover:bg-neutral-300 text-xs">+</button>
                        </div>
                        <div className="text-xs font-semibold text-neutral-700">{(item.dish.price * item.quantity).toFixed(2)}€</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-2 border-t border-neutral-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-neutral-700">Total</span>
                <span className="text-base font-bold text-orange-600">{totalPrice.toFixed(2)}€</span>
              </div>
              <Button onClick={() => handleSendToSharedCart(playerId)} disabled={cart.items.length === 0} className={`w-full ${playerColors[playerId as keyof typeof playerColors]} hover:opacity-90 text-white text-xs py-1`}>
                <Send className="w-3 h-3 mr-1" />Envoyer
              </Button>
              <Button onClick={() => handlePersonalPayment(playerId)} disabled={cart.items.length === 0} className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1">
                <CreditCard className="w-3 h-3 mr-1" />Payer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );

    return isRotated ? <div className="h-full rotate-180">{content}</div> : content;
  };

  // Fonction pour rendre le panier commun
  const renderSharedArea = () => {
    const totalItems = sharedCart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = sharedCart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);
    const groupedItems = sharedCart.reduce((acc, item) => {
      const existing = acc.find(i => i.dish.id === item.dish.id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, [] as typeof sharedCart);

    return (
      <div className="h-full flex flex-col">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShoppingCart className="w-4 h-4" />
            <h2 className="text-lg font-bold">PANIER COMMUN</h2>
          </div>
          <div className="text-center text-xs opacity-90">{totalItems} {totalItems > 1 ? 'articles' : 'article'}</div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sharedCart.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2 opacity-20">🍽️</div>
              <p className="text-neutral-500 text-xs">Panier commun vide</p>
            </div>
          ) : (
            <div className="space-y-2">
              {groupedItems.map((item) => (
                <div key={item.dish.id} className="bg-orange-50 rounded-lg p-2 border-2 border-orange-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-neutral-900 font-semibold text-sm">{item.dish.name}</div>
                      <div className="text-orange-600 font-medium text-xs">{item.dish.price.toFixed(2)}€ / unité</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleUpdateSharedQuantity(item.dish.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-orange-200 hover:bg-orange-300">
                        <Minus className="w-4 h-4 mx-auto" />
                      </button>
                      <span className="text-base font-bold w-8 text-center">{item.quantity}</span>
                      <button onClick={() => handleUpdateSharedQuantity(item.dish.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-orange-200 hover:bg-orange-300">
                        <Plus className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                    <div className="text-sm font-bold text-orange-600">{(item.dish.price * item.quantity).toFixed(2)}€</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t-4 border-orange-500 bg-white p-3">
          <div className="flex items-center justify-center gap-6">
            <div className="text-left">
              <div className="text-xs text-neutral-600">Total</div>
              <div className="text-xl font-bold text-orange-600">{totalPrice.toFixed(2)}€</div>
            </div>
            <Button onClick={handleSharedPayment} disabled={sharedCart.length === 0} className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 text-lg font-bold rounded-xl">
              <CreditCard className="w-5 h-5 mr-2" />PAYER
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Si une commande est confirmée, afficher la page de confirmation
  if (orderConfirmed && confirmedOrderData) {
    return (
      <OrderConfirmation
        onReset={handleBackToTable}
        deviceType="tablet"
      />
    );
  }

  console.log('About to render TableTactile layout');

  return (
    <div className="h-screen w-screen bg-neutral-200 flex items-center justify-center p-8">
      {/* Cadre rectangulaire fixe type tablette */}
      <div className="bg-neutral-100 shadow-2xl w-full h-full max-w-[1600px] max-h-[900px] rounded-2xl overflow-hidden relative">
        {/* Layout : zones perso autour du panier commun au centre */}
        <div className="absolute inset-0 flex flex-col p-3 gap-3">
          
          {/* LIGNE DU HAUT - Zones personnelles 1 et 2 (retournées) */}
          <div className="flex gap-3 h-[30%]">
            <div className="flex-1 bg-blue-200 rounded-lg flex items-center justify-center">
              <div className="rotate-180 font-bold">Zone 1 retournée</div>
            </div>
            <div className="flex-1 bg-green-200 rounded-lg flex items-center justify-center">
              <div className="rotate-180 font-bold">Zone 2 retournée</div>
            </div>
          </div>

          {/* PANIER COMMUN AU CENTRE */}
          <div className="flex-1 bg-orange-400 rounded-xl shadow-lg border-4 border-orange-500 flex items-center justify-center">
            <div className="text-2xl font-bold text-white">PANIER COMMUN</div>
          </div>

          {/* LIGNE DU BAS - Zones personnelles 3 et 4 (à l'endroit) */}
          <div className="flex gap-3 h-[30%]">
            <div className="flex-1 bg-purple-200 rounded-lg flex items-center justify-center">
              <div className="font-bold">Zone 3</div>
            </div>
            <div className="flex-1 bg-pink-200 rounded-lg flex items-center justify-center">
              <div className="font-bold">Zone 4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
