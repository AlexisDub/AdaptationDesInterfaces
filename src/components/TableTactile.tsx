import { useState, useEffect } from 'react';
import { PersonalArea } from './PersonalArea';
import { SharedArea } from './SharedArea';
import type { CartItem } from './CartSidebar';
import type { Dish } from '../data/dishes';
import { addPrepTime } from '../data/rushService';
import { submitOrderToBackend } from '../services/orderService';

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
  dishes: Dish[];
  dishesLoading: boolean;
}

export function TableTactile({ tableNumber, isRushHour, dishes, dishesLoading }: TableTactileProps) {
  console.log('🔴🔴🔴 TableTactile loaded WITH BACKEND INTEGRATION! 🔴🔴🔴', { tableNumber, isRushHour });
  console.log('🍽️ [TableTactile] Dishes received:', dishes.length, 'dishes');
  
  // Log visible au montage du composant
  useEffect(() => {
    console.log('🟢🟢🟢 [TableTactile.tsx] COMPONENT MOUNTED - This component IS being used! 🟢🟢🟢');
    return () => {
      console.log('🔴🔴🔴 [TableTactile.tsx] COMPONENT UNMOUNTED');
    };
  }, []);
  
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

  // État pour les confirmations par joueur
  const [playerConfirmations, setPlayerConfirmations] = useState<{ [key: number]: boolean }>({
    1: false,
    2: false,
    3: false,
    4: false
  });

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
  const handlePersonalPayment = async (playerId: number) => {
    console.log('🔴🔴🔴 [TableTactile] PERSONAL PAYMENT CLICKED! 🔴🔴🔴', { playerId });
    const personalCart = personalCarts.find(cart => cart.playerId === playerId);
    if (!personalCart || personalCart.items.length === 0) return;

    // Validation: tableNumber ne doit pas être null
    if (tableNumber === null) {
      console.error('❌ [TableTactile] Impossible de soumettre: tableNumber est null. Ajoutez ?idtable=X à l\'URL');
      alert('Erreur: Numéro de table manquant. Veuillez ajouter ?idtable=X à l\'URL');
      return;
    }

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

    // Soumettre la commande au backend
    const result = await submitOrderToBackend(tableNumber, personalCart.items, 1);
    if (result.success) {
      console.log(`✅ [Joueur ${playerId}] Commande envoyée au backend:`, result.orderId);
    } else {
      console.error(`❌ [Joueur ${playerId}] Erreur soumission:`, result.error);
    }

    // Vider le panier personnel
    setPersonalCarts(prevCarts =>
      prevCarts.map(cart =>
        cart.playerId === playerId
          ? { ...cart, items: [] }
          : cart
      )
    );

    // Afficher la confirmation dans la zone personnelle
    setPlayerConfirmations(prev => ({ ...prev, [playerId]: true }));

    console.log(`[Paiement individuel] Joueur ${playerId}:`, orderData);
  };

  // Paiement groupé de la commande commune
  const handleSharedPayment = async () => {
    console.log('🔴🔴🔴 [TableTactile] SHARED PAYMENT CLICKED! 🔴🔴🔴', { sharedCartLength: sharedCart.length });
    
    if (sharedCart.length === 0) return;

    // Validation: tableNumber ne doit pas être null
    if (tableNumber === null) {
      console.error('❌ [TableTactile] Impossible de soumettre: tableNumber est null. Ajoutez ?idtable=X à l\'URL');
      alert('Erreur: Numéro de table manquant. Veuillez ajouter ?idtable=X à l\'URL');
      return;
    }

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

    console.log('[TableTactile] Avant soumission backend, orderData:', orderData);

    // Soumettre la commande au backend
    const result = await submitOrderToBackend(tableNumber, sharedCart, 4);
    if (result.success) {
      console.log('✅ [Commande groupée] Envoyée au backend:', result.orderId);
    } else {
      console.error('❌ [Commande groupée] Erreur soumission:', result.error);
    }

    // Vider le panier commun
    setSharedCart([]);

    // Afficher la confirmation
    setConfirmedOrderData(orderData);
    setOrderConfirmed(true);

    console.log('[Paiement groupé]:', orderData);

    // Auto-dismiss après 3 secondes
    setTimeout(() => {
      setOrderConfirmed(false);
      setConfirmedOrderData(null);
    }, 3000);
  };

  const handleSendToShared = (playerId: number) => {
    handleSendToSharedCart(playerId);
  };

  // Convert sharedCart to format expected by SharedArea component
  const sharedCartForComponent = sharedCart.map(item => ({
    dishId: item.dish.id,
    name: item.dish.name,
    price: item.dish.price,
    quantity: item.quantity,
    fromPlayer: item.fromPlayer,
  }));

  return (
    <div className="fixed inset-0 bg-neutral-200 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-neutral-100 shadow-2xl rounded-2xl w-full h-full max-w-[1600px] max-h-[900px] flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
            
          {/* LIGNE DU HAUT - 40% - Players 1-2 (Rotated) */}
          <div className="flex gap-2 overflow-hidden" style={{height: '40%'}}>
            {[1, 2].map(playerId => {
              const cart = personalCarts[playerId - 1];
              
              return (
                <div key={playerId} className="flex-1 overflow-hidden" style={{transform: 'rotate(180deg)'}}>
                  <PersonalArea
                    playerId={playerId}
                    cart={cart}
                    dishes={dishes}
                    dishesLoading={dishesLoading}
                    showConfirmation={playerConfirmations[playerId] || false}
                    onAddToCart={handleAddToPersonalCart}
                    onUpdateQuantity={handleUpdatePersonalQuantity}
                    onSendToShared={handleSendToShared}
                    onPayment={handlePersonalPayment}
                    onResetConfirmation={() => setPlayerConfirmations(prev => ({ ...prev, [playerId]: false }))}
                  />
                </div>
              );
            })}
          </div>

          {/* PANIER COMMUN - 20% */}
          <div className="flex gap-2 overflow-hidden" style={{height: '20%'}}>
            {/* LEFT SIDE - Rotated for top players */}
            <div className="flex-1" style={{transform: 'rotate(180deg)'}}>
              <SharedArea
                sharedCart={sharedCartForComponent}
                showConfirmation={orderConfirmed}
                onUpdateQuantity={handleUpdateSharedQuantity}
                onPayment={handleSharedPayment}
              />
            </div>

            {/* RIGHT SIDE - Normal for bottom players */}
            <div className="flex-1">
              <SharedArea
                sharedCart={sharedCartForComponent}
                showConfirmation={orderConfirmed}
                onUpdateQuantity={handleUpdateSharedQuantity}
                onPayment={handleSharedPayment}
              />
            </div>
          </div>

          {/* LIGNE DU BAS - 40% - Players 3-4 (Normal) */}
          <div className="flex gap-2 overflow-hidden" style={{height: '40%'}}>
            {[3, 4].map(playerId => {
              const cart = personalCarts[playerId - 1];
              
              return (
                <div key={playerId} className="flex-1 overflow-hidden">
                  <PersonalArea
                    playerId={playerId}
                    cart={cart}
                    dishes={dishes}
                    dishesLoading={dishesLoading}
                    showConfirmation={playerConfirmations[playerId] || false}
                    onAddToCart={handleAddToPersonalCart}
                    onUpdateQuantity={handleUpdatePersonalQuantity}
                    onSendToShared={handleSendToShared}
                    onPayment={handlePersonalPayment}
                    onResetConfirmation={() => setPlayerConfirmations(prev => ({ ...prev, [playerId]: false }))}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

