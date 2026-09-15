# Brand assets

The mark is drawn once, in `build-icons.js`, and every icon is rendered from it.
The splash adds the wordmark ("Kati" in Fraunces SemiBold, as outlines).

```bash
cd assets/brand
npm i sharp fontkit          # not project deps — install here, don't commit
node build-icons.js          # → out/  (icon, icon-dark, android set, notification, favicon, splash mark)
node build-splash.js ../../node_modules/@expo-google-fonts/fraunces/600SemiBold/Fraunces_600SemiBold.ttf out/splash-icon.png out/splash-icon.png
cp out/*.png ../images/
```

Colours: ground `#1F5F4A` (brand), stamp `#2E7D5B` (given), dark ground `#131311`.
