# 📐 ARCHITECTURE DE L'APPLICATION - Restaurant Le Gourmet

## 🎯 Vue d'ensemble

Application React de prise de commande pour restaurant avec **adaptation automatique** selon le contexte d'usage. L'interface s'adapte dynamiquement selon :
- **Le type d'appareil** (Tablette paysage / Smartphone portrait)
- **Le mode utilisateur** (Adulte / Enfant)
- **Le niveau d'affluence** (Mode Rush activé dynamiquement)

---

## 🏗️ Architecture globale

```
/
├── App.tsx                          # Point d'entrée principal
├── index.html                       # HTML de base
├── /data                            # Système de données centralisé
│   ├── restaurant-data.ts           # Source unique de données (menu complet)
│   ├── dataLoader.ts                # Chargeur et fonctions utilitaires
│   ├── dishes.ts                    # Types TypeScript pour les plats
│   └── rushService.ts               # Service de gestion du mode Rush
├── /components                      # Composants React
│   ├── MenuInterface.tsx            # Chef d'orchestre de l'interface
│   ├── ModeSelectionScreen.tsx      # Écran de sélection Adulte/Enfant
│   ├── DeviceSelector.tsx           # Sélecteur Tablette/Smartphone
│   ├── MenuView.tsx                 # Vue menu normale (Adulte)
│   ├── RushHourMode.tsx             # Vue menu mode Rush
│   ├── ChildMode.tsx                # Vue menu mode Enfant gamifié
│   ├── CartSidebar.tsx              # Panier latéral (desktop)
│   ├── CartPage.tsx                 # Page panier (mobile)
│   ├── DishCard.tsx                 # Carte d'un plat
│   ├── AdvancedFilters.tsx          # Filtres avancés (végétarien, etc.)
│   ├── IngredientSearchBar.tsx      # Recherche d'ingrédients
│   ├── SuggestionsPanel.tsx         # Suggestions contextuelles
│   └── OrderConfirmation.tsx        # Confirmation de commande
└── /styles
    └── globals.css                  # Styles globaux Tailwind CSS

```

---

## 📊 1. SYSTÈME DE DONNÉES CENTRALISÉ

### 1.1 `/data/restaurant-data.ts` - Source unique de vérité

**Rôle** : Contient TOUTES les données statiques de l'application

**Structure** :
```typescript
export const restaurantData = {
  restaurantConfig: {
    name: "Restaurant Le Gourmet",
    logo: "🍽️",
    rushHourConfig: {
      enabled: true,
      hours: [...],              // Heures de pointe (legacy)
      bannerMessage: "...",
      warningThreshold: 20
    },
    features: {
      childMode: true,
      adaptiveSuggestions: true,
      ingredientSearch: true,
      multipleDevices: true
    }
  },
  dishes: [
    // 46 plats au total :
    // - 12 entrées (Salades, Soupes, Tartines, Viandes, Poissons, Œufs)
    // - 22 plats principaux (Viandes, Poissons, Végétariens, Pâtes, Burgers)
    // - 12 desserts (Chocolat, Fruits, Glaces, Pâtisseries, Fromages)
    {
      id: "e1",
      name: "Salade César",
      description: "...",
      category: "entrée",
      subcategory: "Salades",
      price: 9.50,
      prepTime: 8,                // Temps de préparation en minutes
      popularity: 5,              // Score 1-5
      isSpecialOfDay: false,
      isQuick: true,              // < 10 min = recommandé en Rush
      imageUrl: "https://...",    // Images Unsplash optimisées
      kidFriendly: true,          // Adapté aux enfants
      hasVegetables: true,
      ingredients: ["laitue", "poulet", "parmesan", "croûtons"],
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      spicyLevel: 0,              // 0 = pas épicé, 3 = très épicé
      isLight: true,
      isLocal: false,
      cuisine: "française"
    },
    // ... 45 autres plats
  ],
  childRewards: [
    // Récompenses pour le mode enfant
    {
      id: "r1",
      name: "Cookie Géant",
      emoji: "🍪",
      stars: 3,                   // Coût en étoiles
      description: "Un cookie fait maison",
      imageUrl: "https://..."
    },
    // ... autres récompenses
  ],
  childModeConfig: {
    chefLeoMessages: {
      welcome: "👋 Salut petit chef ! Je suis Chef Léo...",
      entrée: "🥗 Parfait ! Choisis maintenant une belle entrée...",
      plat: "🍽️ Super choix ! Passons au plat principal...",
      dessert: "🍰 Presque fini ! Quel dessert te fait envie ?",
      complete: "🎉 Bravo ! Tu as composé un menu complet !",
      cart: "🛒 Voici ton panier magique...",
      rewards: "🏆 Wow ! Tu as gagné des étoiles !"
    },
    encouragements: [
      "Excellent choix !",
      "Tu es un vrai chef !",
      // ... autres encouragements
    ]
  }
};
```

