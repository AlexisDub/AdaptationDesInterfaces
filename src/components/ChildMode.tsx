import { useState } from 'react';
import { type Dish } from '../data/dishes';
import { 
  childRewards, 
  childModeConfig, 
  getKidFriendlyDishesByCategory,
  rewardToDish 
} from '../data/dataLoader';
import { Button } from './ui/button';
import { ChefHat, Star, Sparkles, Trophy, Crown, Gift, Zap, ShoppingCart, ArrowLeft, Home, X, Trash2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';

interface ChildModeProps {
  deviceType: 'tablet' | 'smartphone';
  onAddToCart: (dish: Dish) => void;
  cart: Array<{ dish: Dish; quantity: number }>;
  onBackToMenu?: () => void;
}

type MissionStep = 'welcome' | 'entrée' | 'plat' | 'dessert' | 'complete' | 'cart' | 'rewards';

interface PlateState {
  entrée: Dish | null;
  plat: Dish | null;
  dessert: Dish | null;
}

// Import rewards and messages from data loader
const rewards = childRewards;
const chefLeoMessages = childModeConfig.chefLeoMessages;
const encouragements = childModeConfig.encouragements;

const STARS_PER_CATEGORY = {
  entrée: 2,
  plat: 4,
  dessert: 2
};

export function ChildMode({ deviceType, onAddToCart, cart, onBackToMenu }: ChildModeProps) {
  const [missionStep, setMissionStep] = useState<MissionStep>('welcome');
  const [plate, setPlate] = useState<PlateState>({
    entrée: null,
    plat: null,
    dessert: null,
  });
  const [stars, setStars] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [selectedRewards, setSelectedRewards] = useState<typeof rewards>([]);

  // Filtrer les plats selon la catégorie actuelle
  const getCurrentCategoryDishes = () => {
    if (missionStep === 'entrée') {
      return getKidFriendlyDishesByCategory('entrée').slice(0, 6);
    } else if (missionStep === 'plat') {
      return getKidFriendlyDishesByCategory('plat').slice(0, 6);
    } else if (missionStep === 'dessert') {
      return getKidFriendlyDishesByCategory('dessert').slice(0, 6);
    }
    return [];
  };

  const handleDishSelect = (dish: Dish) => {
    const category = missionStep as 'entrée' | 'plat' | 'dessert';
    
    // Mettre à jour le plat sur l'assiette
    setPlate(prev => ({ ...prev, [category]: dish }));
    
    // Ajouter les étoiles selon la catégorie
    const earnedStars = STARS_PER_CATEGORY[category];
    setStars(prev => prev + earnedStars);
    
    // Confettis !
    triggerConfetti();
    
    // Passer à l'étape suivante après une petite pause
    setTimeout(() => {
      if (missionStep === 'entrée') {
        setMissionStep('plat');
      } else if (missionStep === 'plat') {
        setMissionStep('dessert');
      } else if (missionStep === 'dessert') {
        setMissionStep('complete');
      }
    }, 1500);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleFlipCard = (dishId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dishId)) {
        newSet.delete(dishId);
      } else {
        newSet.add(dishId);
      }
      return newSet;
    });
  };

  const handleSkipCategory = () => {
    if (missionStep === 'entrée') {
      setMissionStep('plat');
    } else if (missionStep === 'plat') {
      setMissionStep('dessert');
    } else if (missionStep === 'dessert') {
      setMissionStep('complete');
    }
  };

  const handleGoBack = () => {
    if (missionStep === 'plat') {
      setMissionStep('entrée');
    } else if (missionStep === 'dessert') {
      setMissionStep('plat');
    } else if (missionStep === 'complete') {
      setMissionStep('dessert');
    } else if (missionStep === 'cart') {
      setMissionStep('complete');
    } else if (missionStep === 'rewards') {
      setMissionStep('cart');
    }
  };

  const handleRemovePlateItem = (category: 'entrée' | 'plat' | 'dessert') => {
    const removedDish = plate[category];
    if (removedDish) {
      // Retirer les étoiles correspondantes
      const lostStars = STARS_PER_CATEGORY[category];
      setStars(prev => prev - lostStars);
      
      // Retirer le plat
      setPlate(prev => ({ ...prev, [category]: null }));
    }
  };

  const handleRestart = () => {
    setMissionStep('welcome');
    setPlate({ entrée: null, plat: null, dessert: null });
    setFlippedCards(new Set());
    setStars(0);
    setSelectedRewards([]);
  };

  const handleGoToCart = () => {
    setMissionStep('cart');
  };

  const handleGoToRewards = () => {
    setMissionStep('rewards');
  };

  const handleSelectReward = (reward: typeof rewards[0]) => {
    const totalSelectedStars = selectedRewards.reduce((sum, r) => sum + r.stars, 0);
    
    // Si on essaie de sélectionner mais pas assez d'étoiles
    if (totalSelectedStars + reward.stars > stars) {
      return; // Pas assez d'étoiles
    }
    
    setSelectedRewards(prev => [...prev, reward]);
  };

  const handleRemoveReward = (index: number) => {
    setSelectedRewards(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalValidation = () => {
    // Ajouter tous les plats au panier
    if (plate.entrée) onAddToCart(plate.entrée);
    if (plate.plat) onAddToCart(plate.plat);
    if (plate.dessert) onAddToCart(plate.dessert);
    
    // Ajouter les récompenses au panier (gratuites !)
    selectedRewards.forEach(reward => {
      const rewardDish = rewardToDish(reward);
      onAddToCart(rewardDish);
    });
    
    // Retour au menu principal si la fonction existe
    if (onBackToMenu) {
      onBackToMenu();
    }
  };

  // Écran de bienvenue
  if (missionStep === 'welcome') {
    return (
      <div className="min-h-full flex items-center justify-center p-6 bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 relative overflow-hidden">
        {/* Étoiles animées en arrière-plan */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
                y: -50,
                rotate: 0,
                opacity: 0.7
              }}
              animate={{ 
                y: (typeof window !== 'undefined' ? window.innerHeight : 600) + 50,
                rotate: 360
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            >
              {['⭐', '✨', '🌟'][Math.floor(Math.random() * 3)]}
            </motion.div>
          ))}
        </div>

        <div className="text-center max-w-lg relative z-10">
          {/* Chef Léo animé */}
          <motion.div
            className="mb-6 relative"
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="text-9xl">🦁</div>
            <div className="absolute top-0 right-1/2 translate-x-1/2 text-5xl">👨‍🍳</div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <h1 className="text-neutral-900 mb-4 flex items-center justify-center gap-3">
              <ChefHat className="w-8 h-8 text-orange-600" />
              Mission Chef Junior
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </h1>
          </motion.div>

          <motion.p
            className="text-neutral-700 mb-6 text-lg bg-white/80 backdrop-blur-sm rounded-2xl p-4 border-3 border-orange-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {chefLeoMessages.welcome}
          </motion.p>

          <motion.div
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-4 mb-6 inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6" />
              <div className="text-left">
                <div className="text-sm opacity-90">Tes étoiles</div>
                <div className="text-2xl flex items-center gap-1">
                  {stars} <Star className="w-5 h-5 fill-yellow-300" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 border-2 border-purple-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-sm text-purple-900 mb-2">Gagne des étoiles :</div>
            <div className="flex justify-center gap-2 text-xs">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">Entrée: 2⭐</span>
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Plat: 4⭐</span>
              <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full">Dessert: 2⭐</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring", bounce: 0.6 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl text-xl px-8 py-6"
              onClick={() => setMissionStep('entrée')}
            >
              C'est parti ! 🚀
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Écran de complétion
  if (missionStep === 'complete') {
    const hasAnyDish = plate.entrée || plate.plat || plate.dessert;
    
    return (
      <div className="min-h-full flex items-center justify-center p-6 bg-gradient-to-br from-green-100 via-yellow-100 to-orange-100 relative overflow-hidden">
        {/* Super confettis */}
        <AnimatePresence>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-3xl"
                initial={{ 
                  x: (typeof window !== 'undefined' ? window.innerWidth : 800) / 2,
                  y: (typeof window !== 'undefined' ? window.innerHeight : 600) / 2,
                  rotate: 0,
                  scale: 0
                }}
                animate={{ 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
                  rotate: 360,
                  scale: 1
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1,
                  ease: "easeOut"
                }}
              >
                {['🎉', '🎊', '⭐', '🌟', '✨', '🏆', '👑'][Math.floor(Math.random() * 7)]}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        <div className="text-center max-w-2xl relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="mb-6"
          >
            <div className="text-9xl mb-4">🏆</div>
            <h1 className="text-neutral-900 mb-4">BRAVO CHAMPION !</h1>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl p-6 mb-6 shadow-2xl border-4 border-yellow-400"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-yellow-500" />
              <h2 className="text-purple-900">Ton Menu Parfait</h2>
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>

            {hasAnyDish ? (
              <div className={`grid gap-4 ${deviceType === 'tablet' ? 'grid-cols-3' : 'grid-cols-1'}`}>
                {plate.entrée && (
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4 border-2 border-green-400 relative">
                    <button
                      onClick={() => handleRemovePlateItem('entrée')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="text-xs text-green-700 mb-2 flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3" /> Entrée (+2⭐)
                    </div>
                    <ImageWithFallback
                      src={plate.entrée.imageUrl}
                      alt={plate.entrée.name}
                      className="w-full aspect-square object-cover rounded-xl mb-2"
                    />
                    <div className="text-sm text-neutral-900">{plate.entrée.name}</div>
                  </div>
                )}
                {plate.plat && (
                  <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-4 border-2 border-orange-400 relative">
                    <button
                      onClick={() => handleRemovePlateItem('plat')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="text-xs text-orange-700 mb-2 flex items-center justify-center gap-1">
                      <Zap className="w-3 h-3" /> Plat Principal (+4⭐)
                    </div>
                    <ImageWithFallback
                      src={plate.plat.imageUrl}
                      alt={plate.plat.name}
                      className="w-full aspect-square object-cover rounded-xl mb-2"
                    />
                    <div className="text-sm text-neutral-900">{plate.plat.name}</div>
                  </div>
                )}
                {plate.dessert && (
                  <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-4 border-2 border-pink-400 relative">
                    <button
                      onClick={() => handleRemovePlateItem('dessert')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="text-xs text-pink-700 mb-2 flex items-center justify-center gap-1">
                      <Gift className="w-3 h-3" /> Dessert (+2⭐)
                    </div>
                    <ImageWithFallback
                      src={plate.dessert.imageUrl}
                      alt={plate.dessert.name}
                      className="w-full aspect-square object-cover rounded-xl mb-2"
                    />
                    <div className="text-sm text-neutral-900">{plate.dessert.name}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🤔</div>
                <p className="text-neutral-600 mb-4">Oups ! Tu n'as choisi aucun plat.</p>
                <Button
                  onClick={() => setMissionStep('entrée')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Choisir des plats
                </Button>
              </div>
            )}

            {hasAnyDish && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Star className="w-6 h-6 fill-yellow-400 stroke-yellow-500" />
                <span className="text-2xl text-purple-600">Tu as {stars} étoiles !</span>
                <Star className="w-6 h-6 fill-yellow-400 stroke-yellow-500" />
              </div>
            )}
          </motion.div>

          {hasAnyDish && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="space-y-3"
            >
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-2xl text-xl px-8 py-6"
                onClick={handleGoToCart}
              >
                Voir mon panier ! 🛒
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-purple-300 text-purple-600 hover:bg-purple-100"
                onClick={handleGoBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Modifier mes choix
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Écran du panier
  if (missionStep === 'cart') {
    return (
      <div className="min-h-full p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="max-w-2xl mx-auto">
          {/* En-tête */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 border-3 border-purple-300 shadow-xl">
              <div className="flex items-center gap-3">
                <motion.div
                  className="text-5xl"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🦁👨‍🍳
                </motion.div>
                <div className="flex-1">
                  <div className="text-sm text-purple-600 mb-1">Chef Léo te dit :</div>
                  <div className="text-neutral-900 text-sm">{chefLeoMessages.cart}</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl px-4 py-2">
                  <div className="text-xs opacity-90">Étoiles</div>
                  <div className="text-xl flex items-center gap-1">
                    {stars} <Star className="w-4 h-4 fill-yellow-300" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Panier */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 mb-6 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
              <h2 className="text-purple-900">Mon Panier</h2>
            </div>

            <div className="space-y-3">
              {plate.entrée && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border-2 border-green-200 relative">
                  <button
                    onClick={() => handleRemovePlateItem('entrée')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                    title="Retirer ce plat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <ImageWithFallback
                    src={plate.entrée.imageUrl}
                    alt={plate.entrée.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-neutral-900">{plate.entrée.name}</div>
                    <div className="text-xs text-green-600">Entrée · {plate.entrée.price.toFixed(2)}€</div>
                  </div>
                  <div className="text-green-600 flex items-center gap-1">
                    +2 <Star className="w-3 h-3 fill-green-600" />
                  </div>
                </div>
              )}
              {plate.plat && (
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border-2 border-orange-200 relative">
                  <button
                    onClick={() => handleRemovePlateItem('plat')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                    title="Retirer ce plat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <ImageWithFallback
                    src={plate.plat.imageUrl}
                    alt={plate.plat.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-neutral-900">{plate.plat.name}</div>
                    <div className="text-xs text-orange-600">Plat · {plate.plat.price.toFixed(2)}€</div>
                  </div>
                  <div className="text-orange-600 flex items-center gap-1">
                    +4 <Star className="w-3 h-3 fill-orange-600" />
                  </div>
                </div>
              )}
              {plate.dessert && (
                <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl border-2 border-pink-200 relative">
                  <button
                    onClick={() => handleRemovePlateItem('dessert')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                    title="Retirer ce plat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <ImageWithFallback
                    src={plate.dessert.imageUrl}
                    alt={plate.dessert.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-neutral-900">{plate.dessert.name}</div>
                    <div className="text-xs text-pink-600">Dessert · {plate.dessert.price.toFixed(2)}€</div>
                  </div>
                  <div className="text-pink-600 flex items-center gap-1">
                    +2 <Star className="w-3 h-3 fill-pink-600" />
                  </div>
                </div>
              )}

              {!plate.entrée && !plate.plat && !plate.dessert && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p className="text-neutral-600 mb-4">Ton panier est vide !</p>
                  <Button
                    onClick={() => setMissionStep('entrée')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    Choisir des plats
                  </Button>
                </div>
              )}
            </div>

            {(plate.entrée || plate.plat || plate.dessert) && (
              <div className="mt-4 pt-4 border-t-2 border-neutral-200">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-700">Total</span>
                  <span className="text-xl text-neutral-900">
                    {((plate.entrée?.price || 0) + (plate.plat?.price || 0) + (plate.dessert?.price || 0)).toFixed(2)}€
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Bouton pour choisir les récompenses */}
          {(plate.entrée || plate.plat || plate.dessert) && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="space-y-3"
            >
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-2xl text-xl px-8 py-6"
                onClick={handleGoToRewards}
              >
                Choisir mes cadeaux ! 🎁 ({stars}⭐)
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-purple-300 text-purple-600 hover:bg-purple-100 text-xl px-8 py-6"
                onClick={handleFinalValidation}
              >
                Valider et retourner au menu 🏠
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="w-full text-neutral-600 hover:bg-neutral-100"
                onClick={handleGoBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Écran de sélection des récompenses
  if (missionStep === 'rewards') {
    const totalSelectedStars = selectedRewards.reduce((sum, r) => sum + r.stars, 0);
    const remainingStars = stars - totalSelectedStars;

    return (
      <div className="min-h-full p-6 bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100">
        <div className="max-w-3xl mx-auto">
          {/* En-tête */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 border-3 border-yellow-300 shadow-xl">
              <div className="flex items-center gap-3">
                <motion.div
                  className="text-5xl"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🦁🎁
                </motion.div>
                <div className="flex-1">
                  <div className="text-sm text-yellow-600 mb-1">Chef Léo te dit :</div>
                  <div className="text-neutral-900 text-sm">{chefLeoMessages.rewards}</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl px-4 py-2">
                  <div className="text-xs opacity-90">Reste</div>
                  <div className="text-xl flex items-center gap-1">
                    {remainingStars} <Star className="w-4 h-4 fill-yellow-300" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cadeaux sélectionnés */}
          {selectedRewards.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl p-4 mb-6 shadow-xl border-2 border-green-400"
            >
              <div className="text-sm text-green-700 mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Mes cadeaux choisis (clique pour enlever) :
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedRewards.map((reward, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-yellow-100 to-orange-100 px-3 py-2 rounded-xl border-2 border-yellow-400 flex items-center gap-2 cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => handleRemoveReward(index)}
                  >
                    <span className="text-2xl">{reward.emoji}</span>
                    <span className="text-xs text-neutral-900">{reward.name}</span>
                    <span className="text-xs text-yellow-600">({reward.stars}⭐)</span>
                    <X className="w-3 h-3 text-red-500" />
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-neutral-600 italic">
                💡 Les cadeaux sont GRATUITS dans ton panier !
              </div>
            </motion.div>
          )}

          {/* Grille de récompenses */}
          <div className={`grid gap-4 mb-6 ${deviceType === 'tablet' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {rewards.map((reward, index) => {
              const canAfford = remainingStars >= reward.stars;
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-2xl p-4 shadow-xl border-3 transition-all cursor-pointer ${
                    canAfford
                      ? 'border-yellow-400 hover:border-orange-500 hover:scale-105'
                      : 'border-neutral-300 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => canAfford && handleSelectReward(reward)}
                >
                  <div className="text-6xl mb-3 text-center">{reward.emoji}</div>
                  <div className="text-sm text-neutral-900 text-center mb-2">{reward.name}</div>
                  <div className="text-xs text-neutral-600 text-center mb-3">{reward.description}</div>
                  <div className={`text-center py-2 rounded-full ${
                    canAfford
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}>
                    {reward.stars} ⭐
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Boutons d'action */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="space-y-3"
          >
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-2xl text-xl px-8 py-6"
              onClick={handleFinalValidation}
            >
              Valider et retourner au menu ! 🏠
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="w-full border-2 border-purple-300 text-purple-600 hover:bg-purple-100"
              onClick={handleGoBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au panier
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Écran de sélection (entrée, plat, ou dessert)
  const currentDishes = getCurrentCategoryDishes();
  const progressSteps = ['entrée', 'plat', 'dessert'];
  const currentStepIndex = progressSteps.indexOf(missionStep);

  return (
    <div className="min-h-full p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
      {/* Confettis lors de la sélection */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{ 
                  x: (typeof window !== 'undefined' ? window.innerWidth : 800) / 2,
                  y: (typeof window !== 'undefined' ? window.innerHeight : 600) / 2,
                  rotate: 0,
                  scale: 0
                }}
                animate={{ 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
                  rotate: 360,
                  scale: 1
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1,
                  ease: "easeOut"
                }}
              >
                {['🎉', '⭐', '✨', '🌟'][Math.floor(Math.random() * 4)]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* En-tête avec Chef Léo */}
      <motion.div 
        className="mb-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {/* Barre de progression */}
        <div className="flex gap-2 mb-4">
          {progressSteps.map((step, index) => (
            <div
              key={step}
              className={`h-3 flex-1 rounded-full transition-all duration-500 ${
                index <= currentStepIndex
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg'
                  : 'bg-neutral-300'
              }`}
            />
          ))}
        </div>

        {/* Message de Chef Léo */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 border-3 border-orange-300 shadow-xl">
          <div className="flex items-center gap-3">
            <motion.div
              className="text-5xl"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🦁👨‍🍳
            </motion.div>
            <div className="flex-1">
              <div className="text-sm text-orange-600 mb-1">Chef Léo te dit :</div>
              <div className="text-neutral-900 text-sm">{chefLeoMessages[missionStep]}</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl px-4 py-2">
              <div className="text-xs opacity-90">Étoiles</div>
              <div className="text-xl flex items-center gap-1">
                {stars} <Star className="w-4 h-4 fill-yellow-300" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Assiette centrale */}
      <PlateDisplay
        plate={plate}
        currentCategory={missionStep as 'entrée' | 'plat' | 'dessert'}
        deviceType={deviceType}
      />

      {/* Grille de cartes de plats */}
      <div className={`grid gap-4 mt-6 ${deviceType === 'tablet' ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {currentDishes.map((dish, index) => (
          <DishFlipCard
            key={dish.id}
            dish={dish}
            index={index}
            isFlipped={flippedCards.has(dish.id)}
            onFlip={() => handleFlipCard(dish.id)}
            onSelect={() => handleDishSelect(dish)}
            encouragement={encouragements[Math.floor(Math.random() * encouragements.length)]}
            stars={STARS_PER_CATEGORY[missionStep as 'entrée' | 'plat' | 'dessert']}
          />
        ))}
      </div>

      {/* Boutons d'action */}
      <motion.div
        className="mt-6 flex justify-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {/* Bouton retour arrière */}
        {(missionStep === 'plat' || missionStep === 'dessert') && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoBack}
            className="border-2 border-blue-300 text-blue-600 hover:bg-blue-100"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleSkipCategory}
          className="border-2 border-purple-300 text-purple-600 hover:bg-purple-100"
        >
          Passer cette étape →
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestart}
          className="border-2 border-neutral-300 text-neutral-600 hover:bg-neutral-100"
        >
          Recommencer 🔄
        </Button>
      </motion.div>
    </div>
  );
}

// Composant Assiette d'affichage
interface PlateDisplayProps {
  plate: PlateState;
  currentCategory: 'entrée' | 'plat' | 'dessert';
  deviceType: 'tablet' | 'smartphone';
}

function PlateDisplay({ plate, currentCategory, deviceType }: PlateDisplayProps) {
  const currentDish = plate[currentCategory];

  return (
    <div className="flex justify-center mb-6">
      <motion.div
        className="relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
      >
        {/* Assiette */}
        <div className={`${
          deviceType === 'tablet' ? 'w-48 h-48' : 'w-32 h-32'
        } rounded-full bg-gradient-to-br from-white to-neutral-100 border-8 border-neutral-300 shadow-2xl flex items-center justify-center relative overflow-hidden`}>
          {currentDish ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-full h-full"
            >
              <ImageWithFallback
                src={currentDish.imageUrl}
                alt={currentDish.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-6xl opacity-20"
            >
              🍽️
            </motion.div>
          )}
        </div>

        {/* Badge catégorie */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm shadow-lg whitespace-nowrap">
          {currentCategory === 'entrée' ? '🥗 Entrée' : currentCategory === 'plat' ? '🍽️ Plat' : '🍰 Dessert'}
        </div>
      </motion.div>
    </div>
  );
}

// Composant Carte de plat avec effet flip
interface DishFlipCardProps {
  dish: Dish;
  index: number;
  isFlipped: boolean;
  onFlip: () => void;
  onSelect: () => void;
  encouragement: string;
  stars: number;
}

function DishFlipCard({ dish, index, isFlipped, onFlip, onSelect, stars }: DishFlipCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="perspective-1000"
    >
      <motion.div
        className="relative w-full aspect-square cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
        onClick={onFlip}
      >
        {/* Face avant - Image */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-xl border-4 border-purple-300 hover:border-orange-400 transition-colors"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <ImageWithFallback
            src={dish.imageUrl}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
            <div className="text-white text-sm line-clamp-1">{dish.name}</div>
            <div className="text-yellow-300 text-xs">Clique pour découvrir ! ✨</div>
          </div>
          {dish.popular && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              🔥 Top
            </div>
          )}
          {/* Badge étoiles */}
          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
            +{stars} ⭐
          </div>
        </div>

        {/* Face arrière - Infos */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-purple-200 to-pink-200 border-4 border-purple-400 p-4 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div>
            <div className="text-sm text-purple-900 mb-2 line-clamp-2">{dish.name}</div>
            <div className="text-xs text-purple-700 mb-3 line-clamp-3">{dish.description}</div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl text-orange-600">{dish.price.toFixed(2)}€</span>
              <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full">
                +{stars} ⭐
              </span>
            </div>
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              Je choisis ça ! 🎯
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}