# 🍽️ Restaurant Le Gourmet - Présentation Rapide

## 📱 CONCEPT

Interface de commande de restaurant **adaptive** qui s'adapte automatiquement selon :
- 📱 **Appareil** : Tablette (paysage) / Smartphone (portrait)
- 👤 **Utilisateur** : Adulte / Enfant
- 🔥 **Affluence** : Mode Rush activé dynamiquement

---

## 🎯 LES 3 MODES PRINCIPAUX

### 1️⃣ MODE ADULTE (Normal)
**Pour qui ?** Adultes, prise de commande rapide

**Fonctionnalités** :
- 📂 Filtrage hiérarchique (Catégories → Sous-catégories)
- 🔍 Recherche d'ingrédients (inclusion/exclusion)
- 🎚️ Filtres avancés (végétarien, sans gluten, etc.)
- 💡 Détection d'hésitation → Suggestions automatiques
- 🛒 Panier latéral (tablette) ou pleine page (mobile)

**Exemple** :
```
Entrées → Salades → Salade César ✅
         ↑
    [Soupes, Tartines, Viandes, Poissons, Œufs]
```

---

### 2️⃣ MODE RUSH (Heures de pointe)
**Quand ?** Activé automatiquement si > 10 commandes en cours

**Spécificités** :
- ⚠️ Bannière d'avertissement visible
- ⚡ Filtre automatique : uniquement les plats **rapides** (< 10 min)
- ⏱️ Affichage du temps de préparation sur chaque plat
- 🎯 Suggestions prioritaires

**Détection dynamique** :
```javascript
// Vérifie toutes les 10 secondes
setInterval(async () => {
  const status = await getRushStatus();
  if (status.ordersInProgress > 10) {
    activateRushMode(); // 🔥
  }
}, 10000);
```

**Pourquoi ?** 
- Accélère le service pendant les pics
- Réduit les temps d'attente
- Améliore l'expérience client

---

### 3️⃣ MODE ENFANT (Chef Léo)
**Pour qui ?** Enfants 6-12 ans

**Concept** : Questionnaire gamifié guidé par **Chef Léo** 👨‍🍳

**Parcours** :
```
1. 👋 Accueil Chef Léo
2. 🥗 Choix Entrée  → +2 ⭐
3. 🍽️  Choix Plat    → +4 ⭐
4. 🍰 Choix Dessert → +2 ⭐
5. 🎁 Récompenses  (dépenser étoiles)
6. 🛒 Panier
```

**Gamification** :
- ⭐ **Système d'étoiles** : 8 étoiles max
- 🎁 **Récompenses** : Cookie, Milk-shake, Badge, Coloriage, Couronne
- 🎉 **Animations** : Confettis à chaque sélection
- 🔄 **Cartes flip** : Retourner pour voir détails
- 🍽️ **Assiette virtuelle** : Visualisation des choix

**Protection** : Les cadeaux gratuits ne peuvent pas être supprimés du panier

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack
```
React 18 + TypeScript
├── Vite 6 (build)
├── Tailwind CSS 4 (styling)
├── Motion (animations)
├── Lucide React (icônes)
└── Unsplash (images CDN)
```

### Structure des données
```
/data
├── restaurant-data.ts    ← Source unique de vérité (46 plats)
├── dataLoader.ts         ← Fonctions utilitaires
├── dishes.ts             ← Types TypeScript
└── rushService.ts        ← Gestion du mode Rush
```

### Composants principaux
```
App.tsx                   ← État global
└── DeviceSelector        ← Tablette / Smartphone
└── ModeSelectionScreen   ← Adulte / Enfant
└── MenuInterface         ← Chef d'orchestre
    ├── MenuView          ← Mode Adulte
    ├── RushHourMode      ← Mode Rush
    ├── ChildMode         ← Mode Enfant
    ├── CartSidebar       ← Panier (tablette)
    └── CartPage          ← Panier (mobile)
```

---

## 📊 DONNÉES DU MENU

### 46 plats au total

**12 Entrées** (6 sous-catégories)
- Salades : Salade César, Salade Grecque
- Soupes : Soupe à l'oignon, Velouté de légumes
- Tartines : Bruschetta
- Viandes : Carpaccio de bœuf
- Poissons : Tartare de saumon
- Œufs : Œuf cocotte