**Pourquoi toutes les images sont via Unsplash ?**
- Optimisées automatiquement (CDN rapide)
- Pas besoin de gérer le stockage
- Images de haute qualité
- Format : `https://images.unsplash.com/photo-[id]?w=800`

---

### 1.2 `/data/dataLoader.ts` - Chargeur intelligent

**Rôle** : Centralise l'accès aux données et fournit des fonctions utilitaires

**Avantages** :
- ✅ **Source unique de vérité** : Un seul endroit pour charger les données
- ✅ **Facile à migrer vers une API** : Remplacer `restaurantData.dishes` par `await fetch('/api/dishes')`
- ✅ **Fonctions utilitaires** : Logique métier centralisée
- ✅ **Type-safe** : Validation TypeScript

**Fonctions principales** :
```typescript
// Chargement des données
export const restaurantConfig: RestaurantConfig = restaurantData.restaurantConfig;
export const dishes: Dish[] = restaurantData.dishes;
export const childRewards: ChildReward[] = restaurantData.childRewards;
export const childModeConfig: ChildModeConfig = restaurantData.childModeConfig;

// Fonctions de recherche
getDishById(id: string): Dish | undefined
getDishesByCategory(category: 'entrée' | 'plat' | 'dessert'): Dish[]
getKidFriendlyDishes(): Dish[]
getKidFriendlyDishesByCategory(category): Dish[]
getQuickDishes(): Dish[]  // Pour le mode Rush

// Filtrage avancé
getSubcategories(category): string[]  // Ex: ["Salades", "Soupes", "Tartines"]
getDishesBySubcategory(category, subcategory): Dish[]
searchDishesByIngredients(query, mode: 'include' | 'exclude'): Dish[]

// Récompenses enfant
getRewardById(id: string): ChildReward | undefined
getAffordableRewards(stars: number): ChildReward[]
rewardToDish(reward: ChildReward): Dish  // Convertit récompense en plat gratuit
```

**Exemple d'utilisation** :
```typescript
import { dishes, getQuickDishes, searchDishesByIngredients } from './data/dataLoader';

// Récupérer tous les plats rapides pour le mode Rush
const quickDishes = getQuickDishes();

// Rechercher tous les plats SANS gluten
const glutenFreeDishes = dishes.filter(d => d.isGlutenFree);

// Rechercher tous les plats qui CONTIENNENT "tomate"
const tomatoDishes = searchDishesByIngredients("tomate", "include");

// Rechercher tous les plats qui N'ONT PAS de "noix"
const nutFreeDishes = searchDishesByIngredients("noix", "exclude");
```

---

### 1.3 `/data/rushService.ts` - Gestion du mode Rush dynamique

**Rôle** : Détecte automatiquement l'affluence et active le mode Rush

**Principe** :
- ⏱️ Vérifie toutes les **10 secondes** le nombre de commandes en cours
- 🔥 Active le mode Rush si **> 10 commandes en cours**
- 🎯 **DYNAMIQUE** : Pas basé sur les heures mais sur l'affluence réelle

**Architecture** :
```typescript
export const RUSH_THRESHOLD = 10;           // Seuil d'activation
export const RUSH_CHECK_INTERVAL = 10000;   // 10 secondes

export interface RushStatus {
  ordersInProgress: number;    // Nombre de commandes en cours
  isRushMode: boolean;         // Mode Rush activé ?
  threshold: number;           // Seuil (10)
  lastUpdate: Date;            // Dernière mise à jour
}

// Fonction principale
export async function getRushStatus(): Promise<RushStatus> {
  const ordersInProgress = await simulateGetOrdersInProgress();
  
  return {
    ordersInProgress,
    isRushMode: ordersInProgress > RUSH_THRESHOLD,
    threshold: RUSH_THRESHOLD,
    lastUpdate: new Date()
  };
}

// ⚠️ SIMULATION - À remplacer par un vrai fetch en production
async function simulateGetOrdersInProgress(): Promise<number> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return 15;  // Simule 15 commandes (> 10 donc Rush activé)
}
```

**Migration vers une vraie API** :
```typescript
// Remplacer simulateGetOrdersInProgress() par :
async function getRealOrdersInProgress(): Promise<number> {
  const response = await fetch('/api/rush-status');
  const data = await response.json();
  return data.ordersInProgress;
}
```

**Intégration dans App.tsx** :
```typescript
useEffect(() => {
  const checkRushStatus = async () => {
    const status = await getRushStatus();
    setIsRushMode(status.isRushMode);
    setOrdersInProgress(status.ordersInProgress);
  };
  
  checkRushStatus();  // Vérifier immédiatement
  const interval = setInterval(checkRushStatus, RUSH_CHECK_INTERVAL);
  return () => clearInterval(interval);
}, []);
```

---

## 🧩 2. COMPOSANTS PRINCIPAUX

