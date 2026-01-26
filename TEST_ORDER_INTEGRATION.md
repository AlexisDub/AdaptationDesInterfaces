# Test de l'intégration des commandes au backend

## ✅ Fonctionnalité implémentée

L'application envoie maintenant les commandes au backend avec vérification automatique.

## 🔄 Flux complet

Quand un utilisateur confirme sa commande :

1. **POST /tableOrders** - Ouvre une commande pour la table
2. **POST /tableOrders/{id}** - Ajoute chaque plat (avec quantité)
3. **POST /tableOrders/{id}/prepare** - Envoie en cuisine
4. **GET /tableOrders/{id}** - ✅ **Vérifie** que tout est bien enregistré

## 🧪 Comment tester

### Prérequis
```bash
# 1. Backend doit être lancé
cd Back/micro-restaurant-nestjs-public
./start-all.sh

# 2. Frontend en mode backend (pas mock)
# Vérifier que .env contient:
VITE_USE_MOCK_DATA=false

# 3. Frontend lancé
npm run dev
```

### Test 1: Commande simple (Tablette/Smartphone)

1. Ouvrir `http://localhost:5173`
2. Choisir un mode (normal ou enfant)
3. Sélectionner une table (ex: Table 1)
4. Ajouter des plats au panier
5. Cliquer sur "Commander"
6. **Vérifier la console:**

```javascript
🌐 [Order Service] Soumission commande pour table 1...
  → POST /tableOrders (table: 1, clients: 1)
  ✅ Commande ouverte: 696512246bc1a3bcab4f0c3d
  → POST /tableOrders/696512246bc1a3bcab4f0c3d (2x Homemade foie gras terrine)
  ✅ 2 items ajoutés
  → POST /tableOrders/696512246bc1a3bcab4f0c3d/prepare
  ✅ Commande envoyée à la cuisine
  → GET /tableOrders/696512246bc1a3bcab4f0c3d (vérification)
  ✅ Vérification réussie: {orderId: "...", table: 1, items: 2, opened: true}
✅ [Order Service] Commande 696512246bc1a3bcab4f0c3d complète et vérifiée!
```

7. **Vérifier le Network tab:**
   - 4 requêtes vers `localhost:9500/dining/tableOrders`
   - Status: 200/201 pour toutes

### Test 2: Commande table tactile (4 convives)

1. Ouvrir `http://localhost:5173` (sans paramètres = table tactile)
2. Ajouter des plats aux 4 zones personnelles
3. Cliquer sur "Payer" pour un convive
4. **Console:** Même flux mais `clients: 1`
5. Cliquer sur "Payer" pour la zone commune
6. **Console:** Même flux mais `clients: 4`

### Test 3: Vérification backend

Ouvrir les Swagger docs pour voir les commandes:
- Dining: `http://localhost:9500/doc/dining`
- Kitchen: `http://localhost:9500/doc/kitchen`

Ou vérifier avec curl:
```bash
# Toutes les commandes
curl http://localhost:9500/dining/tableOrders

# Une commande spécifique
curl http://localhost:9500/dining/tableOrders/696512246bc1a3bcab4f0c3d

# Préparations cuisine
curl http://localhost:9500/kitchen/preparations
```

## 📊 Données envoyées

### Exemple de requête POST /tableOrders
```json
{
  "tableNumber": 1,
  "customersCount": 2
}
```

### Exemple de requête POST /tableOrders/{id}
```json
{
  "menuItemShortName": "foie gras",
  "howMany": 2
}
```

### Exemple de réponse GET /tableOrders/{id}
```json
{
  "_id": "696512246bc1a3bcab4f0c3d",
  "tableNumber": 1,
  "customersCount": 2,
  "opened": true,
  "lines": [
    {
      "menuItem": "foie gras",
      "howMany": 2
    }
  ]
}
```

## ⚠️ Gestion d'erreurs

Si le backend n'est pas disponible:
- L'app affiche une erreur en console
- La commande reste confirmée côté UI
- Pas de crash, fallback gracieux

En mode MOCK (`VITE_USE_MOCK_DATA=true`):
- Les commandes ne sont PAS envoyées au backend
- Simulation locale uniquement
- Log: `📦 [Mode MOCK] Commande simulée localement`

## 🔍 Mapping des plats

Le backend utilise des `shortName` pour identifier les plats:
- Frontend: "Homemade foie gras terrine"
- Backend: "foie gras"

Le mapping est géré automatiquement dans `orderService.ts`.

Si un plat n'a pas de mapping:
```
⚠️ [Order Service] Pas de mapping trouvé pour "Nouveau Plat"
```
→ Ajouter le mapping dans `extractShortName()` de `orderService.ts`

## 📝 Fichiers modifiés

- ✅ `src/services/orderService.ts` (nouveau) - Service de soumission
- ✅ `src/App.tsx` - Intégration commande tablette/smartphone
- ✅ `src/components/TableTactile.tsx` - Intégration table tactile
- ✅ `src/services/backendAPI.ts` - APIs déjà présentes, utilisées

## 🎯 Prochaines étapes (optionnel)

1. **Polling des statuts** - Rafraîchir l'état de la commande toutes les 5s
2. **Notifications cuisine** - WebSocket pour notifications temps réel
3. **Historique commandes** - Afficher les commandes passées
4. **Gestion d'erreurs UI** - Toast/notification si échec backend