**22 Plats principaux** (6 sous-catégories)
- Viandes : Bœuf bourguignon, Magret de canard, Côte de veau...
- Poissons : Saumon grillé, Dorade royale, Loup de mer...
- Végétariens : Risotto aux champignons, Lasagnes végétariennes...
- Pâtes : Spaghetti carbonara, Penne arrabbiata...
- Burgers : Burger classique, Burger végétarien...
- Plats du monde : Pad thaï, Tajine d'agneau...

**12 Desserts** (5 sous-catégories)
- Chocolat : Fondant au chocolat, Mousse
- Fruits : Tarte aux pommes, Salade de fruits
- Glaces : Coupe glacée, Profiteroles
- Pâtisseries : Crème brûlée, Tiramisu
- Fromages : Plateau de fromages

### Métadonnées par plat
```typescript
{
  id: "e1",
  name: "Salade César",
  description: "...",
  category: "entrée",
  subcategory: "Salades",
  price: 9.50,
  prepTime: 8,              // Minutes
  popularity: 5,            // 1-5
  isSpecialOfDay: false,
  isQuick: true,            // < 10 min
  imageUrl: "https://...",
  kidFriendly: true,
  hasVegetables: true,
  ingredients: ["laitue", "poulet", "parmesan"],
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  spicyLevel: 0,            // 0-3
  isLight: true,
  isLocal: false,
  cuisine: "française"
}
```

---

## 🔍 FONCTIONNALITÉS CLÉS

### 1. Détection d'hésitation
**Quand ?** Utilisateur reste > 15 secondes sans sélection

**Réaction** : Affiche automatiquement des suggestions
- Plats populaires (popularité ≥ 4)
- Plats du jour
- Plats rapides (si mode Rush)

**Code** :
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    if (cart.length === 0) {
      const suggestions = dishes
        .filter(d => d.category === activeCategory && d.popularity >= 4)
        .slice(0, 3);
      setSuggestions(suggestions);
    }
  }, 15000);
  return () => clearTimeout(timer);
}, [activeCategory, cart]);
```

---

### 2. Recherche d'ingrédients

**Mode Inclusion** : "Je veux des plats AVEC tomate"
```typescript
searchDishesByIngredients("tomate", "include")
// → Tous les plats contenant "tomate"
```

**Mode Exclusion** : "Je ne veux PAS de noix"
```typescript
searchDishesByIngredients("noix", "exclude")
// → Tous les plats SANS "noix"
```

**UI** :
```
┌─────────────────────────────────────┐
│ 🔍 Rechercher un ingrédient        │
│ [tomate_____________] [✅ Avec ▼]  │
└─────────────────────────────────────┘
```

---

### 3. Filtrage hiérarchique

**Niveau 1** : Catégorie
```
[Entrées] [Plats] [Desserts]
```

**Niveau 2** : Sous-catégorie
```
Entrées sélectionnées
  → [Salades] [Soupes] [Tartines] [Viandes] [Poissons] [Œufs]
```

**Niveau 3** : Filtres avancés
```
☑️ Végétarien
☑️ Sans gluten
☐ Végétalien
☐ Léger
☐ Local
```

**Niveau 4** : Recherche d'ingrédients
```
🔍 "tomate" [✅ Avec]
```

**Résultat** : Plats qui matchent TOUS les critères

---

### 4. Mode Rush dynamique

**Vérification** : Toutes les 10 secondes
```javascript
// rushService.ts
export const RUSH_THRESHOLD = 10;
export const RUSH_CHECK_INTERVAL = 10000;

