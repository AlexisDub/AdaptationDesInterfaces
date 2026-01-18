# ⚡ Quick Start - Intégration Backend

## 🎯 En 30 secondes

Votre application fonctionne **exactement comme avant**. Rien n'est cassé.

**Nouveau:** Elle peut maintenant se connecter au backend du prof, en 1 ligne de config.

---

## 📦 Mode actuel: MOCK (Données locales)

✅ **Aucune action requise**

L'app utilise vos données locales (20+ plats simulés).

```bash
npm run dev
# → http://localhost:3003
```

**Fonctionne hors ligne** ✅

---

## 🌐 Passer en mode BACKEND (Microservices)

### Étape 1: Obtenir les URLs

Demandez au prof les URLs des 3 services:
- Menu Service (gère les plats)
- Dining Service (gère les commandes)
- Kitchen Service (gère les préparations)

### Étape 2: Éditer `.env`

```env
VITE_USE_MOCK_DATA=false

VITE_MENU_SERVICE_URL=http://localhost:3001
VITE_DINING_SERVICE_URL=http://localhost:3002
VITE_KITCHEN_SERVICE_URL=http://localhost:3004
```

### Étape 3: Relancer

```bash
npm run dev
```

**C'est tout !** L'app charge maintenant depuis le backend. 🎉

---

## 🧪 Tester la connexion

**Ouvrez la console (F12)** et tapez:

```javascript
// Afficher les commandes disponibles
backendTest.showStatus()

// Tester la connexion
await backendTest.testBackendConnection()

// Tester le chargement des plats
await backendTest.testDishLoading()

// Tester un cycle de commande complet
await backendTest.testOrderFlow(1)
```

---

## ❓ Questions fréquentes

### L'app ne charge plus après avoir changé le .env ?

1. Vérifiez que les URLs sont correctes
2. Vérifiez que les services backend sont lancés
3. Remettez `VITE_USE_MOCK_DATA=true` pour revenir au mode local
4. Relancez avec `npm run dev`

### Comment revenir en mode local ?

```env
VITE_USE_MOCK_DATA=true
```

Relancez `npm run dev`.

### Un plat n'a pas de description ?

Ajoutez-le dans `src/data/dishEnrichment.ts`:

```typescript
"nom-du-plat": {
  description: "...",
  ingredients: ["...", "..."],
  allergens: ["..."],
  isSpicy: false
}
```

Le `nom-du-plat` doit être le **shortName** du backend.

### Comment appeler les API manuellement ?

```typescript
import { MenuServiceAPI } from './services/backendAPI';

// Récupérer tous les plats
const items = await MenuServiceAPI.getAllMenuItems();

// Ajouter un plat
const newItem = await MenuServiceAPI.addMenuItem({
  fullName: "Nouveau Plat",
  shortName: "nouveau-plat",
  price: 15.00,
  category: "MAIN",
  image: "https://..."
});
```

---

## 📚 Documentation complète

| Document | Utilité |
|----------|---------|
| **[INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)** | 🎯 **Lisez en premier** |
| [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) | Guide détaillé |
| [TODO_INTEGRATION.md](./TODO_INTEGRATION.md) | À faire ensuite |
| [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) | Schémas visuels |
| [FILES_CREATED.md](./FILES_CREATED.md) | Liste des fichiers |

---

## 🎓 Pour le rapport/présentation

**Points clés à mentionner:**

1. **Adaptation sans casser l'existant**
   - Mode MOCK conservé
   - Composants réutilisés à l'identique
   - Ajout d'une couche service

2. **Enrichissement local**
   - Backend donne des données partielles
   - On enrichit avec une base locale
   - Transparent pour les composants

3. **Architecture modulaire**
   - Séparation claire des responsabilités
   - Services réutilisables
   - Types TypeScript partout

4. **Tests intégrés**
   - Commandes dans la console
   - Validation automatique
   - Détection d'erreurs

5. **Configuration simple**
   - 1 fichier `.env`
   - Switch MOCK ↔ BACKEND en 1 ligne
   - Fallback automatique

---

## 🚀 Commandes essentielles

```bash
# Installer
npm install

# Lancer en mode développement
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview
```

---

## 🐛 Debug rapide

**Problème:** Erreurs TypeScript

```bash
# Vérifier les erreurs
npm run build
```

**Problème:** Backend ne répond pas

```javascript
// Console F12
await backendTest.testBackendConnection()
```

**Problème:** Plat sans description

```javascript
// Console F12
// Voir les plats sans enrichissement
await backendTest.testDishLoading()
```

---

## 📞 Aide

- 🐛 Bug ? → Vérifiez la console (F12)
- 📖 Docu ? → `INTEGRATION_SUMMARY.md`
- 🧪 Test ? → `backendTest.*` dans console
- ⚙️ Config ? → `.env`

---

**✅ Votre app est prête pour le backend !** 🎉

**✨ Mais fonctionne parfaitement sans !** 😊
