# Restaurant Le Gourmet - Interface de Commande Adaptive

Application React de prise de commande pour restaurant avec adaptation automatique selon le contexte d'usage.

## Déploiement sur Vercel

### Prérequis
- Un compte GitHub (gratuit)
- Un compte Vercel (gratuit)

### Étapes de déploiement

1. **Pusher le code sur GitHub** (si pas déjà fait)
   ```bash
   git add .
   git commit -m "Optimisation pour déploiement Vercel"
   git push origin main
   ```

2. **Déployer sur Vercel**
   - Aller sur [vercel.com](https://vercel.com)
   - Cliquer sur "Import Project"
   - Sélectionner votre repository GitHub
   - Vercel détectera automatiquement les settings :
     - Framework Preset: **Vite**
     - Build Command: **`npm run build`**
     - Output Directory: **`dist`**
   - Cliquer sur "Deploy"

3. **Attendre le déploiement** (2-3 minutes)

### Configuration

Les fichiers de configuration sont déjà inclus :
- `vercel.json` - Configuration Vercel
- `vite.config.ts` - Configuration Vite optimisée
- `.vercelignore` - Fichiers à ignorer

## 📱 Fonctionnalités

- **Multi-appareils** : Tablette (paysage) et Smartphone (portrait)
- **Mode Adulte** : Interface standard avec adaptation cognitive
- **Mode Rush** : Activation automatique selon le nombre de commandes
- **Mode Enfant** : Questionnaire gamifié avec Chef Léo
- **Recherche d'ingrédients** : Filtrage par inclusion/exclusion
- **Panier protégé** : Protection des cadeaux gratuits

## 🛠️ Développement local

```bash
# Installer les dépendances
npm install

# Lancer le serveur de dev
npm run dev

# Builder pour production
npm run build
```

## 📊 Données

Le menu complet est dans `/data/restaurant-data.ts` :
- 12 entrées
- 22 plats principaux  
- 12 desserts

Toutes les images sont optimisées via Unsplash.

---

Made with ❤️ for adaptive restaurant ordering