export async function getRushStatus() {
  const ordersInProgress = await fetchOrdersCount(); // API
  return {
    ordersInProgress,
    isRushMode: ordersInProgress > RUSH_THRESHOLD,
    threshold: RUSH_THRESHOLD,
    lastUpdate: new Date()
  };
}
```

**Dans App.tsx** :
```typescript
useEffect(() => {
  const check = async () => {
    const status = await getRushStatus();
    setIsRushMode(status.isRushMode);
    setOrdersInProgress(status.ordersInProgress);
  };
  
  check(); // Immédiat
  const interval = setInterval(check, 10000); // Puis toutes les 10s
  return () => clearInterval(interval);
}, []);
```

**Affichage** :
```
┌────────────────────────────────────────────┐
│ 🔥 MODE RUSH ACTIVÉ                        │
│ 15 commandes en cours                      │
│ ⚠️ Nous recommandons les plats rapides    │
│ [Voir sélection rapide →]                 │
└────────────────────────────────────────────┘
```

---

### 5. Système de récompenses enfant

**Gain d'étoiles** :
```
Entrée  → +2 ⭐
Plat    → +4 ⭐
Dessert → +2 ⭐
─────────────
Total     8 ⭐
```

**Récompenses disponibles** :
```typescript
[
  { id: 'r1', name: 'Cookie Géant',  emoji: '🍪', stars: 3 },
  { id: 'r2', name: 'Milk-shake',    emoji: '🥤', stars: 4 },
  { id: 'r3', name: 'Badge Chef',    emoji: '👨‍🍳', stars: 5 },
  { id: 'r4', name: 'Coloriage',     emoji: '🎨', stars: 2 },
  { id: 'r5', name: 'Autocollants',  emoji: '✨', stars: 2 },
  { id: 'r6', name: 'Couronne Chef', emoji: '👑', stars: 8 }
]
```

**Filtrage automatique** :
```typescript
const affordable = rewards.filter(r => r.stars <= myStars);
```

**Conversion en plat gratuit** :
```typescript
function rewardToDish(reward: ChildReward): Dish {
  return {
    id: `reward-${reward.id}`,     // ← Prefix important
    name: `🎁 ${reward.name}`,
    price: 0,                       // ← Gratuit !
    category: 'dessert',
    subcategory: 'Récompenses',
    // ... autres propriétés
  };
}
```

**Protection dans le panier** :
```typescript
const isReward = item.dish.id.startsWith('reward-');

{isReward ? (
  <Badge>🎁 Cadeau - Ne peut pas être supprimé</Badge>
) : (
  <Button onClick={() => removeItem(item.dish.id)}>
    <Trash2 /> Supprimer
  </Button>
)}
```

---

### 6. Adaptation Tablette vs Smartphone

**Tablette (Paysage)** :
```
┌────────────────────────────────────────────────┐
│ Header                                         │
├─────────────────────────────┬──────────────────┤
│                             │                  │
│                             │   🛒 PANIER      │
│        MENU                 │                  │
│    (Grille de plats)        │   Item 1         │
│                             │   Item 2         │
│                             │   Item 3         │
│                             │                  │
│                             │   Total: 42.50€  │
│                             │   [Valider]      │
└─────────────────────────────┴──────────────────┘
```

**Smartphone (Portrait)** :
```
┌──────────────────┐
│     Header       │
├──────────────────┤
│                  │
│      MENU        │
│  (Grille plats)  │
│                  │
│                  │
├──────────────────┤
│ [🛒 Panier (3)]  │ ← Bouton flottant
└──────────────────┘

Clic sur Panier →

┌──────────────────┐
│   ← Retour       │
├──────────────────┤
│  🛒 VOTRE PANIER │
│                  │
│  Item 1          │
│  Item 2          │
│  Item 3          │
│                  │
│  Total: 42.50€   │
│  [Valider]       │
└──────────────────┘
```

**Code** :
```typescript
{deviceType === 'tablet' ? (
  <div className="flex">
    <div className="flex-1">
      <MenuView />
    </div>
    <div className="w-96">
      <CartSidebar />  {/* Fixe à droite */}
    </div>
  </div>
) : (
  <>
    <MenuView />
    <Button 
      className="fixed bottom-4 right-4"
      onClick={() => setViewMode('cart')}
    >
      🛒 Panier ({totalItems})
    </Button>
  </>
)}
```

---

## 🚀 DÉPLOIEMENT VERCEL

### Fichiers de configuration créés

**1. vercel.json**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**2. vite.config.ts**
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react']
        }
      }
    }
  }
});
```

