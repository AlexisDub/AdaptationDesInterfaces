# 5 Nouveaux Exemples de Réutilisation de Code
## Application de Commande Restaurant

---

## 📋 SLIDE 1 : ImageWithFallback - Pattern de Gestion d'Erreur

### Code TypeScript

```typescript
import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageWithFallback({ src, alt, className = '' }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div className={`${className} bg-neutral-100 flex items-center justify-center`}>
        <svg viewBox="0 0 24 24" className="w-12 h-12 text-neutral-400">
          {/* Icône SVG de fallback */}
        </svg>
      </div>
    );
  }
  
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
```

### Métriques de Réutilisation

- **Lignes de code** : 30 lignes
- **Nombre d'utilisations** : **20+ fois**
- **Fichiers concernés** : 5 composants
  - DishCard.tsx (pour chaque plat)
  - MenuView.tsx (affichage menu)
  - RushHourMode.tsx (mode rush)
  - ChildMode.tsx (mode enfant)
  - CartPage.tsx (panier)
  
- **Économie estimée** : ~600 lignes de code évitées
- **Pattern** : Composant utilitaire avec état d'erreur

### Script Oral

"Voici un excellent exemple de composant utilitaire. ImageWithFallback gère automatiquement les erreurs de chargement d'image en affichant une icône SVG par défaut. Ce composant de seulement 30 lignes est réutilisé plus de 20 fois dans 5 fichiers différents, nous évitant d'écrire environ 600 lignes de code répétitif. C'est un pattern de gestion d'erreur élégant et réutilisable."

### Illustrations à Capturer

1. Capture : Image de plat qui se charge correctement
2. Capture : Icône SVG de fallback en cas d'erreur
3. Code : Utilisation dans DishCard.tsx (`<ImageWithFallback src={dish.imageUrl} alt={dish.name} />`)

---

## 📋 SLIDE 2 : dataLoader - Centralisation des Données

### Code TypeScript

```typescript
// dataLoader.ts - 14 fonctions utilitaires centralisées

export function getDishById(id: string): Dish | undefined {
  return dishes.find(dish => dish.id === id);
}

export function getDishesByCategory(category: 'entrée' | 'plat' | 'dessert'): Dish[] {
  return dishes.filter(dish => dish.category === category);
}

export function getKidFriendlyDishes(): Dish[] {
  return dishes.filter(dish => dish.kidFriendly);
}

export function searchDishesByIngredients(
  query: string, 
  mode: 'include' | 'exclude' = 'include'
): Dish[] {
  const queryLower = query.toLowerCase().trim();
  if (mode === 'include') {
    return dishes.filter(dish => 
      dish.ingredients.some(ing => ing.toLowerCase().includes(queryLower))
    );
  } else {
    return dishes.filter(dish => 
      !dish.ingredients.some(ing => ing.toLowerCase().includes(queryLower))
    );
  }
}

export function rewardToDish(reward: ChildReward): Dish {
  return {
    id: `reward-${reward.id}`,
    name: `🎁 ${reward.name}`,
    price: 0,
    // ... transformation complète
  };
}
```

### Métriques de Réutilisation

- **Fonctions utilitaires** : **14 fonctions**
  - `getDishById()` - Récupérer un plat par ID
  - `getDishesByCategory()` - Filtrer par catégorie
  - `getKidFriendlyDishes()` - Plats adaptés enfants
  - `getQuickDishes()` - Plats rapides (mode rush)
  - `searchDishesByIngredients()` - Recherche par ingrédients
  - `isRushHour()` - Détection heure de pointe
  - `rewardToDish()` - Transformation récompense → plat
  - ... et 7 autres
  
- **Utilisées dans** : 8 composants
- **Pattern** : **Single Source of Truth**
- **Avantage majeur** : Migration facile vers API backend

### Script Oral

"Le fichier dataLoader.ts illustre le principe de centralisation des données. Il expose 14 fonctions utilitaires qui sont utilisées par 8 composants différents. Au lieu de dupliquer la logique de filtrage et de recherche partout, on a un seul endroit où cette logique existe. C'est le pattern 'Single Source of Truth'. L'avantage énorme : quand on migrera vers une API backend, on modifiera uniquement ce fichier, pas les 8 composants qui l'utilisent."

### Illustrations à Capturer

1. Diagramme : dataLoader.ts au centre, 8 composants autour qui l'utilisent
2. Code : Exemple d'utilisation `const dishes = getDishesByCategory('entrée')`
3. Schéma : Migration vers API (avant/après - seul dataLoader change)

