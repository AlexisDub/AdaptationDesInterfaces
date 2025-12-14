# Guide d'utilisation des URLs

## Mode Tablette (Serveur)
Pour utiliser l'application en mode tablette (serveur), utilisez simplement l'URL normale :
```
https://adaptation-des-interfaces-jungledif.vercel.app/
```

Le serveur devra :
1. Entrer le numéro de la table
2. Puis donner la tablette au client qui choisira le mode (Parent/Enfant)

## Mode Téléphone (Client)
Pour utiliser l'application en mode téléphone (client), générez des QR codes avec les URLs suivantes :

### Table 1
```
https://adaptation-des-interfaces-jungledif.vercel.app/?mode=phone&idtable=1
```

### Table 2
```
https://adaptation-des-interfaces-jungledif.vercel.app/?mode=phone&idtable=2
```

### Table 3
```
https://adaptation-des-interfaces-jungledif.vercel.app/?mode=phone&idtable=3
```

Et ainsi de suite pour chaque table...

## Important
- En mode téléphone, le client arrive **directement** sur l'écran de sélection du mode (Parent/Enfant)
- Le numéro de table est automatiquement récupéré depuis l'URL
- Pas besoin de saisir manuellement le numéro de table

## Paramètres URL

- `mode=phone` : Active le mode téléphone (affichage smartphone)
- `idtable=X` : Définit le numéro de la table (où X est le numéro)

## Exemple de génération de QR codes
Vous pouvez utiliser des services en ligne comme :
- https://www.qr-code-generator.com/
- https://www.qrcode-monkey.com/

Pour chaque table, générez un QR code avec l'URL correspondante.
