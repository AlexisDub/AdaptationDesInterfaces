# Guide de Reprise en Main - Projet Figma avec Tailwind CSS v4

## 🎯 Contexte

Ce projet a été généré par **Figma Dev Mode** avec ses outils IA. Il utilise **Tailwind CSS v4**, une version moderne qui fonctionne différemment des versions précédentes.

---

## ✅ Configuration actuelle (générée par Figma)

### Ce qui est NORMAL et attendu :
- ❌ **Pas de fichier `tailwind.config.js`** → Normal pour Tailwind v4
- ❌ **Pas de fichier `postcss.config.js`** → Vite gère tout automatiquement
- ✅ **CSS compilé dans `src/index.css`** (3985 lignes) → ⚠️ **FICHIER GÉNÉRÉ AUTOMATIQUEMENT**
- ✅ **CSS source dans `src/styles/globals.css`** → **Fichier à éditer pour personnaliser**
- ✅ **Tailwind v4 dans `src/package.json`** → Installation correcte
- ✅ **CSS Variables pour personnalisation** → Nouvelle approche v4

### ⚠️ IMPORTANT : Ne pas éditer `src/index.css` directement !
Ce fichier de 3985 lignes est **généré automatiquement** par Tailwind CSS à partir de :
1. Votre fichier source `src/styles/globals.css` 
2. Les classes Tailwind utilisées dans vos composants `.tsx`
3. Les variables et configurations de Tailwind v4

### Structure de fichiers :
```
AdaptationDesInterfaces/
├── src/
│   ├── index.css              ← ⚠️ GÉNÉRÉ AUTO - NE PAS ÉDITER
│   ├── styles/
│   │   └── globals.css        ← ✏️ FICHIER À ÉDITER (personnalisation)
│   ├── package.json           ← Tailwind v4 installé ici
│   ├── components/
│   │   ├── ui/                ← Composants génériques (Button, Card...)
│   │   └── *.tsx              ← Composants métier
│   └── main.tsx               ← Importe index.css
├── package.json               ← Dépendances principales (React, Vite...)
└── vite.config.ts             ← Configuration Vite
```

---

## 🔧 Comment personnaliser Tailwind v4

### ⚠️ Fichiers à comprendre :

| Fichier | Statut | Usage |
|---------|--------|-------|
| `src/styles/globals.css` | ✏️ **À ÉDITER** | Vos personnalisations CSS |
| `src/index.css` | ⚠️ **GÉNÉRÉ AUTO** | Ne JAMAIS éditer manuellement |
| `src/main.tsx` | ℹ️ Lecture seule | Importe `index.css` |

### 1. **Modifier les couleurs**

**Fichier à éditer :** `src/styles/globals.css`

```css
/* Dans :root - Ajouter/modifier vos couleurs */
:root {
  --font-size: 16px;
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  
  /* 🎨 MODIFIER ICI vos couleurs brand */
  --primary: #FF6B35;                     /* Votre orange principal */
  --primary-foreground: oklch(1 0 0);     /* Blanc pour le texte */
  
  --secondary: oklch(0.95 0.0058 264.53);
  --accent: #e9ebef;
  --destructive: #d4183d;
  
  /* Ajouter des couleurs custom */
  --color-brand-orange: #FF6B35;
  --color-brand-neutral: #3f3f46;
  
  Fichier à éditer :** `src/styles/globals.css` (ajouter à la fin)

```css
/* Après les déclarations :root et .dark */

/* Utilitaires custom pour votre restaurant */
.btn-restaurant {
  background-color: var(--primary);
  color: var(--primary-foreground);
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  transition: opacity 0.15s;
}

.btn-restaurant:hover {
  opacity: 0.9;
}