---

## 📋 SLIDE 3 : cn() - Fonction Utilitaire Tailwind

### Code TypeScript

```typescript
// utils.ts - Fusion intelligente de classes CSS
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Utilisation dans les Composants

```typescript
// Exemple 1 : Classes conditionnelles
<div className={cn(
  "px-4 py-2 rounded-lg",
  isActive && "bg-orange-500 text-white",
  !isActive && "bg-gray-100 text-gray-700"
)} />

// Exemple 2 : Fusion avec props
<Button className={cn(buttonVariants({ variant, size }), className)} />

// Exemple 3 : États multiples
<div className={cn(
  "transition-all duration-200",
  isHovered && "scale-105",
  isPressed && "scale-95",
  isDisabled && "opacity-50 cursor-not-allowed"
)} />
```

### Métriques de Réutilisation

- **Lignes de code** : **5 lignes** seulement !
- **Nombre d'utilisations** : **100+ fois** dans le projet
- **Fichiers concernés** : **Tous les composants UI** (25+ fichiers)
- **Rôle** : Fusion intelligente de classes Tailwind
  - Gère les conflits (ex: `text-red-500` écrase `text-blue-500`)
  - Combine classes conditionnelles
  - Fusionne classes de variants + props

### Script Oral

"Voici l'exemple le plus impressionnant en termes de ratio lignes/impact. La fonction cn() fait seulement 5 lignes, mais elle est utilisée plus de 100 fois dans notre projet. Elle résout un problème crucial avec Tailwind : la fusion intelligente de classes CSS. Par exemple, si vous avez 'text-red-500' et 'text-blue-500', elle garde uniquement la dernière. C'est devenu un standard dans l'écosystème React + Tailwind."

### Illustrations à Capturer

1. Code : Définition de cn() (5 lignes)
2. Exemples : 3 cas d'usage (conditionnel, variants, états)
3. Métrique visuelle : "5 lignes → 100+ usages" avec icône de multiplication

---

## 📋 SLIDE 4 : ViewModeToggle - Composant Multi-Contexte

### Code TypeScript

```typescript
import { LayoutGrid, List } from 'lucide-react';
import { motion } from 'motion/react';

export type DisplayMode = 'grid' | 'list';

interface ViewModeToggleProps {
  displayMode: DisplayMode;
  onToggle: () => void;
}

export function ViewModeToggle({ displayMode, onToggle }: ViewModeToggleProps) {
  return (
    <div className="sticky bottom-6 left-0 right-0 pointer-events-none z-40">
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggle}
        className="absolute right-4 bottom-0 w-14 h-14 
                   bg-gradient-to-br from-orange-500 to-orange-600 
                   hover:from-orange-600 hover:to-orange-700 
                   text-white rounded-full shadow-2xl 
                   flex items-center justify-center transition-all 
                   pointer-events-auto"
        aria-label={`Basculer vers le mode ${displayMode === 'grid' ? 'liste' : 'grille'}`}
      >
        {displayMode === 'grid' ? (
          <List className="w-6 h-6" />
        ) : (
          <LayoutGrid className="w-6 h-6" />
        )}
      </motion.button>
    </div>
  );
}
```

### Métriques de Réutilisation

- **Lignes de code** : 30 lignes
- **Réutilisé dans** : **3 modes différents**
  1. **MenuView** - Menu standard
  2. **RushHourMode** - Mode heure de pointe
  3. **ChildMode** - Mode enfant
  
- **Fonctionnalités réutilisées** :
  - Animation Framer Motion (scale, opacity)
  - Positionnement sticky
  - Icônes Lucide React (List, LayoutGrid)
  - Accessibilité (aria-label dynamique)

### Script Oral

"ViewModeToggle démontre la réutilisation dans des contextes très différents. Ce bouton flottant permet de basculer entre vue grille et vue liste. Il est utilisé dans trois modes : le menu standard, le mode rush (serveur pressé), et le mode enfant (interface ludique). Malgré ces contextes différents, le même composant fonctionne parfaitement partout, avec des animations Framer Motion et une accessibilité intégrée."

### Illustrations à Capturer

1. Capture : Bouton flottant en bas à droite avec icône grille
2. Capture : Même bouton avec icône liste après toggle
3. Montage : Le même bouton dans les 3 modes (Menu, Rush, Child)

---

## 📋 SLIDE 5 : FilterChip - Composant Interne Paramétrable

### Code TypeScript

```typescript
interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color: 'green' | 'amber' | 'blue' | 'red' | 'orange';
}

