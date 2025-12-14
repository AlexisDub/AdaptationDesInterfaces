# PWA Testing Guide

## Prerequisites
1. Run: `npm install vite-plugin-pwa workbox-window --save-dev`
2. Generate icons (see generate-icons.md)

## Testing Steps

### 1. Build the app
```bash
npm run build
```

### 2. Preview the production build
```bash
npx vite preview
```

### 3. Test on Desktop (Chrome/Edge)
1. Open http://localhost:4173
2. Look for install icon in address bar (⊕ or install button)
3. Click to install
4. App should open in standalone window

### 4. Test on Android Tablet
1. Deploy to Vercel/Netlify OR use ngrok for local testing:
   ```bash
   npx ngrok http 4173
   ```
2. Open the URL on your Android tablet (must be HTTPS)
3. Chrome will show "Add to Home Screen" banner
4. Install the app
5. Open from home screen - should run fullscreen without browser UI

## Verification Checklist
- ✅ Install prompt appears
- ✅ Manifest file loads (check DevTools > Application > Manifest)
- ✅ Service worker registered (check DevTools > Application > Service Workers)
- ✅ Works offline after first load
- ✅ Icons display correctly
- ✅ Standalone mode (no browser address bar)

## Common Issues
- **No install prompt**: Must be HTTPS (except localhost)
- **Icons not showing**: Check file paths and sizes
- **Not working offline**: Check service worker in DevTools

## Next Steps
Once verified, deploy to your hosting (Vercel) and users can install directly from the web!