### 2.1 `App.tsx` - Point d'entrée

**Rôle** : Gère l'état global et le routing entre les modes

**États gérés** :
```typescript
const [deviceType, setDeviceType] = useState<'tablet' | 'smartphone'>('tablet');
const [userMode, setUserMode] = useState<UserMode>(null);  // null | 'normal' | 'child'
const [isRushMode, setIsRushMode] = useState(false);
const [ordersInProgress, setOrdersInProgress] = useState(0);
```

**Flux** :
1. Affiche `DeviceSelector` (Tablette/Smartphone)
2. Si `userMode === null` → Affiche `ModeSelectionScreen`
3. Sinon → Affiche `MenuInterface` avec le mode sélectionné

**Vérification Rush** :
```typescript
useEffect(() => {
  const checkRushStatus = async () => {
    const status = await getRushStatus();
    setIsRushMode(status.isRushMode);
    setOrdersInProgress(status.ordersInProgress);
  };
  
  checkRushStatus();
  const interval = setInterval(checkRushStatus, 10000);  // Toutes les 10s
  return () => clearInterval(interval);
}, []);
```

---

### 2.2 `MenuInterface.tsx` - Chef d'orchestre

**Rôle** : Gère la navigation entre les vues et l'état du panier

**États gérés** :
```typescript
const [viewMode, setViewMode] = useState<ViewMode>('normal');  // 'normal' | 'rush' | 'child' | 'cart' | 'order-confirmation'
const [cart, setCart] = useState<CartItem[]>([]);
const [showRushBanner, setShowRushBanner] = useState(true);
```

**Fonctions principales** :
```typescript
handleAddToCart(dish: Dish, quantity: number = 1)
handleUpdateQuantity(dishId: string, newQuantity: number)
handleRemoveItem(dishId: string)
getItemQuantity(dishId: string): number
```

**Rendu conditionnel** :
```typescript
{viewMode === 'normal' && <MenuView ... />}
{viewMode === 'rush' && <RushHourMode ... />}
{viewMode === 'child' && <ChildMode ... />}
{viewMode === 'cart' && <CartPage ... />}
{viewMode === 'order-confirmation' && <OrderConfirmation ... />}
```

**Protection des cadeaux gratuits** :
```typescript
// Dans CartSidebar.tsx et CartPage.tsx
const isReward = item.dish.id.startsWith('reward-');
const isProtected = isReward;  // Les récompenses ne peuvent pas être supprimées manuellement
```

---

### 2.3 `ModeSelectionScreen.tsx` - Sélection du mode

**Rôle** : Écran de choix entre Mode Adulte et Mode Enfant

**Props** :
```typescript
interface ModeSelectionScreenProps {
  onSelectMode: (mode: 'normal' | 'child') => void;
  deviceType: 'tablet' | 'smartphone';
}
```

**UI** :
- 🧑 **Mode Adulte** : "Interface classique et rapide"
- 👶 **Mode Enfant** : "Aventure avec Chef Léo !"

---

### 2.4 `MenuView.tsx` - Vue menu normale (Adulte)

**Rôle** : Interface de commande standard pour adultes

