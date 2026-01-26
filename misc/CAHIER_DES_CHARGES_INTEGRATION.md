# CAHIER DES CHARGES - INTÉGRATION BACKEND/FRONTEND
## Projet d'Adaptation des Interfaces Restaurant

**Version** : 1.0  
**Date** : 16 janvier 2026  
**Auteur** : Équipe Technique  
**Contexte** : Adaptation IHM à l'environnement

---

## 1. INTRODUCTION

### 1.1 Contexte du Projet

Le projet **Adaptation des Interfaces** vise à créer une application de commande pour restaurant avec **4 adaptations contextuelles** :

1. **Adaptation Device (QR Code)** : Interface mobile optimisée pour commande via QR Code
2. **Adaptation Système (Rush Hour)** : Interface adaptée aux heures de pointe avec plats rapides
3. **Adaptation Cognitive (Suggestions)** : Panneau de suggestions intelligentes
4. **Adaptation Âge (Child Mode)** : Interface simplifiée pour enfants avec système de récompenses

**Stack Technique** :
- **Frontend** : React 18 + TypeScript + Vite
- **Backend** : NestJS (microservices) + MongoDB + Docker
- **Gateway** : Port 9500 (point d'entrée unique)
- **Microservices** :
  - Menu Service (port 3000) : Gestion du menu
  - Dining Service (port 3001) : Gestion des tables et commandes
  - Kitchen Service (port 3002) : Gestion cuisine

### 1.2 Problématique

Le backend fourni expose un **MenuItem minimal** :
```typescript
interface MenuItem {
  _id: string;
  fullName: string;
  shortName: string;
  price: number;
  category: 'STARTER' | 'MAIN' | 'DESSERT' | 'BEVERAGE';
  image: string;
}
```

Le frontend nécessite des **métadonnées enrichies** pour les adaptations :
```typescript
interface Dish {
  // Champs existants
  _id: string;
  fullName: string;
  shortName: string;
  price: number;
  category: string;
  image: string;
  
  // Métadonnées manquantes
  prepTime: number;          // Rush Hour Mode
  popularity: number;         // Suggestions
  kidFriendly: boolean;      // Child Mode
  ingredients: string[];     // Recherche/Filtres
  isSpecialOfDay: boolean;   // Suggestions
  isVegetarian: boolean;     // Filtres diététiques
  allergens: string[];       // Filtres diététiques
}
```

**Gap identifié** : Le backend ne fournit pas les 15+ champs nécessaires aux adaptations.

### 1.3 Objectifs du Document

Ce cahier des charges présente **3 solutions d'intégration** pour combler ce gap :

| Solution | Approche | Modification Backend | Complexité | Délai |
|----------|----------|---------------------|------------|-------|
| **Solution 1** | Enrichissement Frontend | ❌ Aucune | ⭐ Faible | 1-2 jours |
| **Solution 2** | BFF (Backend For Frontend) | ❌ Aucune | ⭐⭐⭐ Élevée | 1-2 semaines |
| **Solution 3** | Évolution Microservices | ✅ Importante | ⭐⭐ Moyenne | 3-5 jours |

Chaque solution est documentée avec :
- ✅ **Diagrammes de séquence détaillés**
- ✅ **Spécification complète des APIs**
- ✅ **Architecture et flux de données**
- ✅ **Éléments d'implémentation (schémas, endpoints)**
- ✅ **Stack technique compatible avec l'existant**

---

## 2. ARCHITECTURE TECHNIQUE EXISTANTE

### 2.1 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (React + TypeScript)             │
│                   http://localhost:5173                     │
│                                                             │
│  Composants Adaptatifs:                                    │
│  • RushHourMode.tsx    • ChildMode.tsx                     │
│  • SuggestionsPanel.tsx • AdvancedFilters.tsx              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP REST
                           ↓
┌──────────────────────────────────────────────────────────────┐
│              GATEWAY (NestJS)                                │
│              http://localhost:9500                           │
│                                                             │
│  Routes exposées:                                           │
│  • GET  /menus         → Menu Service                       │
│  • GET  /tables        → Dining Service                     │
│  • POST /tableOrders   → Dining Service                     │
└──────────────────────────┬───────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│  Menu Service    │ │ Dining       │ │ Kitchen      │
│  Port 3000       │ │ Service      │ │ Service      │
│                  │ │ Port 3001    │ │ Port 3002    │
│  + MongoDB       │ │ + MongoDB    │ │ + MongoDB    │
│  (port 27018)    │ │ (port 27019) │ │ (port 27020) │
└──────────────────┘ └──────────────┘ └──────────────┘
```

### 2.2 APIs Backend Actuelles

#### Menu Service - Endpoints Existants

```yaml
GET /menus
  Description: Récupère tous les plats du menu
  Response: MenuItem[]
  
GET /menus/:id
  Description: Récupère un plat par son ID
  Response: MenuItem

GET /menus/category/:category
  Description: Filtre par catégorie (STARTER, MAIN, DESSERT, BEVERAGE)
  Response: MenuItem[]

POST /menus
  Description: Crée un nouveau plat
  Body: CreateMenuItemDto
  Response: MenuItem

PUT /menus/:id
  Description: Met à jour un plat
  Body: UpdateMenuItemDto
  Response: MenuItem

DELETE /menus/:id
  Description: Supprime un plat
  Response: 204 No Content
```

**Schema MongoDB Actuel** :
```typescript
{
  _id: ObjectId,
  fullName: string,      // Ex: "Steak avec frites maison"
  shortName: string,     // Ex: "Steak Frites"
  price: number,         // Ex: 18.50
  category: string,      // "STARTER" | "MAIN" | "DESSERT" | "BEVERAGE"
  image: string          // URL de l'image
}
```

#### Dining Service - Endpoints Existants

```yaml
GET /tables
  Description: Liste toutes les tables du restaurant
  Response: Table[]

POST /tableOrders
  Description: Crée une commande pour une table
  Body: { tableNumber: number, customersCount: number }
  Response: TableOrder

POST /tableOrders/:id/addLines
  Description: Ajoute des plats à une commande
  Body: { lines: OrderLine[] }
  Response: TableOrder

GET /tableOrders/:id
  Description: Récupère une commande
  Response: TableOrder
```

### 2.3 Besoins Frontend par Adaptation

#### Rush Hour Mode
- **Besoin** : Filtrer les plats par temps de préparation
- **Données manquantes** : `prepTime` (temps de préparation en minutes)
- **Logique** : Afficher uniquement les plats avec `prepTime <= 30min` ou `prepTime <= 15min`

#### Child Mode
- **Besoin** : Afficher uniquement les plats adaptés aux enfants
- **Données manquantes** : `kidFriendly` (boolean)
- **Logique** : Filtrer `kidFriendly === true`, interface simplifiée

#### Suggestions Panel
- **Besoins** :
  - Plat du jour : `isSpecialOfDay` (boolean)
  - Plats populaires : `popularity` (note 1-5)
  - Trending : Statistiques de commandes
- **Données manquantes** : `isSpecialOfDay`, `popularity`, `orderCount`, `lastOrdered`

#### Advanced Filters
- **Besoins** : Filtres diététiques et recherche par ingrédients
- **Données manquantes** :
  - `ingredients: string[]`
  - `isVegetarian: boolean`
  - `isVegan: boolean`
  - `isGlutenFree: boolean`
  - `allergens: string[]`

---

## 3. VUE D'ENSEMBLE DES 3 SOLUTIONS

### 3.1 Solution 1 : Enrichissement Frontend

**Principe** : Créer une couche de mapping côté frontend qui enrichit les MenuItems avec des données statiques.

```
Frontend
  ├─ GET /menus (MenuItem[])
  ├─ Enrichissement local avec DISH_ENRICHMENT
  └─ Utilisation des Dishes enrichis dans les composants
```

**Avantages** :
- ✅ Aucune modification backend
- ✅ Implémentation rapide (1-2 jours)
- ✅ Simplicité maximale
- ✅ Idéal pour POC/projet académique

**Inconvénients** :
- ❌ Données statiques hardcodées
- ❌ Maintenance difficile (rebuild pour chaque changement)
- ❌ Pas de suggestions intelligentes (pas de statistiques réelles)
- ❌ Non scalable

### 3.2 Solution 2 : BFF (Backend For Frontend)

**Principe** : Créer un service intermédiaire qui orchestre les appels aux microservices et gère les métadonnées enrichies en base de données.

```
Frontend → BFF (NestJS + MongoDB) → Gateway → Microservices
```

**Avantages** :
- ✅ Aucune modification backend existant
- ✅ Données dynamiques en base de données
- ✅ Suggestions intelligentes (analytics)
- ✅ Scalable et maintenable
- ✅ Séparation des responsabilités
- ✅ Idéal pour production

**Inconvénients** :
- ❌ Architecture plus complexe
- ❌ Service additionnel à déployer (+ MongoDB)
- ❌ Temps de développement long (1-2 semaines)
- ❌ Coûts d'infrastructure

### 3.3 Solution 3 : Évolution Microservices

**Principe** : Modifier les microservices existants (Menu Service) pour enrichir le schema MenuItem et ajouter de nouveaux endpoints.

```
Frontend → Gateway → Menu Service ENRICHI (schema modifié)
```

**Avantages** :
- ✅ Architecture simplifiée (pas de BFF)
- ✅ Performance optimale (1 seul appel)
- ✅ Single source of truth
- ✅ Filtrage optimisé en base de données

**Inconvénients** :
- ❌ Modification du backend existant (nécessite les droits)
- ❌ Couplage frontend/backend
- ❌ Migration de données nécessaire
- ❌ Tests de régression importants

---

## 4. MATRICE DE DÉCISION

### 4.1 Comparaison Rapide

| Critère | Solution 1 | Solution 2 | Solution 3 |
|---------|------------|------------|------------|
| **Modification backend** | ❌ Aucune | ❌ Aucune | ✅ Importante |
| **Temps de dev** | 1-2 jours | 1-2 semaines | 3-5 jours |
| **Complexité** | ⭐ Faible | ⭐⭐⭐ Élevée | ⭐⭐ Moyenne |
| **Maintenabilité** | ⭐ Faible | ⭐⭐⭐ Excellente | ⭐⭐ Bonne |
| **Performance** | ⭐⭐⭐ Excellente | ⭐⭐ Moyenne | ⭐⭐⭐ Excellente |
| **Coût infra** | Minimal | Élevé | Moyen |
| **Suggestions intelligentes** | ❌ Non | ✅ Oui | ⭐ Possible |
| **Scalabilité** | ❌ Non | ✅ Oui | ⭐ Moyenne |

### 4.2 Recommandations par Contexte

**Contexte Projet Étudiant / POC** :
- ✅ **Solution 1** (enrichissement frontend)
- Raison : Rapidité, pas de modification backend, suffisant pour démonstration

**Contexte Production Réelle** :
- ✅ **Solution 2** (BFF)
- Raison : Maintenabilité, analytics, scalabilité, multi-clients

**Contexte Backend Interne Modifiable** :
- ✅ **Solution 3** (évolution microservices)
- Raison : Architecture simplifiée, performance, cohérence

### 4.3 Prérequis Techniques par Solution

| Prérequis | Sol. 1 | Sol. 2 | Sol. 3 |
|-----------|--------|--------|--------|
| Droits modification backend | ❌ | ❌ | ✅ Requis |
| Compétences NestJS | ❌ | ✅ | ✅ |
| Infrastructure Docker disponible | ❌ | ✅ | ⭐ Optionnel |
| Base de données MongoDB | ❌ | ✅ Nouvelle | ✅ Existante |
| Équipe frontend seule | ✅ | ❌ | ❌ |
| Budget infrastructure | Minimal | Moyen-Élevé | Minimal |

---

## 5. GUIDE DE LECTURE DU DOCUMENT

Ce cahier des charges est organisé en **3 sections principales** correspondant aux 3 solutions :

### Section 6 - Solution 1 : Enrichissement Frontend
- Diagrammes de séquence pour chaque adaptation
- Spécification du mapping d'enrichissement
- APIs utilisées (Gateway existant)
- Code de référence (dataLoader.ts)

### Section 7 - Solution 2 : BFF
- Architecture du BFF
- Schémas MongoDB (4 collections)
- Spécification complète des APIs BFF
- Diagrammes de séquence détaillés
- Configuration Docker

### Section 8 - Solution 3 : Évolution Microservices
- Modifications du schema MenuItem
- Nouveaux endpoints Menu Service
- Diagrammes de séquence
- Script de migration MongoDB

### Section 9 - Analyse Comparative Finale
- Tableaux récapitulatifs
- Recommandations
- Checklist d'implémentation

---

**Note importante** : Chaque solution est **complète et indépendante**. Vous pouvez implémenter celle qui correspond à votre contexte projet sans avoir besoin des autres sections.

---

# SOLUTION 1 : ENRICHISSEMENT FRONTEND

## 6. ARCHITECTURE + APIS

**Principe** : Mapping statique côté frontend qui enrichit les MenuItem avec des métadonnées hardcodées.

```
Frontend (GET /menus) → Enrichissement Local → Dish[] enrichis
```

**APIs Backend utilisées (inchangées)** :
- `GET /menus` → MenuItem[] 
- `GET /menus?category=MAIN` → MenuItem[]

**Mapping Frontend** :
```typescript
// src/data/dishEnrichment.ts
export const DISH_ENRICHMENT: Record<string, Metadata> = {
  "Steak Frites": { prepTime: 25, popularity: 5, kidFriendly: true, ... },
  "Poulet Rôti": { prepTime: 35, popularity: 5, isSpecialOfDay: true, ... },
  "Pizza Margherita": { prepTime: 18, popularity: 5, kidFriendly: true, ... }
};

// Enrichissement
const enriched = menuItems.map(item => ({
  ...item,
  ...DISH_ENRICHMENT[item.shortName]
}));
```

---

## 7. DIAGRAMMES DE SÉQUENCE

## 7. DIAGRAMMES DE SÉQUENCE

### Rush Hour Mode

```
Frontend              Gateway           Menu Service
     │                   │                    │
     │ 1. GET /menus     │                    │
     ├──────────────────>├───────────────────>│
     │                   │                    │ MongoDB Query
     │                   │ MenuItem[]         │ db.menus.find()
     │<──────────────────┤<───────────────────┤
     │                   │                    │
     │ 2. Enrichissement Local (< 10ms)       │
     │    menuItems.map(item => ({            │
     │      ...item,                          │
     │      ...DISH_ENRICHMENT[item.shortName]│
     │    }))                                 │
     │                   │                    │
     │ 3. Filtrage Client                     │
     │    .filter(d => d.prepTime <= 30)      │
     │                   │                    │
     │ 4. Affichage Plats Rapides             │
     │    🍕 Pizza (18min)                    │
     │    🥩 Steak (25min)                    │
```

### Child Mode

```
Frontend              Gateway           Menu Service
     │                   │                    │
     │ 1. GET /menus?category=MAIN            │
     ├──────────────────>├───────────────────>│
     │                   │                    │
     │<──────────────────┤<───────────────────┤
     │                   │                    │
     │ 2. Enrichissement + Filtrage           │
     │    .map(enrichMenuItem)                │
     │    .filter(d => d.kidFriendly === true)│
     │                   │                    │
     │ 3. Interface Simplifiée                │
     │    - Grandes images                    │
     │    - Emojis                            │
     │    - Pas de prix                       │
```

### Suggestions Panel

```
Frontend              Gateway           Menu Service
     │                   │                    │
     │ 1. GET /menus     │                    │
     ├──────────────────>├───────────────────>│
     │<──────────────────┤<───────────────────┤
     │                   │                    │
     │ 2. Calcul Suggestions Côté Client      │
     │    - Plat du jour: .find(d => d.isSpecialOfDay)
     │    - Top 3: .filter(d => d.popularity >= 4)
     │              .sort((a,b) => b.popularity - a.popularity)
     │              .slice(0, 3)              │
     │                   │                    │
     │ 3. Affichage                           │
     │    📍 Plat du jour: Poulet Rôti        │
     │    🔥 Top 3: Pizza, Steak, Tiramisu    │
```

---

## 8. IMPLÉMENTATION

## 8. IMPLÉMENTATION

```typescript
// src/data/dataLoader.ts
export function enrichMenuItem(item: MenuItem): Dish {
  return {
    ...item,
    ...(DISH_ENRICHMENT[item.shortName] || DEFAULT_METADATA)
  };
}

export async function fetchEnrichedDishes(): Promise<Dish[]> {
  const response = await fetch('http://localhost:9500/menus');
  const menuItems: MenuItem[] = await response.json();
  return menuItems.map(enrichMenuItem);
}

// Utilisation dans composants
const dishes = await fetchEnrichedDishes();
const quickDishes = dishes.filter(d => d.prepTime <= 30);
const kidFriendlyDishes = dishes.filter(d => d.kidFriendly);
const topPopular = dishes.filter(d => d.popularity >= 4);
```

---

## 9. CHECKLIST + AVANTAGES/LIMITES

### Implémentation (1-2 jours)
### Implémentation (1-2 jours)

**Jour 1** :
- [ ] Créer `src/data/dishEnrichment.ts` avec mapping complet (20+ plats)
- [ ] Créer `src/data/dataLoader.ts` avec `enrichMenuItem()`
- [ ] Modifier `RushHourMode.tsx` : `dishes.filter(d => d.prepTime <= 30)`
- [ ] Modifier `ChildMode.tsx` : `dishes.filter(d => d.kidFriendly)`

**Jour 2** :
- [ ] Modifier `SuggestionsPanel.tsx` : calcul suggestions locales
- [ ] Implémenter recherche ingrédients dans `AdvancedFilters.tsx`
- [ ] Tests des 4 adaptations

### Avantages ✅

- Aucune modification backend requise
- Implémentation rapide (1-2 jours)
- Performance excellente (enrichissement < 10ms)
- Idéal pour POC/projet académique

### Limites ❌

- Données statiques hardcodées (rebuild pour chaque changement)
- Suggestions "Trending" non-intelligentes (pas de vraies stats)
- Risque d'oubli pour nouveaux plats ajoutés au backend
- Non scalable pour production réelle

---

# SOLUTION 2 : BFF (BACKEND FOR FRONTEND)

## 10. ARCHITECTURE + SCHÉMAS MONGODB

**Principe** : Service intermédiaire NestJS qui gère les métadonnées enrichies et orchestre les appels aux microservices.

```
Frontend → BFF (Port 4000) → Gateway (Port 9500) → Microservices
             ↓
        MongoDB BFF
        (Port 27021)
```

**4 Collections MongoDB** :

```typescript
// Collection: dish_metadata
{
  _id: ObjectId,
  menuItemId: string,        // Référence vers MenuItem du Menu Service
  prepTime: number,          // 5-120 minutes
  popularity: number,        // 1-5 étoiles
  kidFriendly: boolean,
  isSpecialOfDay: boolean,
  ingredients: string[],
  isVegetarian: boolean,
  isVegan: boolean,
  isGlutenFree: boolean,
  allergens: string[],
  description: string,
  calories: number
}

// Collection: restaurant_config
{
  _id: ObjectId,
  rushHourThresholds: {
    fast: 15,           // < 15min = très rapide
    moderate: 30        // < 30min = rapide
  },
  specialOfDayId: string,    // ID du plat du jour
  updatedAt: Date
}

// Collection: order_statistics
{
  _id: ObjectId,
  menuItemId: string,
  orderCount: number,         // Nombre total de commandes
  lastOrdered: Date,
  weeklyOrders: number,       // Commandes cette semaine
  trending: boolean           // Calculé automatiquement
}

// Collection: child_rewards
{
  _id: ObjectId,
  deviceId: string,           // ID unique du device
  starsEarned: number,
  lastVisit: Date
}
```

---

## 11. APIS BFF

**Base URL** : `http://localhost:4000`

### Endpoints Enrichis

```yaml
GET /api/dishes
  Description: Récupère tous les plats enrichis
  Response: EnrichedDish[]
  Logique:
    1. Appel GET /menus vers Gateway
    2. Pour chaque MenuItem, fetch dish_metadata
    3. Merge des données
    
GET /api/dishes/rush-hour?maxTime=30
  Description: Plats rapides pour Rush Hour
  Query: maxTime (15 ou 30)
  Response: EnrichedDish[]
  Logique:
    1. GET /api/dishes
    2. Filter par prepTime <= maxTime

GET /api/dishes/kid-friendly
  Description: Plats adaptés aux enfants
  Response: EnrichedDish[]
  Logique:
    1. GET /api/dishes
    2. Filter par kidFriendly === true

GET /api/suggestions
  Description: Suggestions intelligentes
  Response: {
    specialOfDay: EnrichedDish,
    topPopular: EnrichedDish[],
    trending: EnrichedDish[]
  }
  Logique:
    1. specialOfDay: dish_metadata.isSpecialOfDay === true
    2. topPopular: popularity >= 4, sort desc
    3. trending: order_statistics.weeklyOrders > 10, sort desc

GET /api/dishes/search?ingredient=tomate
  Description: Recherche par ingrédient
  Query: ingredient
  Response: EnrichedDish[]
  Logique: ingredients array contains query

POST /api/analytics/track-order
  Description: Enregistre une commande pour analytics
  Body: { menuItemId: string }
  Response: 201 Created
  Logique:
    1. Increment order_statistics.orderCount
    2. Update order_statistics.lastOrdered
    3. Recalcul trending si nécessaire

GET /api/child-rewards/:deviceId
  Description: Récupère les étoiles d'un enfant
  Response: { starsEarned: number, lastVisit: Date }

POST /api/child-rewards/:deviceId/add-star
  Description: Ajoute une étoile
  Response: { starsEarned: number }
```

---

## 12. DIAGRAMMES DE SÉQUENCE

### Rush Hour Mode

```
Frontend         BFF              Gateway         Menu Service
   │              │                  │                  │
   │ 1. GET /api/dishes/rush-hour?maxTime=30           │
   ├─────────────>│                  │                  │
   │              │ 2. GET /menus    │                  │
   │              ├─────────────────>├─────────────────>│
   │              │                  │                  │ MongoDB
   │              │ MenuItem[]       │                  │ Query
   │              │<─────────────────┤<─────────────────┤
   │              │                  │                  │
   │              │ 3. Enrichissement côté BFF          │
   │              │    Pour chaque MenuItem:            │
   │              │    - Query dish_metadata collection │
   │              │    - Merge données                  │
   │              │                  │                  │
   │              │ 4. Filtrage BFF  │                  │
   │              │    .filter(d => d.prepTime <= 30)   │
   │              │                  │                  │
   │ EnrichedDish[]                  │                  │
   │<─────────────┤                  │                  │
   │              │                  │                  │
   │ 5. Affichage │                  │                  │
```

### Suggestions avec Analytics

```
Frontend         BFF                   Gateway         Order Stats
   │              │                       │                  │
   │ 1. GET /api/suggestions              │                  │
   ├─────────────>│                       │                  │
   │              │ 2. GET /menus         │                  │
   │              ├──────────────────────>│                  │
   │              │<──────────────────────┤                  │
   │              │                       │                  │
   │              │ 3. Query MongoDB BFF  │                  │
   │              │    - dish_metadata (isSpecialOfDay)     │
   │              │    - dish_metadata (popularity >= 4)    │
   │              ├─────────────────────────────────────────>│
   │              │ 4. Query order_statistics               │
   │              │    .find({ weeklyOrders: { $gt: 10 } }) │
   │              │    .sort({ weeklyOrders: -1 })          │
   │              │<─────────────────────────────────────────┤
   │              │                       │                  │
   │              │ 5. Agrégation         │                  │
   │              │    specialOfDay + topPopular + trending │
   │              │                       │                  │
   │ { specialOfDay, topPopular, trending }                 │
   │<─────────────┤                       │                  │
```

### Track Order (Analytics)

```
Frontend         BFF              Order Stats      Menu Service
   │              │                     │                 │
   │ 1. Commande passée                │                 │
   │              │                     │                 │
   │ 2. POST /api/analytics/track-order│                 │
   │    { menuItemId: "abc123" }       │                 │
   ├─────────────>│                     │                 │
   │              │ 3. Update MongoDB   │                 │
   │              ├────────────────────>│                 │
   │              │ {                   │                 │
   │              │   $inc: { orderCount: 1,              │
   │              │           weeklyOrders: 1 },          │
   │              │   $set: { lastOrdered: new Date() }   │
   │              │ }                   │                 │
   │              │<────────────────────┤                 │
   │              │                     │                 │
   │ 201 Created  │                     │                 │
   │<─────────────┤                     │                 │
```

---

## 13. CONFIGURATION DOCKER

```yaml
# docker-compose-bff.yml
version: '3.8'

services:
  bff:
    build:
      context: ./bff-service
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - MONGODB_URI=mongodb://mongo-bff:27017/bff
      - GATEWAY_URL=http://gateway:9500
      - NODE_ENV=production
    depends_on:
      - mongo-bff
    networks:
      - restaurant-network

  mongo-bff:
    image: mongo:4.4.15
    ports:
      - "27021:27017"
    volumes:
      - bff-mongo-data:/data/db
    networks:
      - restaurant-network

volumes:
  bff-mongo-data:

networks:
  restaurant-network:
    external: true
```

**Démarrage** :
```bash
cd bff-service
npm install
docker-compose -f docker-compose-bff.yml up -d
```

---

## 14. CHECKLIST + AVANTAGES/LIMITES

### Implémentation (1-2 semaines)

**Semaine 1 : Setup BFF** :
- [ ] Créer projet NestJS : `nest new bff-service`
- [ ] Configurer MongoDB avec Mongoose
- [ ] Créer 4 schemas (dish_metadata, restaurant_config, order_statistics, child_rewards)
- [ ] Implémenter service d'appel au Gateway
- [ ] Créer endpoint `GET /api/dishes` avec enrichissement

**Semaine 2 : Endpoints + Docker** :
- [ ] Implémenter `GET /api/dishes/rush-hour`
- [ ] Implémenter `GET /api/suggestions` avec analytics
- [ ] Implémenter `POST /api/analytics/track-order`
- [ ] Créer docker-compose-bff.yml
- [ ] Tests d'intégration
- [ ] Peupler dish_metadata pour 20+ plats

### Avantages ✅

- Aucune modification backend existant (respect architecture microservices)
- Données dynamiques en base (modifiables sans rebuild)
- Suggestions intelligentes basées sur analytics réels
- Scalable : peut servir plusieurs clients (web, mobile, tablettes)
- Séparation des préoccupations (métadonnées frontend isolées)
- Idéal pour production

### Limites ❌

- Architecture complexe (1 service + MongoDB supplémentaire)
- Coût infrastructure (serveur + DB additionnelle)
- Temps de développement long (1-2 semaines)
- Performance : 2 appels réseau (Frontend → BFF → Gateway)
- Maintenance de la cohérence entre MenuItem et dish_metadata

---

# SOLUTION 3 : ÉVOLUTION MICROSERVICES

## 15. SCHEMA ENRICHI + NOUVEAUX ENDPOINTS

**Principe** : Modifier le Menu Service existant pour enrichir le schema MenuItem et ajouter endpoints de filtrage.

### Schema MongoDB Enrichi

```typescript
// Menu Service - Collection: menuitems (MODIFIÉ)
{
  _id: ObjectId,
  // Champs existants
  fullName: string,
  shortName: string,
  price: number,
  category: string,
  image: string,
  
  // NOUVEAUX CHAMPS
  prepTime: number,          // Temps préparation (minutes)
  popularity: number,        // Note 1-5
  kidFriendly: boolean,
  isSpecialOfDay: boolean,
  ingredients: string[],
  isVegetarian: boolean,
  isVegan: boolean,
  isGlutenFree: boolean,
  allergens: string[],
  description: string,
  calories: number,
  
  // Champs techniques
  createdAt: Date,
  updatedAt: Date
}
```

### Nouveaux Endpoints Menu Service

```yaml
# Endpoints AJOUTÉS au Menu Service (Port 3000)

GET /menus/rush-hour?maxTime=30
  Description: Plats rapides filtrés en DB
  Query: maxTime (15 ou 30)
  Response: MenuItem[]
  MongoDB: { prepTime: { $lte: maxTime } }

GET /menus/kid-friendly
  Description: Plats pour enfants
  Response: MenuItem[]
  MongoDB: { kidFriendly: true }

GET /menus/special-of-day
  Description: Plat du jour
  Response: MenuItem
  MongoDB: { isSpecialOfDay: true }

GET /menus/popular?minRating=4
  Description: Plats populaires
  Query: minRating (défaut 4)
  Response: MenuItem[]
  MongoDB: { popularity: { $gte: minRating } }
       .sort({ popularity: -1 })

GET /menus/search?ingredient=tomate
  Description: Recherche par ingrédient
  Query: ingredient
  Response: MenuItem[]
  MongoDB: { ingredients: { $regex: /tomate/i } }

GET /menus/dietary-filters?vegetarian=true&glutenFree=true
  Description: Filtres diététiques combinés
  Query: vegetarian, vegan, glutenFree
  Response: MenuItem[]
  MongoDB: { $and: [{ isVegetarian: true }, { isGlutenFree: true }] }
```

**Routes Gateway (à ajouter)** :
```typescript
// gateway/src/menu/menu.controller.ts
@Get('menus/rush-hour')
@Get('menus/kid-friendly')
@Get('menus/special-of-day')
@Get('menus/popular')
@Get('menus/search')
@Get('menus/dietary-filters')
```

---

## 16. DIAGRAMMES DE SÉQUENCE

### Rush Hour Mode

```
Frontend         Gateway          Menu Service (MODIFIÉ)
   │               │                      │
   │ 1. GET /menus/rush-hour?maxTime=30  │
   ├──────────────>├─────────────────────>│
   │               │                      │
   │               │ 2. MongoDB Query Optimisé
   │               │    db.menuitems.find({
   │               │      prepTime: { $lte: 30 }
   │               │    })               │
   │               │                      │
   │               │ MenuItem[] enrichis  │
   │               │<─────────────────────┤
   │ MenuItem[]    │                      │
   │<──────────────┤                      │
   │               │                      │
   │ 3. Affichage direct (pas d'enrichissement frontend)
```

### Child Mode

```
Frontend         Gateway          Menu Service (MODIFIÉ)
   │               │                      │
   │ 1. GET /menus/kid-friendly           │
   ├──────────────>├─────────────────────>│
   │               │                      │
   │               │ 2. MongoDB Query     │
   │               │    { kidFriendly: true }
   │               │                      │
   │               │ MenuItem[] enrichis  │
   │ MenuItem[]    │<─────────────────────┤
   │<──────────────┤                      │
   │               │                      │
   │ 3. Interface simplifiée              │
```

### Suggestions Intelligentes

```
Frontend         Gateway          Menu Service (MODIFIÉ)
   │               │                      │
   │ 1. GET /menus/special-of-day         │
   ├──────────────>├─────────────────────>│
   │               │<─────────────────────┤
   │ Plat du jour  │                      │
   │<──────────────┤                      │
   │               │                      │
   │ 2. GET /menus/popular?minRating=4    │
   ├──────────────>├─────────────────────>│
   │               │    { popularity: { $gte: 4 } }
   │               │    .sort({ popularity: -1 })
   │               │    .limit(3)         │
   │               │<─────────────────────┤
   │ Top 3 plats   │                      │
   │<──────────────┤                      │
   │               │                      │
   │ 3. Agrégation côté frontend          │
```

---

## 17. SCRIPT DE MIGRATION

```javascript
// migration-enrich-menuitems.js
// Exécuter avec: mongo < migration-enrich-menuitems.js

use menuService;

// Backup collection avant migration
db.menuitems.aggregate([{ $out: "menuitems_backup" }]);

// Ajout des nouveaux champs
db.menuitems.updateMany(
  {},
  {
    $set: {
      prepTime: 30,           // Défaut
      popularity: 3,          // Défaut
      kidFriendly: false,
      isSpecialOfDay: false,
      ingredients: [],
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      allergens: [],
      description: "",
      calories: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
);

// Mise à jour spécifique pour plats connus
db.menuitems.updateOne(
  { shortName: "Steak Frites" },
  {
    $set: {
      prepTime: 25,
      popularity: 5,
      kidFriendly: true,
      ingredients: ["Steak de boeuf", "Pommes de terre", "Sel", "Poivre"],
      isGlutenFree: true,
      description: "Steak grillé avec frites maison",
      calories: 850
    }
  }
);

db.menuitems.updateOne(
  { shortName: "Pizza Margherita" },
  {
    $set: {
      prepTime: 18,
      popularity: 5,
      kidFriendly: true,
      ingredients: ["Pâte", "Tomate", "Mozzarella", "Basilic"],
      isVegetarian: true,
      allergens: ["gluten", "dairy"],
      description: "Pizza classique tomate mozzarella",
      calories: 720
    }
  }
);

// Vérification
print("Migration completed. Total documents:", db.menuitems.count());
print("Sample document:");
printjson(db.menuitems.findOne());
```

**Rollback si problème** :
```javascript
use menuService;
db.menuitems.drop();
db.menuitems_backup.aggregate([{ $out: "menuitems" }]);
```

---

## 18. IMPLÉMENTATION BACKEND

### Modifications Menu Service

```typescript
// menu-service/src/menu/menu.entity.ts (MODIFIÉ)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  shortName: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, enum: ['STARTER', 'MAIN', 'DESSERT', 'BEVERAGE'] })
  category: string;

  @Prop({ required: true })
  image: string;

  // NOUVEAUX CHAMPS
  @Prop({ default: 30 })
  prepTime: number;

  @Prop({ default: 3, min: 1, max: 5 })
  popularity: number;

  @Prop({ default: false })
  kidFriendly: boolean;

  @Prop({ default: false })
  isSpecialOfDay: boolean;

  @Prop({ type: [String], default: [] })
  ingredients: string[];

  @Prop({ default: false })
  isVegetarian: boolean;

  @Prop({ default: false })
  isVegan: boolean;

  @Prop({ default: false })
  isGlutenFree: boolean;

  @Prop({ type: [String], default: [] })
  allergens: string[];

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 0 })
  calories: number;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
```

```typescript
// menu-service/src/menu/menu.controller.ts (AJOUTS)
@Controller('menus')
export class MenuController {
  // ... endpoints existants ...

  @Get('rush-hour')
  async getRushHourDishes(@Query('maxTime') maxTime: number = 30) {
    return this.menuService.findByPrepTime(maxTime);
  }

  @Get('kid-friendly')
  async getKidFriendlyDishes() {
    return this.menuService.findKidFriendly();
  }

  @Get('special-of-day')
  async getSpecialOfDay() {
    return this.menuService.findSpecialOfDay();
  }

  @Get('popular')
  async getPopularDishes(@Query('minRating') minRating: number = 4) {
    return this.menuService.findPopular(minRating);
  }

  @Get('search')
  async searchByIngredient(@Query('ingredient') ingredient: string) {
    return this.menuService.searchByIngredient(ingredient);
  }
}
```

---

## 19. CHECKLIST + AVANTAGES/LIMITES

### Implémentation (3-5 jours)

**Jour 1-2 : Schema + Migration** :
- [ ] Modifier `menu.entity.ts` avec nouveaux champs
- [ ] Créer script `migration-enrich-menuitems.js`
- [ ] Backup DB : `db.menuitems.aggregate([{ $out: "menuitems_backup" }])`
- [ ] Exécuter migration
- [ ] Vérifier données : `db.menuitems.findOne()`

**Jour 3-4 : Nouveaux Endpoints** :
- [ ] Implémenter `findByPrepTime()` dans `menu.service.ts`
- [ ] Implémenter `findKidFriendly()`, `findSpecialOfDay()`, `findPopular()`
- [ ] Implémenter `searchByIngredient()`
- [ ] Ajouter routes dans `menu.controller.ts`
- [ ] Ajouter forwards dans Gateway

**Jour 5 : Tests** :
- [ ] Tests unitaires des nouveaux endpoints
- [ ] Tests d'intégration (Postman/Jest)
- [ ] Tests de régression (endpoints existants)
- [ ] Mise à jour documentation API

### Avantages ✅

- Architecture simplifiée (pas de BFF)
- Performance optimale (1 seul appel HTTP, filtrage en DB)
- Single source of truth (tout dans Menu Service)
- Queries MongoDB optimisées (indexes possibles)
- Cohérence garantie des données

### Limites ❌

- **Modification backend existant** (nécessite droits + coordination équipe)
- Couplage accru frontend/backend
- Migration de données nécessaire (risque si DB production)
- Tests de régression importants (impact sur code existant)
- Pas de suggestions "trending" intelligentes (nécessiterait analytics)

---

# CONCLUSION ET RECOMMANDATIONS

## 20. SYNTHÈSE COMPARATIVE

| Critère | Solution 1 | Solution 2 | Solution 3 |
|---------|------------|------------|------------|
| **Délai** | 1-2 jours | 1-2 semaines | 3-5 jours |
| **Complexité** | ⭐ Faible | ⭐⭐⭐ Élevée | ⭐⭐ Moyenne |
| **Backend modifié** | ❌ Non | ❌ Non | ✅ Oui (important) |
| **Données dynamiques** | ❌ Statiques | ✅ Oui (MongoDB) | ✅ Oui (MongoDB) |
| **Analytics réels** | ❌ Non | ✅ Oui | ⭐ Possible (dev supplémentaire) |
| **Performance** | ⭐⭐⭐ Excellent | ⭐⭐ Moyen (2 appels) | ⭐⭐⭐ Excellent (1 appel) |
| **Scalabilité** | ❌ Non | ✅ Oui | ⭐ Moyenne |
| **Coût infra** | Minimal | Élevé (+1 service +1 DB) | Minimal |
| **Maintenance** | ⭐ Difficile | ⭐⭐⭐ Facile | ⭐⭐ Moyenne |

## 21. DÉCISION SELON CONTEXTE

### 🎓 Projet Étudiant / POC
**→ Solution 1 (Enrichissement Frontend)**
- Rapidité d'implémentation (1-2 jours)
- Pas de modification backend
- Suffisant pour démonstration des 4 adaptations
- Accepter la limite des données statiques

### 🏢 Production Réelle / Startup
**→ Solution 2 (BFF)**
- Maintenabilité à long terme
- Analytics et suggestions intelligentes
- Scalable (multi-clients : web, mobile, kiosques)
- Séparation des préoccupations

### 🔧 Contrôle Total Backend
**→ Solution 3 (Évolution Microservices)**
- Architecture simplifiée (pas de couche intermédiaire)
- Performance optimale
- Single source of truth
- Si droits modification backend disponibles

## 22. CHECKLIST GLOBALE D'IMPLÉMENTATION

### Solution Choisie : __________

**Phase 1 : Préparation**
- [ ] Valider les prérequis techniques
- [ ] Obtenir accès infrastructure (si nécessaire)
- [ ] Backup bases de données (si applicable)
- [ ] Définir environnement de test

**Phase 2 : Développement**
- [ ] Suivre checklist spécifique à la solution
- [ ] Tests unitaires au fil du développement
- [ ] Documentation du code

**Phase 3 : Intégration**
- [ ] Tests d'intégration frontend/backend
- [ ] Tests des 4 adaptations :
  - [ ] Rush Hour Mode
  - [ ] Child Mode
  - [ ] Suggestions Panel
  - [ ] Advanced Filters
- [ ] Tests de performance

**Phase 4 : Déploiement**
- [ ] Configuration Docker (si applicable)
- [ ] Déploiement environnement de staging
- [ ] Tests acceptance utilisateur
- [ ] Déploiement production

---

**Document réalisé par** : Équipe Technique  
**Date** : 16 janvier 2026  
**Version** : 1.0 - Cahier des Charges Synthétique  

**Contact** : Pour questions techniques sur l'implémentation, consulter les sections détaillées de chaque solution.

