# Guide d'Intégration Backend

## 📋 Vue d'ensemble

Votre application utilise maintenant un système hybride qui peut fonctionner avec:
- **Données locales (MOCK)** : Pour le développement et les tests sans backend
- **Backend réel** : Les 3 microservices fournis par votre professeur

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    │
    ├─ dishService.ts ─────────┐
    │                          │
    ├─ Mode MOCK              ├─ Mode BACKEND
    │   └─ dishes.ts          │   │
    │                          │   ├─ backendAPI.ts
    │                          │   │   ├─ MenuServiceAPI
    │                          │   │   ├─ DiningServiceAPI
    │                          │   │   └─ KitchenServiceAPI
    │                          │   │
    │                          │   ├─ dishMapper.ts
    │                          │   └─ dishEnrichment.ts
    │                          │       (données locales complémentaires)
    └──────────────────────────┘
```

## 🚀 Démarrage Rapide

### 1. Configuration initiale

Copiez le fichier de configuration exemple:
```bash
cp .env.example .env
```

### 2. Choisir le mode

**Mode MOCK (recommandé pour débuter):**
```env
VITE_USE_MOCK_DATA=true
```

**Mode BACKEND:**
```env
VITE_USE_MOCK_DATA=false
VITE_MENU_SERVICE_URL=http://localhost:3001
VITE_DINING_SERVICE_URL=http://localhost:3002
VITE_KITCHEN_SERVICE_URL=http://localhost:3004
```

### 3. Lancer l'application

```bash
npm run dev
```

## 📁 Fichiers Créés

### 📄 Documentation
- **`BACKEND_INTEGRATION.md`** : Documentation complète de l'intégration

### ⚙️ Configuration
- **`src/config/backendConfig.ts`** : URLs des microservices et configuration
- **`.env.example`** : Template de configuration

### 🗃️ Données
- **`src/data/dishEnrichment.ts`** : Base de données locale pour enrichir les plats du backend
  - Descriptions
  - Ingrédients
  - Allergènes
  - Propriétés (épicé, etc.)

### 🔧 Services
- **`src/services/backendAPI.ts`** : Communication avec les 3 microservices
- **`src/services/dishMapper.ts`** : Transformation Backend ↔ Frontend
- **`src/services/dishService.ts`** : Service unifié de chargement des plats

### 📐 Types
- **`src/types/backend.ts`** : Types TypeScript pour toutes les API backend

## 🔄 Comment ça marche ?

### Chargement des plats

```typescript
import { loadDishes } from './services/dishService';

// Charge automatiquement depuis MOCK ou Backend selon la config
const dishes = await loadDishes();
```

### Le backend ne fournit que des infos partielles

**Backend donne:**
```json
{
  "_id": "abc123",
  "fullName": "Burger Classique",
  "shortName": "burger-classique",
  "price": 12.50,
  "category": "MAIN",
  "image": "https://..."
}
```

**On enrichit localement avec:**
```typescript
// dishEnrichment.ts
"burger-classique": {
  description: "Burger 180g avec cheddar...",
  ingredients: ["Bœuf", "Pain brioche", ...],
  allergens: ["Gluten", "Produits laitiers"],
  isSpicy: false
}
```

**Le frontend reçoit:**
```json
{
  "id": "abc123",
  "name": "Burger Classique",
  "description": "Burger 180g avec cheddar...",
  "price": 12.50,
  "category": "Plat",
  "imageUrl": "https://...",
  "ingredients": ["Bœuf", "Pain brioche", ...],
  "allergens": ["Gluten", "Produits laitiers"],
  "prepTime": 15,
  "isSpicy": false
}
```

## ➕ Ajouter un nouveau plat

### 1. Via le backend

```typescript
import { MenuServiceAPI } from './services/backendAPI';

await MenuServiceAPI.addMenuItem({
  fullName: "Nouveau Plat",
  shortName: "nouveau-plat",
  price: 15.00,
  category: "MAIN",
  image: "https://..."
});
```

### 2. Ajouter l'enrichissement local

Dans `src/data/dishEnrichment.ts`:
```typescript
export const DISH_ENRICHMENT = {
  // ... autres plats
  "nouveau-plat": {
    description: "Description détaillée...",
    ingredients: ["Ingrédient 1", "Ingrédient 2"],
    allergens: ["Gluten"],
    isSpicy: false
  }
};
```

## 🔍 API Disponibles

### Menu Service
- ✅ `MenuServiceAPI.getAllMenuItems()` - Liste tous les plats
- ✅ `MenuServiceAPI.getMenuItem(id)` - Un plat spécifique
- ✅ `MenuServiceAPI.addMenuItem(item)` - Créer un plat

### Dining Service  
- ✅ `DiningServiceAPI.getAllTables()` - Liste les tables
- ✅ `DiningServiceAPI.startOrdering({tableNumber, customersCount})` - Ouvrir une commande
- ✅ `DiningServiceAPI.addItemToOrder(orderId, item)` - Ajouter un plat
- ✅ `DiningServiceAPI.sendForPreparation(orderId)` - Envoyer en cuisine
- ✅ `DiningServiceAPI.billOrder(orderId)` - Facturer

### Kitchen Service
- ✅ `KitchenServiceAPI.getPreparations(state)` - Liste les préparations
- ✅ `KitchenServiceAPI.getPreparedItems(post)` - Items à préparer par poste
- ✅ `KitchenServiceAPI.startPreparedItem(id)` - Démarrer une préparation
- ✅ `KitchenServiceAPI.finishPreparedItem(id)` - Terminer une préparation

## 🧪 Tester la connexion backend

Dans la console du navigateur (F12):
```javascript
import { BackendAPI } from './services/backendAPI';

// Vérifier tous les services
const health = await BackendAPI.checkAllServices();
console.log(health);

// Tester Menu Service
const dishes = await MenuServiceAPI.getAllMenuItems();
console.log(dishes);
```

## ⚠️ Points d'attention

### prepTime (temps de préparation)
- Le Menu Service ne le fournit PAS
- Le Kitchen Service a `meanCookingTimeInSec` dans les recettes
- Pour l'instant: valeur par défaut 15 min
- TODO: Récupérer depuis Kitchen Service si nécessaire

### Mode Rush
- Notre simulation locale est conservée
- Le backend ne gère pas ce concept
- Fonctionne uniquement en mode MOCK

### shortName
- **CRITIQUE** : C'est l'identifiant unique côté backend
- Utilisé pour lier Menu Service ↔ Dining Service ↔ Kitchen Service
- Doit être identique dans `dishEnrichment.ts`

## 📝 Prochaines Étapes

1. ✅ Structure créée et documentée
2. ⏳ Adapter les composants pour utiliser `dishService`
3. ⏳ Intégrer Dining Service pour les commandes
4. ⏳ Intégrer Kitchen Service pour les préparations
5. ⏳ Tests avec le vrai backend
6. ⏳ Gestion d'erreurs et fallbacks

## 🐛 Debug

Activez les logs dans la console:
```typescript
// Dans backendConfig.ts
console.log('Mode:', BACKEND_CONFIG.USE_MOCK_DATA ? 'MOCK' : 'BACKEND');
console.log('Menu Service:', BACKEND_CONFIG.MENU_SERVICE_URL);
```

## 📞 Support

- Documentation: `BACKEND_INTEGRATION.md`
- Types backend: `src/types/backend.ts`
- Enrichissement: `src/data/dishEnrichment.ts`