**Fonctionnalités** :
- 📑 Onglets par catégorie (Entrées / Plats / Desserts)
- 🔍 Recherche d'ingrédients (inclusion/exclusion)
- 🎚️ Filtres avancés (végétarien, vegan, sans gluten, etc.)
- 📂 Filtrage par sous-catégories
- 🎴 Grille de cartes de plats
- 💡 Suggestions contextuelles (détection d'hésitation)

**Détection d'hésitation** :
```typescript
useEffect(() => {
  // Si l'utilisateur reste sur une catégorie > 15 secondes sans sélection
  const timeout = setTimeout(() => {
    if (cart.length === 0 && activeCategory === 'entrée') {
      // Afficher suggestions populaires
      setSuggestions(dishes.filter(d => d.popularity >= 4));
    }
  }, 15000);
  return () => clearTimeout(timeout);
}, [activeCategory, cart]);
```

**Filtrage hiérarchique** :
```typescript
// 1. Filtrer par catégorie
let filteredDishes = getDishesByCategory(activeCategory);

// 2. Appliquer recherche d'ingrédients
if (searchQuery) {
  filteredDishes = searchDishesByIngredients(searchQuery, searchMode);
}

// 3. Appliquer sous-catégorie
if (activeSubcategory) {
  filteredDishes = filteredDishes.filter(d => d.subcategory === activeSubcategory);
}

// 4. Appliquer filtres avancés
if (filters.vegetarian) {
  filteredDishes = filteredDishes.filter(d => d.isVegetarian);
}
// ... autres filtres
```

---

### 2.5 `RushHourMode.tsx` - Vue menu Rush

**Rôle** : Interface optimisée pour les heures de pointe

**Spécificités** :
- ⚠️ **Bannière d'avertissement** : "Temps d'attente élevé"
- ⚡ **Filtre "Plats rapides"** : Affiche uniquement les plats avec `isQuick: true`
- 📊 **Indicateur de temps** : Affiche `prepTime` pour chaque plat
- 🎯 **Suggestions prioritaires** : Plats rapides et populaires

**Activation** :
```typescript
// Dans MenuInterface.tsx
{isRushHour && showRushBanner && (
  <div className="bg-orange-100 border-l-4 border-orange-500 p-3">
    <p>⚠️ Temps d'attente élevé - Nous vous recommandons notre sélection rapide</p>
    <Button onClick={handleActivateRushMode}>Voir les plats rapides</Button>
  </div>
)}
```

---

### 2.6 `ChildMode.tsx` - Mode Enfant gamifié avec Chef Léo

**Rôle** : Questionnaire interactif gamifié pour enfants

**Concept** : Parcours guidé par Chef Léo (personnage virtuel)

**Flux du questionnaire** :
```
1. Welcome → Message d'accueil Chef Léo
2. Entrée → Choix parmi 6 entrées kid-friendly
3. Plat → Choix parmi 6 plats kid-friendly
4. Dessert → Choix parmi 6 desserts kid-friendly
5. Complete → Récapitulatif avec assiette virtuelle
6. Rewards → Sélection des récompenses avec étoiles
7. Cart → Ajout au panier
```

**Système d'étoiles** :
```typescript
const STARS_PER_CATEGORY = {
  entrée: 2,   // 2 ⭐ pour une entrée
  plat: 4,     // 4 ⭐ pour un plat
  dessert: 2   // 2 ⭐ pour un dessert
};
// Total possible : 8 étoiles
```

**États gérés** :
```typescript
const [missionStep, setMissionStep] = useState<MissionStep>('welcome');
const [plate, setPlate] = useState<PlateState>({
  entrée: null,
  plat: null,
  dessert: null
});
const [stars, setStars] = useState(0);
const [showConfetti, setShowConfetti] = useState(false);
const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
const [selectedRewards, setSelectedRewards] = useState<ChildReward[]>([]);
```

**Animations** :
- 🎉 **Confettis** : À chaque sélection de plat
- 🔄 **Cartes flip** : Les plats se retournent pour montrer les détails
- ⭐ **Animation d'étoiles** : Quand on gagne des étoiles
- 🎨 **Assiette virtuelle** : Visualisation des choix

**Sélection de plats** :
```typescript
const handleDishSelect = (dish: Dish) => {
  const category = missionStep as 'entrée' | 'plat' | 'dessert';
  
  // 1. Ajouter à l'assiette
  setPlate(prev => ({ ...prev, [category]: dish }));
  
  // 2. Gagner des étoiles
  const earnedStars = STARS_PER_CATEGORY[category];
  setStars(prev => prev + earnedStars);
  
  // 3. Déclencher confettis
  triggerConfetti();
  
  // 4. Passer à l'étape suivante
  setTimeout(() => {
    if (missionStep === 'entrée') setMissionStep('plat');
    else if (missionStep === 'plat') setMissionStep('dessert');
    else if (missionStep === 'dessert') setMissionStep('complete');
  }, 1500);
};
```

**Récompenses** :
```typescript
// Récompenses disponibles
const rewards = [
  { id: 'r1', name: 'Cookie Géant', emoji: '🍪', stars: 3 },
  { id: 'r2', name: 'Milk-shake', emoji: '🥤', stars: 4 },
  { id: 'r3', name: 'Badge Chef', emoji: '👨‍🍳', stars: 5 },
  { id: 'r4', name: 'Coloriage', emoji: '🎨', stars: 2 },
  { id: 'r5', name: 'Autocollants', emoji: '✨', stars: 2 },
  { id: 'r6', name: 'Couronne Chef', emoji: '👑', stars: 8 }
];

// Filtrer les récompenses accessibles
const affordableRewards = rewards.filter(r => r.stars <= stars);

// Convertir récompense en plat gratuit
const handleRewardSelect = (reward: ChildReward) => {
  const rewardDish = rewardToDish(reward);  // Prix = 0€
  onAddToCart(rewardDish);
  setSelectedRewards(prev => [...prev, reward]);
  setStars(prev => prev - reward.stars);  // Dépenser les étoiles
};
```

**Protection des récompenses dans le panier** :
```typescript
// Les plats avec id "reward-*" ne peuvent pas être supprimés manuellement
const isReward = item.dish.id.startsWith('reward-');

{!isReward && (
  <Button onClick={() => onRemoveItem(item.dish.id)}>
    <Trash2 />
  </Button>
)}
```

---

### 2.7 `CartSidebar.tsx` et `CartPage.tsx` - Gestion du panier

**Rôle** : Affichage et modification du panier

**CartSidebar** (Tablette - Vue latérale) :
- Position fixe à droite
- Visible en permanence
- Scroll indépendant

**CartPage** (Smartphone - Pleine page) :
- Navigation via bouton "Panier"
- Vue full screen
- Bouton retour

**Fonctionnalités communes** :
```typescript
interface CartItem {
  dish: Dish;
  quantity: number;
}

// Gestion des quantités
<Button onClick={() => handleUpdateQuantity(item.dish.id, item.quantity - 1)}>-</Button>
<span>{item.quantity}</span>
<Button onClick={() => handleUpdateQuantity(item.dish.id, item.quantity + 1)}>+</Button>

// Calcul du total
const total = cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);

// Protection des récompenses
const isReward = item.dish.id.startsWith('reward-');
{!isReward && <Button onClick={() => handleRemoveItem(item.dish.id)}>Supprimer</Button>}
```

**Prise de commande de groupe (Tablette)** :
- Boutons + / - pour ajuster rapidement les quantités
- Affichage du nombre total d'articles
- Parfait pour commander pour plusieurs personnes

---

### 2.8 Composants utilitaires

**`DishCard.tsx`** - Carte d'un plat
- Image via Unsplash
- Nom, description, prix
- Badges (🌱 Végétarien, ⏱️ Rapide, etc.)
- Bouton "Ajouter au panier"
- Quantité si déjà dans le panier

**`AdvancedFilters.tsx`** - Filtres avancés
- Végétarien / Vegan / Sans gluten
- Niveau d'épices (0-3)
- Léger / Local
- Cuisine (française, italienne, etc.)

**`IngredientSearchBar.tsx`** - Recherche d'ingrédients
- Mode inclusion : "avec tomate"
- Mode exclusion : "sans noix"
- Suggestions d'ingrédients

**`SuggestionsPanel.tsx`** - Suggestions contextuelles
- Plats populaires
- Plats du jour
- Suggestions basées sur l'hésitation

**`DeviceSelector.tsx`** - Sélecteur d'appareil
- Boutons Tablette / Smartphone
- Change le format d'affichage

**`OrderConfirmation.tsx`** - Confirmation
- Récapitulatif de la commande
- Animation de succès
- Bouton "Nouvelle commande"

---

## 🎨 3. FONCTIONNALITÉS CLÉS

### 3.1 Adaptation cognitive (Détection d'hésitation)

**Principe** : Si l'utilisateur hésite trop longtemps, afficher des suggestions

**Implémentation** :
```typescript
useEffect(() => {
  // Démarrer un timer de 15 secondes
  const hesitationTimer = setTimeout(() => {
    if (cart.length === 0) {
      // Afficher les plats populaires
      const popular = dishes
        .filter(d => d.category === activeCategory && d.popularity >= 4)
        .slice(0, 3);
      setSuggestions(popular);
    }
  }, 15000);
  
  return () => clearTimeout(hesitationTimer);
}, [activeCategory, cart]);
```

**Suggestions affichées** :
- Plats avec `popularity >= 4`
- Plats du jour (`isSpecialOfDay: true`)
- Plats rapides en mode Rush

---

### 3.2 Filtrage hiérarchique avec sous-catégories

**Structure** :
```
Catégorie principale (Entrées)
  └── Sous-catégorie (Salades)
        └── Plats (Salade César, Salade Grecque, ...)
```

**Implémentation** :
```typescript
// 1. Obtenir les sous-catégories d'une catégorie
const subcategories = getSubcategories('entrée');
// → ["Salades", "Soupes", "Tartines", "Viandes", "Poissons", "Œufs"]

// 2. Filtrer par sous-catégorie
const saladDishes = getDishesBySubcategory('entrée', 'Salades');

// 3. Affichage UI
<div>
  {subcategories.map(sub => (
    <Button 
      key={sub}
      onClick={() => setActiveSubcategory(sub)}
      variant={activeSubcategory === sub ? 'default' : 'outline'}
    >
      {sub}
    </Button>
  ))}
</div>
```

---

### 3.3 Recherche d'ingrédients (Inclusion/Exclusion)

**Modes** :
- **Inclusion** : "Je veux des plats AVEC tomate"
- **Exclusion** : "Je ne veux PAS de noix"

**Implémentation** :
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [searchMode, setSearchMode] = useState<'include' | 'exclude'>('include');

// Recherche
const results = searchDishesByIngredients(searchQuery, searchMode);

// UI
<input 
  value={searchQuery} 
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Ex: tomate, poulet, fromage..."
/>
<button onClick={() => setSearchMode(searchMode === 'include' ? 'exclude' : 'include')}>
  {searchMode === 'include' ? '✅ Avec' : '❌ Sans'}
</button>
```

**Logique de recherche** :
```typescript
export function searchDishesByIngredients(
  query: string, 
  mode: 'include' | 'exclude'
): Dish[] {
  const queryLower = query.toLowerCase().trim();
  
  if (!queryLower) return dishes;
  
  if (mode === 'include') {
    // Plats qui CONTIENNENT l'ingrédient
    return dishes.filter(dish => 
      dish.ingredients.some(ing => ing.toLowerCase().includes(queryLower))
    );
  } else {
    // Plats qui NE CONTIENNENT PAS l'ingrédient
    return dishes.filter(dish => 
      !dish.ingredients.some(ing => ing.toLowerCase().includes(queryLower))
    );
  }
}
```

---

### 3.4 Mode Rush dynamique

**Activation** : Basée sur le nombre de commandes en cours, pas sur les heures

**Vérification** :
- ⏱️ Toutes les 10 secondes
- 📊 Appel à `getRushStatus()`
- 🔥 Si `ordersInProgress > 10` → Mode Rush

**Changements UI** :
```typescript
if (isRushMode) {
  // 1. Bannière d'avertissement
  <Alert variant="warning">
    ⚠️ Temps d'attente élevé - {ordersInProgress} commandes en cours
  </Alert>
  
  // 2. Filtrer uniquement les plats rapides
  const quickDishes = dishes.filter(d => d.isQuick);
  
  // 3. Afficher le temps de préparation
  <Badge>⏱️ {dish.prepTime} min</Badge>
}
```

---

### 3.5 Mode Enfant gamifié

**Parcours** :
1. **Accueil** : Message de bienvenue Chef Léo
2. **Questionnaire** : 3 étapes (entrée, plat, dessert)
3. **Assiette virtuelle** : Visualisation des choix
4. **Récompenses** : Sélection avec étoiles
5. **Panier** : Ajout des plats + récompenses

**Gamification** :
- ⭐ **Étoiles** : 2-4 étoiles par plat
- 🎁 **Récompenses** : Débloquées avec étoiles
- 🎉 **Animations** : Confettis, flips, transitions
- 👨‍🍳 **Chef Léo** : Personnage guide

---

### 3.6 Protection des cadeaux gratuits

**Problème** : Les récompenses sont gratuites, il faut éviter qu'elles soient supprimées accidentellement

**Solution** :
```typescript
// Identification
const isReward = item.dish.id.startsWith('reward-');

// UI conditionnelle
{isReward ? (
  <Badge>🎁 Cadeau</Badge>
) : (
  <Button onClick={() => handleRemoveItem(item.dish.id)}>
    <Trash2 /> Supprimer
  </Button>
)}

// Protection dans la logique
function handleRemoveItem(dishId: string) {
  if (dishId.startsWith('reward-')) {
    toast.error("Les cadeaux ne peuvent pas être supprimés !");
    return;
  }
  setCart(prevCart => prevCart.filter(item => item.dish.id !== dishId));
}
```

---

### 3.7 Prise de commande de groupe (Tablette)

**Fonctionnalités** :
- Ajout rapide de quantités multiples
- Vue panier latérale toujours visible
- Boutons +/- pour ajuster rapidement
- Total mis à jour en temps réel

**UI Tablette** :
```typescript
if (deviceType === 'tablet') {
  return (
    <div className="flex">
      <div className="flex-1">
        {/* Menu */}
        <MenuView ... />
      </div>
      <div className="w-96">
        {/* Panier sidebar fixe */}
        <CartSidebar ... />
      </div>
    </div>
  );
}
```

---

## 🔄 4. FLUX DE DONNÉES

### 4.1 Architecture de l'état

```
App.tsx (État global)
  ├── deviceType: 'tablet' | 'smartphone'
  ├── userMode: 'normal' | 'child' | null
  ├── isRushMode: boolean
  └── ordersInProgress: number
        ↓
MenuInterface.tsx (État local)
  ├── viewMode: 'normal' | 'rush' | 'child' | 'cart' | 'order-confirmation'
  ├── cart: CartItem[]
  └── showRushBanner: boolean
        ↓
MenuView / RushHourMode / ChildMode (Vues)
  ├── Affichage des plats
  ├── Filtres et recherche
  └── Actions: onAddToCart(dish, quantity)
```

### 4.2 Flux de commande typique (Mode Adulte)

```
1. App.tsx
   └─> ModeSelectionScreen
       └─> Sélection "Mode Adulte"
           └─> userMode = 'normal'

2. App.tsx
   └─> MenuInterface (userMode='normal')
       ├─> Header (logo, navigation)
       ├─> MenuView
       │   ├─> Onglets (Entrées / Plats / Desserts)
       │   ├─> Filtres (sous-catégories, recherche)
       │   └─> Grille de DishCard
       │       └─> Clic "Ajouter" → handleAddToCart()
       └─> CartSidebar (si tablet) / Bouton panier (si mobile)

3. Validation
   └─> handleValidateOrder()
       └─> viewMode = 'order-confirmation'
           └─> OrderConfirmation
               └─> Animation succès
                   └─> Bouton "Nouvelle commande"
                       └─> Reset + retour menu
```

### 4.3 Flux Mode Enfant

```
1. ModeSelectionScreen → userMode = 'child'

2. MenuInterface → viewMode = 'child'
   └─> ChildMode
       └─> missionStep = 'welcome'
           └─> Chef Léo: "👋 Salut petit chef !"
               └─> Bouton "Commencer" → missionStep = 'entrée'

3. Étape Entrée
   └─> Affichage de 6 entrées kid-friendly
       └─> Clic sur une carte → handleDishSelect()
           ├─> plate.entrée = dish
           ├─> stars += 2
           ├─> Confettis ✨
           └─> missionStep = 'plat' (après 1.5s)

4. Étape Plat (idem)
   └─> stars += 4

5. Étape Dessert (idem)
   └─> stars += 2
       └─> missionStep = 'complete'

6. Récapitulatif
   └─> Assiette virtuelle avec les 3 choix
       └─> Bouton "Voir les récompenses"
           └─> missionStep = 'rewards'

7. Récompenses
   └─> Grille de récompenses filtrées par étoiles
       └─> Clic → rewardToDish() + onAddToCart()
           └─> selectedRewards.push(reward)
               └─> stars -= reward.stars

8. Panier
   └─> missionStep = 'cart'
       └─> Bouton "Valider" → Ajout des plats + récompenses au panier
           └─> viewMode = 'order-confirmation'
```

---

## 🎯 5. OPTIMISATIONS POUR VERCEL

### 5.1 Problèmes résolus

**Problème initial** : Timeout de build sur Vercel
```
✓ 2017 modules transformed.
rendering chunks...
computing gzip size... [TIMEOUT]
```

**Causes** :
- ❌ Recharts (500KB) inutilisé dans les dépendances
- ❌ Build trop lent (> 45 secondes)
- ❌ Pas de chunking optimisé

### 5.2 Solutions appliquées

**1. Suppression de Recharts**
```json
// package.json - AVANT
"dependencies": {
  "recharts": "latest"  // ❌ 500KB inutilisés
}

// package.json - APRÈS
"dependencies": {
  // ✅ Recharts supprimé
}
```

**2. Configuration Vite optimisée**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,              // ✅ Pas de sourcemaps en prod
    minify: 'esbuild',             // ✅ Minification rapide
    chunkSizeWarningLimit: 1000,   // ✅ Limite de taille
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],     // ✅ Chunk séparé
          icons: ['lucide-react']              // ✅ Icônes à part
        }
      }
    }
  }
});
```

**3. TypeScript allégé**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": false,           // ✅ Désactivé temporairement
    "skipLibCheck": true,      // ✅ Skip vérification des types
    "noUnusedLocals": false,   // ✅ Pas de check strict
  }
}
```

**4. Build command optimisé**
```json
// package.json
{
  "scripts": {
    "build": "vite build --logLevel warn"  // ✅ Logs réduits
  }
}
```

**5. Configuration Vercel**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }  // ✅ SPA routing
  ]
}
```