**3. package.json**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build --logLevel warn",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.487.0",
    "sonner": "^2.0.3"
  }
}
```

### Optimisations appliquées

✅ **Suppression de Recharts** : -500KB (inutilisé)
✅ **Code splitting** : vendor.js + icons.js séparés
✅ **Minification** : esbuild (ultra-rapide)
✅ **Sourcemaps désactivées** : -50% de taille
✅ **TypeScript allégé** : skip strict checks

### Résultat

**Bundle final** :
```
dist/
├── index.html                 (2 KB)
├── assets/
│   ├── index-[hash].js       (500 KB → 140 KB gzippé)
│   ├── vendor-[hash].js      (200 KB → 60 KB gzippé)
│   ├── icons-[hash].js       (100 KB → 30 KB gzippé)
│   └── index-[hash].css      (50 KB → 12 KB gzippé)
```

**Performance** :
- 🚀 Build : ~2-3 minutes
- 📦 Total gzippé : ~250KB
- ⚡ First Load : <2 secondes
- 🌍 CDN : Déployé sur 100+ edge locations

---

## 📈 ÉVOLUTIONS FUTURES

### Backend API
```
GET  /api/dishes              → Liste des plats
GET  /api/rush-status         → Nombre de commandes en cours
POST /api/orders              → Créer une commande
GET  /api/orders/:id          → Détails commande
```

### Base de données
```sql
-- Plats
CREATE TABLE dishes (
  id VARCHAR PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  price DECIMAL,
  category VARCHAR,
  subcategory VARCHAR,
  -- ... autres colonnes
);

-- Commandes
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  status VARCHAR,  -- 'pending', 'in_progress', 'completed'
  total_amount DECIMAL,
  customer_name VARCHAR
);

-- Items de commande
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  dish_id VARCHAR REFERENCES dishes(id),
  quantity INT,
  price DECIMAL
);
```

### Fonctionnalités additionnelles
- 🔔 **Notifications** : Alerte quand commande prête
- 💳 **Paiement** : Intégration Stripe
- 📊 **Analytics** : Tableau de bord restaurateur
- 🗣️ **Vocal** : Commande vocale
- 🌐 **Multi-langue** : i18n (FR, EN, ES)
- 👥 **Compte client** : Historique des commandes
- ⭐ **Avis** : Notation des plats

---

## 🎓 POINTS FORTS DU PROJET

### Architecture
✅ **Modulaire** : Composants réutilisables
✅ **Type-safe** : TypeScript partout
✅ **Centralisée** : Source unique de données
✅ **Évolutive** : Facile à migrer vers API

### UX/UI
✅ **Adaptive** : S'adapte au contexte
✅ **Intuitive** : Navigation naturelle
✅ **Rapide** : Temps de chargement optimisé
✅ **Accessible** : Design inclusif

### Technique
✅ **Moderne** : Stack 2024
✅ **Performant** : Bundle optimisé
✅ **Maintenable** : Code clair et commenté
✅ **Déployable** : CI/CD avec Vercel

### Business
✅ **Réduit les temps d'attente** : Mode Rush
✅ **Augmente satisfaction client** : Suggestions intelligentes
✅ **Engage les enfants** : Mode gamifié
✅ **Optimise le service** : Prise de commande rapide

---

## 🎯 DÉMONSTRATION EN 3 MINUTES

**Minute 1 : Mode Adulte**
1. Sélection Tablette + Mode Adulte
2. Navigation dans les catégories
3. Utilisation des filtres
4. Recherche "tomate" en inclusion
5. Ajout au panier
6. Validation

**Minute 2 : Mode Rush**
1. Montrer l'indicateur (15 commandes)
2. Affichage bannière Rush
3. Activation mode Rush
4. Voir uniquement plats rapides
5. Temps de préparation visible

**Minute 3 : Mode Enfant**
1. Sélection Smartphone + Mode Enfant
2. Parcours complet avec Chef Léo
3. Sélection entrée → confettis + étoiles
4. Sélection plat → plus d'étoiles
5. Sélection dessert → menu complet
6. Choix de récompenses
7. Ajout au panier avec cadeau
8. Montrer protection du cadeau

---

**Temps total de présentation : 10-15 minutes** ⏱️

**Questions attendues** :
- ❓ Pourquoi pas de backend ?
  - 💬 POC/MVP, facile à migrer ensuite
- ❓ Comment migrer vers API ?
  - 💬 Remplacer `dataLoader.ts` par des fetch()
- ❓ Sécurité ?
  - 💬 Backend nécessaire pour validation côté serveur
- ❓ Scalabilité ?
  - 💬 Vercel auto-scale, CDN global

---

**FIN - Bonne présentation !** 🎉