.card-restaurant {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.gradient-restaurant {
  background: linear-gradient(135deg, var(--primary), #FF8A5B);Le navigateur se rafraîchit (hot reload)

**Fichier :** `src/styles/globals.css`

```css
:root {
  /* Taille de base */
  --font-size: 16px;           /* Modifier pour tout redimensionner */
  
  /* Bordures arrondies */
  --radius: 0.625rem;          /* 10px - bordures par défaut */
  --radius-sm: 0.375rem;       /* 6px - petites bordures */
  --radius-lg: 0.75rem;        /* 12px - grandes bordures */
  
  /* Espacements custom (utiliser dans vos composants) */
  --spacing-xs: 0.25rem;       /* 4px */
  --spacing-sm: 0.5rem;        /* 8px */
  --spacing-md: 1rem;          /* 16px */
  --spacing-lg: 1.5rem;        /* 24px */
  
  /* Poids de police */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 600;
  
  .gradient-restaurant {
    background: linear-gradient(
      135deg, 
      var(--color-orange-500), 
      var(--color-orange-700)
    );
  }
}
```

**Méthode 2 : Classes Tailwind directes**
```tsx
// Utiliser les classes Tailwind existantes
<div className="bg-gradient-to-r from-orange-500 to-orange-700">
  Gradient
</div>
```

### 3. **Modifier les espacements, bordures, etc.**

```css
@layer theme {
  :root {
    /* Espacements */
    --spacing: .25rem;           /* Base spacing (4px) */
    
    /* Bordures arrondies */
**Fichier :** `src/styles/globals.css` (remplacer/ajouter à la fin)

```css
/* === CHARTE GRAPHIQUE RESTAURANT === */

/* Variables de couleurs principales */
:root {
  /* Couleurs brand */
  --primary: #FF6B35;                    /* Orange principal */
  --primary-foreground: #ffffff;         /* Texte sur orange */
  
  --secondary: #f4f4f5;                  /* Gris clair */
  --secondary-foreground: #18181b;       /* Texte sur gris */
  
  --accent: #FFA574;                     /* Orange accent */
  --accent-foreground: #18181b;
  
  --destructive: #ef4444;                /* Rouge erreur */
  --muted: #f4f4f5;                      /* Gris muted */
  --muted-foreground: #71717a;
  
  --border: rgba(0, 0, 0, 0.1);
  --ring: #FF6B35;                       /* Focus ring */
  
  /* Radius */
  --radius: 0.75rem;                     /* 12px - cartes */
  
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mode sombre (optionnel) */
.dark {
  --primary: #FF8A5B;                    /* Orange plus clair */
  --background: #18181b;
  --foreground: #fafafa;
  --border: rgba(255, 255, 255, 0.1);
}

/* === COMPOSANTS CUSTOM === */

/* Bouton restaurant */
.btn-restaurant {
  background-color: var(--primary);
  color: var(--primary-foreground);
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-weight: 500;
  transition: all var(--transition-fast);
  border: none;
  cursor: pointer;
}

.btn-restaurant:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Carte restaurant */
.card-restaurant {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  transition: all var(--transition-normal);
}

| Quoi modifier | Où le faire | Résultat |
|---------------|-------------|----------|
| **Couleurs/Variables** | `src/styles/globals.css` | Tailwind régénère `index.css` |
| **Utilitaires custom** | `src/styles/globals.css` | Classes disponibles partout |
| **Classes Tailwind** | Composants `.tsx` | Applique les styles |
| ❌ **Ne JAMAIS éditer** | `src/index.css` | Fichier auto-généré |

**Exemple de workflow :**
```bash
1. Éditer src/styles/globals.css
   └─> Ajouter --primary: #FF6B35;

2. Sauvegarder (Ctrl+S)
   └─> Tailwind détecte le changement

3. index.css est régénéré automatiquement
   └─> Inclut votre nouvelle couleur

4. Navigateur se rafraîchit (hot reload)
   └─> Changements visibles immédiatement
```

### 3. **Hot Reload automatique**
Vite + Tailwind surveillent :
- ✅ `src/styles/globals.css` → Régénère `index.css`
- ✅ Composants `.tsx` → Détecte nouvelles classes Tailwind
- ✅ Modifications CSS → Injection à chaud (pas de rechargement complet)

### 4. **Build production**
```bash
npm run build
```
→ Tailwind génère uniquement les classes utilisées (tree-shaking)
→ Bundle CSS optimisé (~20-50KB au lieu de plusieurs MB
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  alignstyles/globals.css */
:root {
  --color-custom-purple: #8B5CF6;
  --color-custom-green: #10B981;
  
  /* Ou utiliser oklch pour meilleure cohérence */
  --color-custom-500: oklch(0.65 0.18 280);
}
```
```tsx
// Utilisation dans composants
<div style={{ color: 'var(--color-custom-purple)' }}>Texte violet</div>

// Ou créer une classe utilitaire dans globals.css
.text-custom-purple {
  color: var(--color-custom-purple);
}
@layer utilities {
  .btn-restaurant {
    @apply bg-orange-600 text-white px-4 py-2 rounded-lg 
/* src/styles/globals.css */
.dark {
  --primary: #FF8A5B;              /* Orange plus clair pour le sombre */
  --background: oklch(0.145 0 0);  /* Fond sombre */
  --foreground: oklch(0.985 0 0);  /* Texte clair */
  --border: rgba(255, 255, 255, 0.1);
  --card: oklch(0.205 0 0);        /* Cartes légèrement plus claires */card-restaurant {
    @apply bg-white rounded-lg shadow-sm border border-neutral-200 
           hover:shadow-md transition-all;
/* src/styles/globals.css */
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes slide-in {
  from { 
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Classe utilitaire */
.animate-bounce-slow {
  animation: bounce-slow 2s infinite;
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
```
```tsx
// Utilisation
<div className="animate-bounce-slow">Bouncing!</div>
<div className="animate-slide-in">Sliding in
  Ajouter
</button>
```

---

## 🔄 Workflow de développement

### 1. **Démarrer le projet**
```bash
npm run dev
```

### 2. **Modifier les styles**
- **Classes Tailwind** : Directement dans vos composants `.tsx`
- **Couleurs/Variables** : Dans `src/index.css` > `@layer theme`
- **Utilitaires custom** : Dans `src/index.css` > `@layer utilities`

### 3. **Hot Reload automatique**
Vite recompile automatiquement à chaque modification. Pas besoin de redémarrer.

### 4. **Build production**
```bash
npm run build
```
→ Génère uniquement les classes CSS utilisées (bundle optimisé)

---

## 📦 Différences Tailwind v3 vs v4

| Aspect | Tailwind v3 (ancien) | Tailwind v4 (votre projet) |
|--------|---------------------|---------------------------|
| **Config file** | `tailwind.config.js` obligatoire | ❌ Pas nécessaire |
| **Directives CSS** | `@tailwind base/components/utilities` | CSS déjà compilé |
| **PostCSS** | Plugin séparé requis | Intégré dans Vite |
| **Personnalisation** | Via JS config | Via CSS variables |
| **Performance** | JIT mode séparé | JIT natif |
| **Import** | `import 'tailwindcss/...'` | `import './index.css'` |

**Avantages v4 :**
- ✅ Setup plus simple (pas de config)
- ✅ Performance améliorée
- ✅ CSS variables = personnalisation dynamique possible
- ✅ Meilleure intégration avec Vite


### 3. **Fichier à éditer : `src/styles/globals.css`**
- ✏️ **Toutes vos personnalisations vont ici**
- ⚠️ **JAMAIS éditer `src/index.css`** (fichier généré automatiquement)
- 📝 Le fichier `index.css` est régénéré à chaque modification de `globals.css` ou des composants
---

## 🛠️ Tâches courantes

### Ajouter une nouvelle couleur
```css
/* src/index.css */
@layer theme {
  :root {
    --color-custom-500: oklch(0.65 0.18 280);
  }
}
```
```tsx
// Utilisation
<div className="bg-custom-500">...</div>
```

### Modifier le thème sombre (si nécessaire)
```css
@layer theme {
  :root[data-theme="dark"] {
    --color-orange-600: oklch(0.75 0.18 45);  /* Plus clair en mode sombre */
  }
}
```

### Ajouter une animation custom
```c4s
@layer theme {
  :root {
    --animate-bounce-slow: bounce-slow 2s infinite;
  }
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```
```tsx
<div className="animate-[bounce-slow]">Bouncing!</div>
```

---

## 5 Conseils de reprise en main

### 1. **Ne créez PAS de `tailwind.config.js`**
Tailwind v4 n'en a pas besoin. Tout se fait via CSS.

### 2. **Utilisez les CSS variables**
```tsx
// ✅ Bon
<div style={{ color: 'var(--color-orange-600)' }}>Text</div>

// ⚠6. **Documentez vos personnalisations**
Ajoutez des commentaires dans `src/styles/globals.css` pour vos couleurs et classe
```

### 3. **Exploitez Class Variance Authority (CVA)**
Déjà installé dans votre projet pour les variants de composants.

```tsx
// components/ui/button.tsx - Déjà présent (doit être présent par défaut)
2. Vérifier que vos modifications sont dans `src/styles/globals.css`, PAS dans `index.css`
3. Sauvegarder `globals.css` et attendre la régénération automatique
4. Redémarrer le serveur de dev : `npm run dev`
5. Vérifier la console pour les erreurs Vite

### Mes modifications dans `index.css` sont écrasées
**Normal !** Ce fichier est généré automatiquement. 
→ **Solution :** Déplacer les modifications dans `src/styles/globals.css`.",
  {
    variants: {
      variant: {
        default: "bg-orange-600 text-white",    // Utilise vos couleurs
        outline: "border border-neutral-300",
      }
    }
  }
);
```

### 4. **Gardez les composants UI de Figma**
Les composants dans `src/components/ui/` sont excellents. Ne les supprimez pas, réutilisez-les.

### 5. **Documentez vos personnalisations**
Ajoutez des commentaires dans `src/index.css` pour vos couleurs custom.

---

## 🐛 Troubleshooting

### Les classes Tailwind ne s'appliquent pas
1. Vérifier que `src/index.css` est importé dans `main.tsx`
2. Redémarrer le serveur de dev : `npm run dev`
3. Vér✅ Comprendre que l'absence de config est normale (Tailwind v4)
- [ ] ⚠️ **Comprendre que `src/index.css` est GÉNÉRÉ automatiquement**
- [ ] ✏️ **Identifier le fichier source : `src/styles/globals.css`**
- [ ] 🎨 Personnaliser les couleurs dans `globals.css` (:root)
- [ ] 🧪 Tester les modifications en dev (`npm run dev`)
- [ ] 🔧 Créer des utilitaires custom dans `globals.css` si besoin
- [ ] 📝 Documenter vos changements (commentaires dans `globals.css`)
- [ ] 🚀 Builder pour production (`npm run build`)
- [ ] ❌ **Ne JAMAIS éditer `src/index.css` manuellement**

---

## 📊 Récapitulatif : Quel fichier éditer ?

| Je veux... | Fichier à éditer | Statut |
|------------|------------------|--------|
| Changer les couleurs | `src/styles/globals.css` | ✏️ Éditable |
| Ajouter des variables CSS | `src/styles/globals.css` | ✏️ Éditable |
| Créer des classes custom | `src/styles/globals.css` | ✏️ Éditable |
| Modifier le mode sombre | `src/styles/globals.css` | ✏️ Éditable |
| Ajouter des animations | `src/styles/globals.css` | ✏️ Éditable |
| ❌ Éditer le CSS compilé | `src/index.css` | ⚠️ **INTERDIT** (auto-généré) |er
npx tailwindcss init -p
```

### Convertir une couleur HEX en oklch
Utiliser : https://oklch.com/
- Entrer `#FF6B35`
- Copier la valeur oklch : `oklch(0.72 0.15 45)`

---

## 📚 Ressources

- [Tailwind v4 Documentation](https://tailwindcss.com/docs)
- [OKLCH Color Picker](https://oklch.com/)
- [Class Variance Authority](https://cva.style/docs)
- [Radix UI (vos composants)](https://www.radix-ui.com/)

---

## ✅ Checklist de reprise en main

- [ ] Comprendre que l'absence de config est normale
- [ ] Identifier les CSS variables dans `src/index.css`
- [ ] Personnaliser les couleurs principales (orange, neutral)
- [ ] Tester les modifications en dev (`npm run dev`)
- [ ] Créer des utilitaires custom si besoin
- [ ] Documenter vos changements
- [ ] Builder pour production (`npm run build`)

**Votre projet est prêt à être personnalisé ! 🚀**