### 5.3 Résultat

**Avant** :
- ❌ Build timeout après 45s
- ❌ Bundle de ~2MB
- ❌ Erreur "No Output Directory"

**Après** :
- ✅ Build en ~2-3 minutes
- ✅ Bundle de ~800KB
- ✅ Déploiement réussi

---

## 📦 6. STRUCTURE DES FICHIERS DÉPLOYÉS

```
dist/
├── index.html                      # Point d'entrée
├── assets/
│   ├── index-[hash].js            # Bundle principal (~500KB)
│   ├── vendor-[hash].js           # React + React-DOM (~200KB)
│   ├── icons-[hash].js            # Lucide icons (~100KB)
│   └── index-[hash].css           # Styles Tailwind
└── favicon.svg                     # Icône
```

**Optimisations automatiques de Vercel** :
- ✅ **Compression Gzip** : ~70% de réduction
- ✅ **CDN Global** : Déployé sur tous les edge nodes
- ✅ **Cache agressif** : Assets cachés avec hash dans le nom
- ✅ **HTTP/2** : Chargement parallèle des chunks

---

## 🚀 7. MIGRATION VERS UNE API RÉELLE

Actuellement, toutes les données sont en **front-end statique**. Voici comment migrer vers un backend.

### 7.1 Remplacer `dataLoader.ts`

