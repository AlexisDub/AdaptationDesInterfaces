# Documentation d'Intégration Backend

## Vue d'ensemble
Ce document trace toutes les adaptations nécessaires pour intégrer le backend fourni par le professeur avec notre frontend existant.

## Architecture Backend
3 microservices:
- **Menu Service**: Gestion des items du menu
- **Dining Service**: Gestion des tables et commandes
- **Kitchen Service**: Gestion des préparations cuisine

## Différences Backend ↔ Frontend

### Menu Items (Plats)

#### Backend fournit:
```typescript
{
  _id: string;           // ID MongoDB
  fullName: string;      // Nom complet
  shortName: string;     // Nom court
  price: number;         // Prix
  category: "STARTER" | "MAIN" | "DESSERT" | "BEVERAGE";
  image: string;         // URL image
}
```

#### Frontend a besoin de:
```typescript
{
  id: string;
  name: string;
  description: string;    // ❌ MANQUANT
  price: number;
  category: string;
  imageUrl: string;
  ingredients: string[];  // ❌ MANQUANT
  allergens: string[];    // ❌ MANQUANT
  prepTime: number;       // ❌ MANQUANT (mais existe dans Kitchen Service)
  isSpicy: boolean;       // ❌ MANQUANT
}
```

### Tables

#### Backend fournit:
```typescript
{
  _id: string;
  number: number;
  taken: boolean;
  tableOrderId: string;
}
```

✅ Compatible avec notre système de sélection de table

### Commandes (TableOrders)

#### Backend fournit:
```typescript
{
  _id: string;
  tableNumber: number;
  customersCount: number;
  opened: Date;
  lines: [{
    item: { _id: string, shortName: string },
    howMany: number,
    sentForPreparation: boolean
  }],
  preparations: [...],
  billed: Date
}
```

#### Adaptation nécessaire:
- Notre `CartItem[]` → Backend `lines[]`
- Notre `quantity` → Backend `howMany`
- Notre `dish` complet → Backend `item` (juste _id et shortName)

## Solution: Base de Données Frontend (Enrichissement Local)

### Fichier: `src/data/dishEnrichment.ts`
Contient les données manquantes indexées par `shortName` du backend:
- descriptions
- ingrédients
- allergènes
- propriétés (épicé, etc.)

### Fichier: `src/services/backendAPI.ts`
Services pour communiquer avec les 3 microservices

### Fichier: `src/services/dishMapper.ts`
Transforme les données backend + enrichissement local → format frontend

## Flux de Données

```
Backend Menu Service
      ↓
GET /menus → MenuItem[] (partiel)
      ↓
dishMapper.enrichDish(backendItem, localEnrichment)
      ↓
Dish (complet) → Utilisé dans l'application
```

## État de l'Intégration

### ✅ Complété
- [ ] Configuration des URLs de microservices
- [ ] Service API Menu Service
- [ ] Service API Dining Service
- [ ] Service API Kitchen Service
- [ ] Base de données d'enrichissement local
- [ ] Mapper Backend → Frontend
- [ ] Adaptation des composants existants
- [ ] Tests de bout en bout

### 🔄 En cours
- Documentation de l'intégration

### ⏳ À faire
- Tout le reste

## Notes Importantes

1. **Création de plats**: Le backend permet POST /menus pour ajouter des items, mais on doit aussi mettre à jour notre enrichissement local

2. **PrepTime**: Existe dans Kitchen Service (`meanCookingTimeInSec` dans Recipe) mais pas dans Menu Service

3. **Mode Rush**: Notre simulation locale restera, le backend ne gère pas ce concept

4. **Table Tactile**: Mode complètement frontend, utilise les mêmes services que tablette/smartphone

## Configuration Backend

```typescript
// URLs des microservices (à configurer selon l'environnement)
const MENU_SERVICE_URL = "http://localhost:3001";      // À définir
const DINING_SERVICE_URL = "http://localhost:3002";     // À définir
const KITCHEN_SERVICE_URL = "http://localhost:3003";    // À définir
```
