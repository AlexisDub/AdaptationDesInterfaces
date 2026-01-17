import { useState, useEffect } from 'react';
import { MenuInterface } from './components/MenuInterface';
import { ModeSelectionScreen } from './components/ModeSelectionScreen';
import { TableSelectionScreen } from './components/TableSelectionScreen';
import { MenuView } from './components/MenuView';
import { OrderConfirmation } from './components/OrderConfirmation';
import { ShoppingCart, CreditCard, Send, Plus, Minus, X } from 'lucide-react';
import { Button } from './components/ui/button';
import type { CartItem } from './components/CartSidebar';
import type { Dish } from './data/dishes';
import { getRushStatus, RUSH_CHECK_INTERVAL, getCurrentPrepTime, addPrepTime } from './data/rushService';

export type UserMode = 'normal' | 'child' | null;

export default function App() {
  // Lire les paramètres URL
  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get('mode');
  const tableParam = urlParams.get('idtable');
  
  // Detect if running as PWA (standalone mode)
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                (window.navigator as any).standalone === true;
  
  // Déterminer le type de dispositif basé sur l'URL
  // Par défaut : table tactile
  // ?mode=tablet : tablette
  // ?mode=phone : smartphone
  const [deviceType] = useState<'table-tactile' | 'tablet' | 'smartphone'>(
    modeParam === 'phone' ? 'smartphone' : 
    modeParam === 'tablet' ? 'tablet' : 
    'table-tactile'
  );
  
  // Lock orientation for tablet PWA in landscape
  useEffect(() => {
    if (isPWA && deviceType === 'tablet' && screen.orientation && (screen.orientation as any).lock) {
      (screen.orientation as any).lock('landscape').catch((err: any) => {
        console.log('Orientation lock not supported:', err);
      });
    }
  }, [isPWA, deviceType]);
  
  const [userMode, setUserMode] = useState<UserMode>(null);
  const [tableNumber, setTableNumber] = useState<number | null>(
    deviceType === 'smartphone' && tableParam ? parseInt(tableParam) : null
  );
  const [isRushMode, setIsRushMode] = useState(false);
  const [ordersInProgress, setOrdersInProgress] = useState(0);
  const [currentPrepTime, setCurrentPrepTime] = useState(0);

  // États pour la table tactile
  const [personalCarts, setPersonalCarts] = useState([
    { playerId: 1, items: [] as CartItem[] },
    { playerId: 2, items: [] as CartItem[] },
    { playerId: 3, items: [] as CartItem[] },
    { playerId: 4, items: [] as CartItem[] },
  ]);
  const [sharedCart, setSharedCart] = useState<CartItem[]>([]);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState<{[playerId: number]: Dish | null}>({
    1: null,
    2: null,
    3: null,
    4: null
  });

  // Vérifier le statut Rush toutes les 10 secondes
  useEffect(() => {
    // Fonction pour vérifier le statut
    const checkRushStatus = async () => {
      try {
        const status = await getRushStatus();
        setIsRushMode(status.isRushMode);
        setOrdersInProgress(status.ordersInProgress);
        setCurrentPrepTime(getCurrentPrepTime());
        
        // Log pour debug (à retirer en production)
        console.log(`[Rush Check] Temps cumulé: ${getCurrentPrepTime()} min, Commandes simulées: ${status.ordersInProgress}, Mode Rush: ${status.isRushMode ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
      } catch (error) {
        console.error('Erreur lors de la vérification du mode Rush:', error);
      }
    };

    // Vérifier immédiatement au chargement
    checkRushStatus();

    // Puis vérifier toutes les 10 secondes
    const interval = setInterval(checkRushStatus, RUSH_CHECK_INTERVAL);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  // Reset to mode selection
  const handleResetMode = () => {
    setUserMode(null);
  };

  // Handle table selection
  const handleTableSelection = (table: number) => {
    setTableNumber(table);
  };

  // Reset to table selection (only for tablet)
  const handleResetToTableSelection = () => {
    setTableNumber(null);
    setUserMode(null);
  };

  // Fonctions pour la table tactile
  const handleDishClick = (playerId: number, dish: Dish) => {
    setSelectedDishes(prev => ({ ...prev, [playerId]: dish }));
  };

  const handleCloseDishDetail = (playerId: number) => {
    setSelectedDishes(prev => ({ ...prev, [playerId]: null }));
  };

  const handleAddToPersonalCart = (playerId: number, dish: Dish) => {
    setPersonalCarts(prev => prev.map(cart => {
      if (cart.playerId === playerId) {
        const existing = cart.items.find(item => item.dish.id === dish.id);
        if (existing) {
          return { ...cart, items: cart.items.map(item => item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item) };
        }
        return { ...cart, items: [...cart.items, { dish, quantity: 1 }] };
      }
      return cart;
    }));
  };

  const handleUpdatePersonalQuantity = (playerId: number, dishId: string, newQuantity: number) => {
    setPersonalCarts(prev => prev.map(cart => {
      if (cart.playerId === playerId) {
        if (newQuantity <= 0) {
          return { ...cart, items: cart.items.filter(item => item.dish.id !== dishId) };
        }
        return { ...cart, items: cart.items.map(item => item.dish.id === dishId ? { ...item, quantity: newQuantity } : item) };
      }
      return cart;
    }));
  };

  const handleSendToShared = (playerId: number) => {
    const cart = personalCarts.find(c => c.playerId === playerId);
    if (!cart || cart.items.length === 0) return;
    
    setSharedCart(prev => {
      const newShared = [...prev];
      cart.items.forEach(item => {
        const existing = newShared.find(i => i.dish.id === item.dish.id);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          newShared.push({ ...item });
        }
      });
      return newShared;
    });
    
    setPersonalCarts(prev => prev.map(c => c.playerId === playerId ? { ...c, items: [] } : c));
  };

  const handlePersonalPayment = (playerId: number) => {
    const cart = personalCarts.find(c => c.playerId === playerId);
    if (!cart || cart.items.length === 0) return;
    
    const totalPrepTime = cart.items.reduce((sum, item) => sum + (item.dish.prepTime * item.quantity), 0);
    addPrepTime(totalPrepTime);
    setPersonalCarts(prev => prev.map(c => c.playerId === playerId ? { ...c, items: [] } : c));
    setOrderConfirmed(true);
    setTimeout(() => setOrderConfirmed(false), 3000);
  };

  const handleSharedPayment = () => {
    if (sharedCart.length === 0) return;
    const totalPrepTime = sharedCart.reduce((sum, item) => sum + (item.dish.prepTime * item.quantity), 0);
    addPrepTime(totalPrepTime);
    setSharedCart([]);
    setOrderConfirmed(true);
    setTimeout(() => setOrderConfirmed(false), 3000);
  };

  const handleUpdateSharedQuantity = (dishId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSharedCart(prev => prev.filter(item => item.dish.id !== dishId));
    } else {
      setSharedCart(prev => prev.map(item => item.dish.id === dishId ? { ...item, quantity: newQuantity } : item));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Table Tactile - Mode par défaut */}
      {deviceType === 'table-tactile' ? (
        orderConfirmed ? (
          <OrderConfirmation onReset={() => setOrderConfirmed(false)} deviceType="tablet" />
        ) : (
          <div className="fixed inset-0 bg-neutral-200 flex items-center justify-center p-4 overflow-hidden">
            <div className="bg-neutral-100 shadow-2xl rounded-2xl w-full h-full max-w-[1600px] max-h-[900px] flex flex-col overflow-hidden">
              <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
                
                {/* LIGNE DU HAUT - 40% */}
                <div className="flex gap-2 overflow-hidden" style={{height: '40%'}}>
                  {[1, 2].map(playerId => {
                    const cart = personalCarts[playerId - 1];
                    const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);
                    const totalPrice = cart.items.reduce((s, i) => s + (i.dish.price * i.quantity), 0);
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
                    const borders = ['border-blue-500', 'border-green-500', 'border-purple-500', 'border-pink-500'];
                    const selectedDish = selectedDishes[playerId];
                    
                    return (
                      <div key={playerId} className="flex-1 bg-white rounded-lg overflow-hidden min-w-0" style={{transform: 'rotate(180deg)'}}>
                        <div className="h-full flex flex-col min-h-0">
                          <div className={`${colors[playerId-1]} text-white p-1.5 flex items-center justify-between flex-shrink-0`}>
                            <span className="text-xs font-semibold">Convive {playerId}</span>
                            <div className="flex items-center gap-1 text-xs"><ShoppingCart className="w-3 h-3" />{totalItems}</div>
                          </div>
                          <div className="flex-1 flex overflow-hidden min-h-0">
                            <div className="flex-1 overflow-y-auto min-w-0 relative">
                              {selectedDish ? (
                                <div className="absolute inset-0 bg-white z-10 flex flex-col">
                                    <button onClick={() => handleCloseDishDetail(playerId)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 z-20">
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
                                    <Button onClick={() => { handleAddToPersonalCart(playerId, selectedDish); handleCloseDishDetail(playerId); }} 
                                      className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 h-auto">
                                      <Plus className="w-3 h-3 mr-1" />Ajouter au panier
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <MenuView deviceType="tablet" showSuggestions={false} onDishHover={() => {}} onDishLeave={() => {}} 
                                  disableModal={true}
                                  onAddToCart={(dish) => handleDishClick(playerId, dish)} 
                                  getItemQuantity={(dishId) => cart.items.find(i => i.dish.id === dishId)?.quantity || 0} />
                              )}
                            </div>
                            <div className={`w-2/5 border-l-2 ${borders[playerId-1]} bg-neutral-50 flex flex-col p-1.5 min-w-0`}>
                                <div className="text-xs font-semibold mb-1.5 flex-shrink-0">Mon Panier</div>
                                <div className="flex-1 overflow-y-auto space-y-0.5 min-h-0">
                                  {cart.items.map(item => (
                                    <div key={item.dish.id} className="bg-white rounded px-1 py-0.5 text-[10px]">
                                      <div className="font-medium truncate leading-tight">{item.dish.name}</div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-0.5">
                                          <button onClick={() => handleUpdatePersonalQuantity(playerId, item.dish.id, item.quantity - 1)} className="w-4 h-4 bg-gray-200 rounded text-[9px]">−</button>
                                          <span className="w-3 text-center text-[10px]">{item.quantity}</span>
                                          <button onClick={() => handleUpdatePersonalQuantity(playerId, item.dish.id, item.quantity + 1)} className="w-4 h-4 bg-gray-200 rounded text-[9px]">+</button>
                                        </div>
                                        <span className="text-[10px]">{(item.dish.price * item.quantity).toFixed(2)}€</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="pt-1 space-y-0.5 flex-shrink-0">
                                  <div className="text-[10px]">Total: <span className="font-bold">{totalPrice.toFixed(2)}€</span></div>
                                  <Button onClick={() => handleSendToShared(playerId)} disabled={cart.items.length === 0} 
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-[10px] py-0.5 h-auto font-semibold"><ShoppingCart className="w-2.5 h-2.5 mr-0.5" />Panier Commun</Button>
                                  <Button onClick={() => handlePersonalPayment(playerId)} disabled={cart.items.length === 0} 
                                    className="w-full bg-green-600 text-white text-[10px] py-0.5 h-auto"><CreditCard className="w-2.5 h-2.5 mr-0.5" />Payer</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                    );
                  })}
                </div>

                {/* PANIER COMMUN - 20% */}
                <div className="flex gap-2 overflow-hidden" style={{height: '20%'}}>
                  {/* PARTIE GAUCHE - Pour joueurs du haut (retournée) */}
                  <div className="flex-1 bg-white rounded-xl border-4 border-orange-500 flex flex-col overflow-hidden" style={{transform: 'rotate(180deg)'}}>
                    <div className="bg-orange-500 text-white p-1.5 text-center flex-shrink-0">
                      <h2 className="text-sm font-bold">PANIER COMMUN</h2>
                      <div className="text-[10px]">{sharedCart.reduce((s, i) => s + i.quantity, 0)} articles</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 min-h-0">
                      {sharedCart.length === 0 ? (
                        <div className="text-center py-2 text-neutral-400 text-xs">Panier vide</div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {sharedCart.map(item => (
                            <div key={item.dish.id} className="bg-orange-50 rounded p-1 border border-orange-200 flex-shrink-0">
                              <div className="font-semibold text-[10px] truncate max-w-[120px] mb-0.5">{item.dish.name}</div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleUpdateSharedQuantity(item.dish.id, item.quantity - 1)} 
                                  className="w-4 h-4 bg-orange-200 rounded flex items-center justify-center"><Minus className="w-2 h-2" /></button>
                                <span className="font-bold text-[10px] min-w-[12px] text-center">{item.quantity}</span>
                                <button onClick={() => handleUpdateSharedQuantity(item.dish.id, item.quantity + 1)} 
                                  className="w-4 h-4 bg-orange-200 rounded flex items-center justify-center"><Plus className="w-2 h-2" /></button>
                                <span className="font-bold text-[10px] ml-1">{(item.dish.price * item.quantity).toFixed(2)}€</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="border-t-4 border-orange-500 bg-white p-1.5 flex items-center justify-center gap-2 flex-shrink-0">
                      <div className="text-sm font-bold text-orange-600">
                        {sharedCart.reduce((s, i) => s + (i.dish.price * i.quantity), 0).toFixed(2)}€
                      </div>
                      <Button onClick={handleSharedPayment} disabled={sharedCart.length === 0} 
                        className="bg-green-600 text-white px-3 py-1 text-xs font-bold h-auto"><CreditCard className="w-3 h-3 mr-1" />PAYER</Button>
                    </div>
                  </div>

                  {/* PARTIE DROITE - Pour joueurs du bas (normale) */}
                  <div className="flex-1 bg-white rounded-xl border-4 border-orange-500 flex flex-col overflow-hidden">
                    <div className="bg-orange-500 text-white p-1.5 text-center flex-shrink-0">
                      <h2 className="text-sm font-bold">PANIER COMMUN</h2>
                      <div className="text-[10px]">{sharedCart.reduce((s, i) => s + i.quantity, 0)} articles</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 min-h-0">
                      {sharedCart.length === 0 ? (
                        <div className="text-center py-2 text-neutral-400 text-xs">Panier vide</div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {sharedCart.map(item => (
                            <div key={item.dish.id} className="bg-orange-50 rounded p-1 border border-orange-200 flex-shrink-0">
                              <div className="font-semibold text-[10px] truncate max-w-[120px] mb-0.5">{item.dish.name}</div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleUpdateSharedQuantity(item.dish.id, item.quantity - 1)} 
                                  className="w-4 h-4 bg-orange-200 rounded flex items-center justify-center"><Minus className="w-2 h-2" /></button>
                                <span className="font-bold text-[10px] min-w-[12px] text-center">{item.quantity}</span>
                                <button onClick={() => handleUpdateSharedQuantity(item.dish.id, item.quantity + 1)} 
                                  className="w-4 h-4 bg-orange-200 rounded flex items-center justify-center"><Plus className="w-2 h-2" /></button>
                                <span className="font-bold text-[10px] ml-1">{(item.dish.price * item.quantity).toFixed(2)}€</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="border-t-4 border-orange-500 bg-white p-1.5 flex items-center justify-center gap-2 flex-shrink-0">
                      <div className="text-sm font-bold text-orange-600">
                        {sharedCart.reduce((s, i) => s + (i.dish.price * i.quantity), 0).toFixed(2)}€
                      </div>
                      <Button onClick={handleSharedPayment} disabled={sharedCart.length === 0} 
                        className="bg-green-600 text-white px-3 py-1 text-xs font-bold h-auto"><CreditCard className="w-3 h-3 mr-1" />PAYER</Button>
                    </div>
                  </div>
                </div>

                {/* LIGNE DU BAS - 40% */}
                <div className="flex gap-2 overflow-hidden" style={{height: '40%'}}>
                  {[3, 4].map(playerId => {
                    const cart = personalCarts[playerId - 1];
                    const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);
                    const totalPrice = cart.items.reduce((s, i) => s + (i.dish.price * i.quantity), 0);
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
                    const borders = ['border-blue-500', 'border-green-500', 'border-purple-500', 'border-pink-500'];
                    const selectedDish = selectedDishes[playerId];
                    
                    return (
                      <div key={playerId} className="flex-1 bg-white rounded-lg overflow-hidden min-w-0">
                        <div className="h-full flex flex-col min-h-0">
                          <div className={`${colors[playerId-1]} text-white p-1.5 flex items-center justify-between flex-shrink-0`}>
                            <span className="text-xs font-semibold">Convive {playerId}</span>
                            <div className="flex items-center gap-1 text-xs"><ShoppingCart className="w-3 h-3" />{totalItems}</div>
                          </div>
                          <div className="flex-1 flex overflow-hidden min-h-0">
                            <div className="flex-1 overflow-y-auto min-w-0 relative">
                              {selectedDish ? (
                                <div className="absolute inset-0 bg-white z-10 flex flex-col">
                                  <button onClick={() => handleCloseDishDetail(playerId)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 z-20">
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
                                    <Button onClick={() => { handleAddToPersonalCart(playerId, selectedDish); handleCloseDishDetail(playerId); }} 
                                      className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 h-auto">
                                      <Plus className="w-3 h-3 mr-1" />Ajouter au panier
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <MenuView deviceType="tablet" showSuggestions={false} onDishHover={() => {}} onDishLeave={() => {}} 
                                  disableModal={true}
                                  onAddToCart={(dish) => handleDishClick(playerId, dish)} 
                                  getItemQuantity={(dishId) => cart.items.find(i => i.dish.id === dishId)?.quantity || 0} />
                              )}
                            </div>
                            <div className={`w-2/5 border-l-2 ${borders[playerId-1]} bg-neutral-50 flex flex-col p-1.5 min-w-0`}>
                              <div className="text-xs font-semibold mb-1.5 flex-shrink-0">Mon Panier</div>
                              <div className="flex-1 overflow-y-auto space-y-0.5 min-h-0">
                                {cart.items.map(item => (
                                  <div key={item.dish.id} className="bg-white rounded px-1 py-0.5 text-[10px]">
                                    <div className="font-medium truncate leading-tight">{item.dish.name}</div>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-0.5">
                                        <button onClick={() => handleUpdatePersonalQuantity(playerId, item.dish.id, item.quantity - 1)} className="w-4 h-4 bg-gray-200 rounded text-[9px]">−</button>
                                        <span className="w-3 text-center text-[10px]">{item.quantity}</span>
                                        <button onClick={() => handleUpdatePersonalQuantity(playerId, item.dish.id, item.quantity + 1)} className="w-4 h-4 bg-gray-200 rounded text-[9px]">+</button>
                                      </div>
                                      <span className="text-[10px]">{(item.dish.price * item.quantity).toFixed(2)}€</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="pt-1 space-y-0.5 flex-shrink-0">
                                <div className="text-[10px]">Total: <span className="font-bold">{totalPrice.toFixed(2)}€</span></div>
                                <Button onClick={() => handleSendToShared(playerId)} disabled={cart.items.length === 0} 
                                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-[10px] py-0.5 h-auto font-semibold"><ShoppingCart className="w-2.5 h-2.5 mr-0.5" />Panier Commun</Button>
                                <Button onClick={() => handlePersonalPayment(playerId)} disabled={cart.items.length === 0} 
                                  className="w-full bg-green-600 text-white text-[10px] py-0.5 h-auto"><CreditCard className="w-2.5 h-2.5 mr-0.5" />Payer</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <>
          {/* Device Display pour Tablette et Smartphone */}
          {isPWA || deviceType === 'smartphone' ? (
            // Mode PWA ou téléphone : Conteneur plein écran avec dimensions viewport
            <div className="fixed inset-0 bg-white overflow-hidden">
              <div className="h-full w-full">
                {/* Show table selection first for tablet, skip for smartphone */}
                {deviceType === 'tablet' && tableNumber === null ? (
                  <TableSelectionScreen onSelectTable={handleTableSelection} />
                ) : !userMode ? (
                  <ModeSelectionScreen 
                    onSelectMode={setUserMode}
                    deviceType={deviceType}
                  />
                ) : (
                  <MenuInterface 
                    deviceType={deviceType} 
                    isRushHour={isRushMode}
                    userMode={userMode}
                    tableNumber={tableNumber!}
                    onResetMode={handleResetMode}
                  />
                )}
              </div>
            </div>
          ) : (
            // Mode tablette dans navigateur : Simulation centrée
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white shadow-2xl transition-all duration-500 w-full max-w-6xl aspect-[4/3] rounded-2xl">
                {/* Show table selection first for tablet, skip for smartphone */}
                {deviceType === 'tablet' && tableNumber === null ? (
                  <TableSelectionScreen onSelectTable={handleTableSelection} />
                ) : !userMode ? (
                  <ModeSelectionScreen 
                    onSelectMode={setUserMode}
                    deviceType={deviceType}
                  />
                ) : (
                  <MenuInterface 
                    deviceType={deviceType} 
                    isRushHour={isRushMode}
                    userMode={userMode}
                    tableNumber={tableNumber!}
                    onResetMode={handleResetMode}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}