**Actuel** :
```typescript
// dataLoader.ts
import { restaurantData } from './restaurant-data';
export const dishes: Dish[] = restaurantData.dishes;
```

**Avec API** :
```typescript
// dataLoader.ts
export async function fetchDishes(): Promise<Dish[]> {
  const response = await fetch('/api/dishes');
  const data = await response.json();
  return data.dishes;
}

// Dans le composant
useEffect(() => {
  fetchDishes().then(setDishes);
}, []);
```

### 7.2 Remplacer `rushService.ts`

**Actuel** :
```typescript
async function simulateGetOrdersInProgress(): Promise<number> {
  return 15;  // Hardcodé
}
```

**Avec API** :
```typescript
async function fetchOrdersInProgress(): Promise<number> {
  const response = await fetch('/api/rush-status');
  const data = await response.json();
  return data.ordersInProgress;
}
```

### 7.3 Backend API nécessaire

**Endpoints à créer** :
```
GET  /api/dishes              → Liste des plats
GET  /api/dishes/:id          → Détails d'un plat
GET  /api/rush-status         → Nombre de commandes en cours
POST /api/orders              → Créer une commande
GET  /api/orders/:id          → Détails d'une commande
GET  /api/rewards             → Liste des récompenses enfant
```

**Exemple avec Express.js** :
```javascript
// server.js
app.get('/api/rush-status', async (req, res) => {
  const ordersInProgress = await db.orders.count({ status: 'in_progress' });
  res.json({
    ordersInProgress,
    isRushMode: ordersInProgress > 10,
    threshold: 10,
    lastUpdate: new Date()
  });
});
```

