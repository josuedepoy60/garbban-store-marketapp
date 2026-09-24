# City Drive

Application mobile de VTC / transport pour Abidjan, construite avec **Expo (SDK 57) + React Native + Expo Router**.

## Lancer l'app

```bash
npm install
npx expo start      # puis scanner le QR code avec Expo Go
npm run web         # aperçu dans le navigateur
npm run typecheck
```

## Écrans (d'après les maquettes)

| Route | Écran |
| --- | --- |
| `/` (onglet Course) | Accueil : carte, recherche, raccourcis, itinéraires, dernier chauffeur |
| `/trajets` (onglet Trajets) | Transports en commun : carte du réseau, filtres, prochains passages |
| `/arrets` | Course à plusieurs arrêts + covoiturage |
| `/vehicules` | Choix du véhicule, modèle, moyen de paiement |
| `/course` | Course active : chauffeur en approche, règlement |
| `/programmer` | Programmer une course (jour, heure, chauffeur préféré) |
| `/portefeuille`, `/compte` | Provisoires, en attente de maquettes |

## Organisation

- `src/app/` — routes (un fichier = un écran)
- `src/components/` — composants partagés (`ui.tsx`, `CityMap.tsx` carte illustrée SVG, en-têtes…)
- `src/constants/theme.ts` — couleurs, typographies (Sora / DM Sans), ombres
- `src/constants/brand.ts` — nom de l'app et de la monnaie, à modifier en un seul endroit
- `src/data/mock.ts` — données de démonstration (à remplacer par l'API)
