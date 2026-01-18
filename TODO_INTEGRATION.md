# TODO: Adaptations des Composants

## 📋 Checklist d'intégration

### ✅ Phase 1: Infrastructure (COMPLÉTÉ)
- [x] Configuration backend (`backendConfig.ts`)
- [x] Types TypeScript (`backend.ts`)
- [x] Services API (`backendAPI.ts`)
- [x] Mapper de données (`dishMapper.ts`)
- [x] Enrichissement local (`dishEnrichment.ts`)
- [x] Service unifié (`dishService.ts`)
- [x] Documentation complète

### ⏳ Phase 2: Adaptation des composants (À FAIRE)

#### 1. Chargement des plats

**Fichiers à modifier:**
- `src/data/dataLoader.ts`
- `src/components/MenuView.tsx`
- `src/App.tsx`

**Changement:**
```typescript
// AVANT
import { dishes } from '../data/dishes';

// APRÈS
import { loadDishes } from '../services/dishService';

// Dans le composant:
const [dishes, setDishes] = useState<Dish[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadDishes().then(setDishes).finally(() => setLoading(false));
}, []);
```

#### 2. Gestion des commandes (Table Tactile)

**Fichiers à modifier:**
- `src/App.tsx` (section table-tactile)

**Adaptations:**
- Créer un `tableOrderId` au chargement
- Utiliser `DiningServiceAPI.startOrdering()` au début
- Utiliser `DiningServiceAPI.addItemToOrder()` pour ajouter des plats
- Utiliser `DiningServiceAPI.sendForPreparation()` au lieu de notre logique
- Utiliser `DiningServiceAPI.billOrder()` pour le paiement

**Pseudo-code:**
```typescript
const [tableOrderId, setTableOrderId] = useState<string | null>(null);

// Au montage du composant table tactile
useEffect(() => {
  if (BACKEND_CONFIG.USE_MOCK_DATA) return; // Mode mock: pas besoin
  
  // Créer la commande
  DiningServiceAPI.startOrdering({
    tableNumber: 1, // ou dynamique
    customersCount: 4
  }).then(order => {
    setTableOrderId(order._id);
  });
}, []);

// Quand on ajoute au panier
const handleAddToPersonalCart = async (playerId: number, dish: Dish) => {
  // Logique locale existante
  setPersonalCarts(/* ... */);
  
  // Si backend activé
  if (!BACKEND_CONFIG.USE_MOCK_DATA && tableOrderId) {
    await DiningServiceAPI.addItemToOrder(tableOrderId, {
      menuItemId: dish.id,
      menuItemShortName: dish.name.toLowerCase().replace(/\s+/g, '-'),
      howMany: 1
    });
  }
};

// Quand on paie
const handlePersonalPayment = async (playerId: number) => {
  // Logique locale existante
  /* ... */
  
  // Si backend activé
  if (!BACKEND_CONFIG.USE_MOCK_DATA && tableOrderId) {
    await DiningServiceAPI.billOrder(tableOrderId);
  }
};
```

#### 3. Mode Tablette/Smartphone (MenuInterface)

**Fichiers à modifier:**
- `src/components/MenuInterface.tsx`
- `src/components/CartSidebar.tsx`

**Même logique que pour Table Tactile:**
- Créer un `tableOrderId` par table
- Synchroniser les actions avec le backend

#### 4. Affichage des préparations (optionnel)

**Nouveau composant à créer:**
- `src/components/KitchenPreparations.tsx`

**Fonctionnalités:**
- Afficher les préparations en cours
- Filtrer par état (en préparation / prêtes)
- Marquer comme "apporté à table"

### ⏳ Phase 3: Tests et validation

- [ ] Tester en mode MOCK (données locales)
- [ ] Configurer les URLs du backend
- [ ] Tester en mode BACKEND avec vrais services
- [ ] Vérifier la synchronisation des données
- [ ] Gestion des erreurs réseau
- [ ] Mode dégradé (fallback sur MOCK si backend KO)

### ⏳ Phase 4: Optimisations

- [ ] Cache des données menu (éviter de recharger à chaque fois)
- [ ] Loading states pendant les appels API
- [ ] Messages d'erreur user-friendly
- [ ] Retry automatique en cas d'échec
- [ ] Optimistic updates (mise à jour UI immédiate, synchro backend en arrière-plan)

## 🎯 Stratégie d'implémentation recommandée

### Option 1: Progressive (recommandé)
1. Garder le mode MOCK activé
2. Adapter les composants un par un
3. Tester chaque adaptation en MOCK
4. Quand tout fonctionne en MOCK, basculer sur le backend

### Option 2: Parallèle
1. Créer des branches/versions séparées
2. Version MOCK: code actuel
3. Version BACKEND: avec intégration
4. Merger quand prêt

### Option 3: Feature Flag
1. Ajouter un toggle dans l'UI pour basculer MOCK/BACKEND
2. Permet de comparer les deux modes en temps réel
3. Utile pour démo et debug

## 📝 Notes importantes

### ShortName vs ID
- Backend utilise `shortName` comme identifiant métier
- Frontend utilise `_id` MongoDB
- Le mapper gère la conversion automatiquement

### Synchronisation État Local ↔ Backend
Deux approches possibles:

**A) État local = source de vérité**
```typescript
// On garde notre logique, on synchronise en arrière-plan
const [cart, setCart] = useState([]);

const addToCart = (item) => {
  setCart([...cart, item]); // Immédiat (optimistic)
  
  // Synchro backend en arrière-plan
  if (backendEnabled) {
    DiningServiceAPI.addItemToOrder(...)
      .catch(err => {
        // En cas d'erreur: rollback ou afficher erreur
        console.error(err);
      });
  }
};
```

**B) Backend = source de vérité**
```typescript
// Chaque action met à jour le backend, puis on recharge
const addToCart = async (item) => {
  const updatedOrder = await DiningServiceAPI.addItemToOrder(...);
  setCart(updatedOrder.lines); // On prend la version backend
};
```

Recommandation: **Approche A** pour meilleure UX (pas de latence)

### Temps de préparation (prepTime)
Le backend ne le fournit pas dans Menu Service mais:
- Kitchen Service a `meanCookingTimeInSec` dans Recipe
- On peut le récupérer séparément si nécessaire
- Pour l'instant: on utilise une valeur par défaut (15 min)

### Mode Rush
- Notre simulation locale est conservée
- Le backend ne gère pas ce concept
- Continue de fonctionner en parallèle

## 🚀 Pour commencer

1. Lisez `BACKEND_GUIDE.md` pour comprendre l'architecture
2. Testez les API dans la console navigateur
3. Commencez par adapter le chargement des plats (le plus simple)
4. Puis les commandes progressivement

## ❓ Questions à poser au professeur

- [ ] Quelles sont les URLs exactes des microservices ?
- [ ] Y a-t-il un Gateway unifié ou 3 URLs séparées ?
- [ ] Comment gérer l'authentification (si nécessaire) ?
- [ ] Le backend gère-t-il le CORS ?
- [ ] Y a-t-il des quotas/limites de requêtes ?
- [ ] Peut-on créer nos propres items de menu ?
- [ ] Les shortNames sont-ils pré-définis ou on peut créer les nôtres ?