function FilterChip({ label, active, onClick, color }: FilterChipProps) {
  const colorClasses = {
    green: active 
      ? 'bg-green-600 text-white border-green-600' 
      : 'bg-white text-green-700 border-green-300 hover:bg-green-50',
    amber: active
      ? 'bg-amber-600 text-white border-amber-600'
      : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50',
    blue: active
      ? 'bg-blue-600 text-white border-blue-600'
      : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50',
    red: active
      ? 'bg-red-600 text-white border-red-600'
      : 'bg-white text-red-700 border-red-300 hover:bg-red-50',
    orange: active
      ? 'bg-orange-600 text-white border-orange-600'
      : 'bg-white text-orange-700 border-orange-300 hover:bg-orange-50',
  };

  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-xs rounded-full border-2 
                  transition-all ${colorClasses[color]}`}
    >
      {label}
    </button>
  );
}
```

### Utilisation Concrète

```typescript
// Dans AdvancedFilters.tsx - 10 utilisations
<FilterChip
  label="🥬 Végétarien"
  active={filters.dietary.includes('vegetarian')}
  onClick={() => toggleDietary('vegetarian')}
  color="green"
/>

<FilterChip
  label="🌶️ Épicé"
  active={filters.characteristics.includes('spicy')}
  onClick={() => toggleCharacteristic('spicy')}
  color="red"
/>

<FilterChip
  label="🇫🇷 Française"
  active={filters.cuisine.includes('française')}
  onClick={() => toggleCuisine('française')}
  color="blue"
/>
```

### Métriques de Réutilisation

- **Lignes de code** : 35 lignes
- **Utilisations** : **10 chips** dans AdvancedFilters
  - 3 filtres régime (vert/vert/ambre)
  - 3 filtres caractéristiques (bleu/vert/rouge)
  - 4 filtres cuisine (bleu/orange/orange/orange)
  
- **Système de couleurs** : 5 couleurs paramétrables
- **Pattern** : Composant interne avec mapping de styles
- **Alternative évitée** : 10 boutons codés en dur

### Script Oral

"FilterChip illustre un pattern intéressant : le composant interne réutilisable. Il n'est pas exporté, il reste dans AdvancedFilters.tsx, mais il est utilisé 10 fois à l'intérieur de ce même fichier. Le système de couleurs paramétrable avec 5 variantes (green, amber, blue, red, orange) permet d'avoir des filtres cohérents visuellement. Sans ce composant, nous aurions 10 boutons codés en dur avec du code dupliqué."

### Illustrations à Capturer

1. Capture : Panneau de filtres avec les 10 chips de différentes couleurs
2. Capture : Chip inactive (blanc avec bordure colorée) vs active (fond coloré)
3. Code : Les 3 exemples d'utilisation (végétarien, épicé, française)

---

## 📊 SYNTHÈSE COMPARATIVE

| Exemple | Lignes | Usages | Impact | Pattern |
|---------|--------|--------|--------|---------|
| **ImageWithFallback** | 30 | 20+ | ~600 lignes évitées | Gestion d'erreur |
| **dataLoader** | 244 | 14 fonctions | Migration API facilitée | Single Source of Truth |
| **cn()** | 5 | 100+ | Standard de l'écosystème | Utilitaire CSS |
| **ViewModeToggle** | 30 | 3 contextes | Animations réutilisées | Multi-contexte |
| **FilterChip** | 35 | 10 chips | Cohérence visuelle | Composant interne |

### Points Clés

1. **Diversité des patterns** : Utilitaires, services, composants UI, helpers
2. **Ratio lignes/impact** : cn() = 5 lignes, 100+ usages
3. **Maintenance** : Un seul endroit à modifier
4. **Économie** : Environ 1000+ lignes de code évitées au total

---

## 🎯 RECOMMANDATIONS

### Pour Votre Présentation

1. **Slide ImageWithFallback** : Montrez l'image avec fallback (très visuel)
2. **Slide dataLoader** : Insistez sur la migration API (argument business)
3. **Slide cn()** : Ratio impressionnant 5 lignes → 100+ usages
4. **Slide ViewModeToggle** : Multi-contexte = flexibilité
5. **Slide FilterChip** : Pattern moins connu mais très utile

### Messages à Retenir

- **Réutilisation ≠ seulement composants** : fonctions, patterns, utilitaires
- **ROI évident** : Moins de code = moins de bugs = maintenance facile
- **Scalabilité** : Prêt pour migration backend (dataLoader)
- **Standards** : cn() est utilisé dans tout l'écosystème React/Tailwind
