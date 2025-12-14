# Commande Assistée Restaurant (copie)

This is a code bundle for Commande Assistée Restaurant (copie). The original project is available at https://www.figma.com/design/wgHTQE9Wn4F30k275vjx9l/Commande-Assist%C3%A9e-Restaurant--copie-.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Modes d'utilisation

### Mode Tablette (Serveur)
Accédez à l'URL normale : `https://adaptation-des-interfaces-jungledif.vercel.app/`
- Le serveur saisit le numéro de table
- Puis donne la tablette au client pour sélectionner le mode (Parent/Enfant)

### Mode Téléphone (Client)
Les clients scannent un QR code contenant : `https://adaptation-des-interfaces-jungledif.vercel.app/?mode=phone&idtable=X`
- Arrive directement sur l'écran de sélection du mode (Parent/Enfant)
- Le numéro de table est automatiquement détecté

Voir [URL_GUIDE.md](URL_GUIDE.md) pour plus de détails.
  