---

## 🎓 8. POINTS CLÉS À RETENIR POUR PRÉSENTER

### Architecture
1. ✅ **Architecture modulaire** : Composants réutilisables
2. ✅ **Source unique de vérité** : Toutes les données dans `restaurant-data.ts`
3. ✅ **Séparation des responsabilités** : Data / UI / Logique
4. ✅ **Type-safe** : TypeScript partout

### Fonctionnalités
1. ✅ **Adaptation automatique** : Tablette / Smartphone
2. ✅ **3 modes** : Adulte / Rush / Enfant
3. ✅ **Détection d'hésitation** : Suggestions intelligentes
4. ✅ **Filtrage avancé** : Hiérarchique + recherche d'ingrédients
5. ✅ **Mode Rush dynamique** : Basé sur l'affluence réelle
6. ✅ **Gamification enfant** : Questionnaire + étoiles + récompenses

### Technique
1. ✅ **React + TypeScript** : Framework moderne
2. ✅ **Tailwind CSS** : Styling utilitaire
3. ✅ **Motion** : Animations fluides
4. ✅ **Lucide React** : Icônes SVG légères
5. ✅ **Vite** : Build ultra-rapide
6. ✅ **Vercel** : Déploiement serverless

### Performance
1. ✅ **Bundle optimisé** : 800KB total
2. ✅ **Code splitting** : Vendor + Icons séparés
3. ✅ **Images CDN** : Unsplash optimisé
4. ✅ **Build rapide** : 2-3 minutes

