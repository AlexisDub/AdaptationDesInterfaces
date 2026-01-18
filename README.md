Accès mode tablette : 

http://localhost:3003/?mode=tablet

Accès mode smartphone : 

http://localhost:3003?mode=phone

Accès mode table tactile : 

http://localhost:3003?idtable=5

# 🍽️ Projet Adaptation des Interfaces - Restaurant

Application de commande pour restaurant avec 3 interfaces adaptées : Table Tactile, Tablette, Smartphone.

---

## 📚 DOCUMENTATION - PAR OÙ COMMENCER ?

### 🎯 Nouveau dans le projet ?
👉 **[README_ALEXIS.md](./README_ALEXIS.md)** - Commencez ici ! Récap complet de l'intégration backend

### ⚡ Besoin d'un guide rapide ?
👉 **[QUICKSTART.md](./QUICKSTART.md)** - En 30 secondes, comprenez le mode MOCK vs BACKEND

### 📖 Documentation complète

| Fichier | Description | Quand l'utiliser |
|---------|-------------|------------------|
| **[README_ALEXIS.md](./README_ALEXIS.md)** | 🎯 Récap complet pour Alexis | **Commence ici !** |
| [QUICKSTART.md](./QUICKSTART.md) | ⚡ Guide ultra-rapide | Démarrage express |
| [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md) | 📋 Vue d'ensemble de l'intégration | Comprendre l'architecture |
| [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) | 📖 Guide pratique backend | Utilisation quotidienne |
| [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) | 📐 Schémas visuels | Présentation/Rapport |
| [TODO_INTEGRATION.md](./TODO_INTEGRATION.md) | ✅ Checklist adaptations | Suite du projet |
| [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) | 🔧 Documentation technique | Référence technique |
| [FILES_CREATED.md](./FILES_CREATED.md) | 📋 Liste des fichiers | Comprendre la structure |

---

## 🚀 Démarrage rapide

### Installation
```bash
npm install
```

### Lancement
```bash
npm run dev
```

Application disponible sur: `http://localhost:3003`

## 📱 Modes d'utilisation

### 🖥️ Mode Table Tactile (Défaut)
URL: `http://localhost:3003/`
- Interface collaborative pour 4 personnes autour d'une table
- Chaque personne a sa zone personnelle (rotations automatiques)
- Panier partagé au centre
- Paiement individuel ou groupé

### 📱 Mode Tablette (Serveur)
URL: `http://localhost:3003/?mode=tablet`
- Le serveur saisit le numéro de table
- Puis donne la tablette au client pour sélectionner le mode (Parent/Enfant)
- Interface optimisée pour tablette horizontale

### 📱 Mode Téléphone (Client)
URL: `http://localhost:3003/?mode=phone&idtable=X`
- Les clients scannent un QR code
- Arrive directement sur l'écran de sélection du mode
- Le numéro de table est automatiquement détecté
- Interface optimisée pour smartphone vertical

## 🔧 Configuration Backend

L'application peut fonctionner en 2 modes:

### Mode MOCK (Données locales - Par défaut)
```env
# .env
VITE_USE_MOCK_DATA=true
```
✅ Recommandé pour le développement
✅ Aucun backend requis
✅ Données de démo complètes

### Mode BACKEND (Microservices réels)
```env
# .env
VITE_USE_MOCK_DATA=false
VITE_MENU_SERVICE_URL=http://localhost:3001
VITE_DINING_SERVICE_URL=http://localhost:3002
VITE_KITCHEN_SERVICE_URL=http://localhost:3004
```

**📖 Documentation complète:** Consultez [`INTEGRATION_SUMMARY.md`](./INTEGRATION_SUMMARY.md)

## 📚 Documentation

| Fichier | Description |
|---------|-------------|
| **[INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)** | 🎯 **COMMENCEZ ICI** - Récapitulatif complet de l'intégration backend |
| [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) | Guide pratique d'utilisation du backend |
| [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) | Documentation technique détaillée |
| [TODO_INTEGRATION.md](./TODO_INTEGRATION.md) | Checklist des adaptations à faire |
| [PWA-TESTING.md](./PWA-TESTING.md) | Tests de l'application web progressive |

## 🧪 Tests Backend (Console)

Ouvrez la console navigateur (F12) et utilisez:
```javascript
// Afficher les commandes disponibles
backendTest.showStatus()

// Tester la connexion
await backendTest.testBackendConnection()

// Tester le chargement des plats
await backendTest.testDishLoading()

// Tester un cycle complet de commande
await backendTest.testOrderFlow(1)
```

## 🏗️ Architecture