### Évolutivité
1. ✅ **Facile à migrer vers API** : Architecture prête
2. ✅ **Extensible** : Ajout de plats trivial
3. ✅ **Maintenable** : Code clair et commenté
4. ✅ **Testable** : Composants isolés

---

## 📚 RÉSUMÉ TECHNIQUE

| Aspect | Technologie | Raison |
|--------|-------------|--------|
| **Framework** | React 18 | Composants réutilisables, Virtual DOM |
| **Langage** | TypeScript | Type safety, meilleure DX |
| **Build** | Vite 6 | Build ultra-rapide (~3min) |
| **Styling** | Tailwind CSS 4 | Utility-first, customisable |
| **Animations** | Motion (Framer Motion) | Animations déclaratives |
| **Icônes** | Lucide React | SVG légers, tree-shakable |
| **Images** | Unsplash CDN | Optimisées, pas de stockage |
| **Déploiement** | Vercel | Serverless, CDN global, gratuit |
| **Données** | JSON statique | Facile à migrer vers API |
| **State Management** | React Hooks | useState, useEffect, pas besoin de Redux |

---

## 🎯 DÉMO FLOW

**1. Démonstration Mode Adulte (Normal)**
- Sélection "Tablette"
- Choix "Mode Adulte"
- Navigation Entrées → Plats → Desserts
- Utilisation des filtres (sous-catégories)
- Recherche d'ingrédients ("tomate")
- Ajout au panier
- Modification des quantités
- Validation commande

**2. Démonstration Mode Rush**
- Montrer l'indicateur de commandes en cours (15)
- Affichage de la bannière d'avertissement
- Activation du mode Rush
- Filtrage automatique des plats rapides
- Affichage des temps de préparation

**3. Démonstration Mode Enfant**
- Sélection "Smartphone"
- Choix "Mode Enfant"
- Parcours complet avec Chef Léo
- Sélection entrée → gain de 2 étoiles
- Sélection plat → gain de 4 étoiles
- Sélection dessert → gain de 2 étoiles
- Visualisation de l'assiette virtuelle
- Sélection de récompenses
- Ajout au panier avec cadeau gratuit
- Montrer la protection des cadeaux

---

**FIN DE LA DOCUMENTATION** 🎉