```
Frontend (React + TypeScript + Vite)
│
├─ 3 Interfaces
│  ├─ Table Tactile (4 joueurs)
│  ├─ Tablette (mode parent/enfant)
│  └─ Smartphone (mode parent/enfant)
│
├─ Services
│  ├─ dishService.ts (chargement unifié)
│  ├─ backendAPI.ts (3 microservices)
│  ├─ dishMapper.ts (transformation données)
│  └─ backendTestUtils.ts (tests)
│
├─ Données
│  ├─ dishes.ts (mock local)
│  └─ dishEnrichment.ts (enrichissement)
│
└─ Backend (optionnel)
   ├─ Menu Service
   ├─ Dining Service
   └─ Kitchen Service
```

## 🎯 Fonctionnalités

### ✅ Implémenté
- 3 interfaces adaptatives (table/tablette/smartphone)
- Mode parent et mode enfant
- Filtres avancés (végétarien, épicé, rapide, etc.)
- Recherche par ingrédients
- Suggestions intelligentes
- Mode Rush automatique (simulation)
- Panier personnel et partagé (table tactile)
- Paiement individuel et groupé
- PWA (application installable)
- Intégration backend complète (architecture)

### 🔄 En cours
- Adaptation des composants pour utiliser le backend réel
- Drag & drop panier personnel → partagé (table tactile)

## 💻 Stack Technique

- **Framework:** React 18.3.1 + TypeScript
- **Build:** Vite 6.3.5
- **Styling:** TailwindCSS
- **Icons:** Lucide React
- **Routing:** URL params
- **State:** React hooks (useState, useEffect)
- **Backend:** Fetch API + REST

## 📦 Structure du Projet

```
src/
├── components/          # Composants React
│   ├── ui/             # Composants UI réutilisables
│   ├── MenuInterface.tsx
│   ├── MenuView.tsx
│   ├── CartSidebar.tsx
│   └── ...
├── services/           # Services API et logique métier
│   ├── backendAPI.ts
│   ├── dishMapper.ts
│   ├── dishService.ts
│   └── backendTestUtils.ts
├── data/              # Données et enrichissements
│   ├── dishes.ts
│   ├── dishEnrichment.ts
│   └── rushService.ts
├── config/            # Configuration
│   └── backendConfig.ts
├── types/             # Types TypeScript
│   └── backend.ts
├── App.tsx            # Composant principal
└── main.tsx           # Point d'entrée
```

## 🎨 Adaptations des Interfaces

### Table Tactile
- Layout fixe 1600x900px
- 4 zones personnelles (rotation 180° pour joueurs du haut)
- Panier partagé split gauche/droite (rotation)
- Affichage compact des items
- Détails produit dans la zone personnelle

### Tablette
- Affichage paysage optimisé
- Navigation fluide
- Mode plein écran en PWA
- Verrouillage orientation paysage

### Smartphone
- Affichage portrait optimisé
- Interface simplifiée
- Gestion tactile
- Mode plein écran en PWA

## 🧩 Réutilisation des Composants

Les composants sont conçus pour être **réutilisables** avec des props adaptables:

```typescript
<MenuView 
  deviceType="tablet"           // tablet | smartphone | table-tactile
  size="compact"                // normal | compact
  disableModal={true}           // Pour table tactile
  onAddToCart={(dish) => ...}
/>

<DishCard 
  dish={dish}
  size="compact"                // Adapte la taille
  deviceType="tablet"
/>
```

## 🔐 Variables d'Environnement

Créez un fichier `.env` (copie de `.env.example`):
```env
VITE_USE_MOCK_DATA=true
VITE_MENU_SERVICE_URL=http://localhost:3001
VITE_DINING_SERVICE_URL=http://localhost:3002
VITE_KITCHEN_SERVICE_URL=http://localhost:3004
```

## 🐛 Debug

Logs automatiques dans la console:
- Mode actif (MOCK/BACKEND)
- Chargement des données
- Appels API
- Erreurs de connexion
- Enrichissements manquants

## 📝 Prochaines Étapes

1. [ ] Obtenir les URLs du backend du professeur
2. [ ] Tester la connexion avec `backendTest.*`
3. [ ] Adapter les composants pour synchroniser avec le backend
4. [ ] Tests de bout en bout
5. [ ] Déploiement

## 🆘 Support

- 📖 Documentation: Voir fichiers `.md` à la racine
- 🐛 Issues: Via GitHub
- 💬 Questions: Consultez `INTEGRATION_SUMMARY.md`

## 📄 Licence

Projet éducatif - IUT

---

**🎓 Projet réalisé dans le cadre du cours "Adaptation des Interfaces"**
