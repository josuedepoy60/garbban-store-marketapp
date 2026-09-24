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
| `/navigation` | Navigation GPS en mode sombre : guidage virage par virage, vocal, compteur de vitesse, SOS |
| `/portefeuille` (onglet) | Carte Pass, recharge Mobile Money (Wave, Orange, MTN, Moov), pass domicile-travail, historique filtrable, sécurité |
| `/recharge` | Confirmation de recharge Mobile Money : minuteur, récapitulatif, bonus, redirection opérateur |
| `/recu` | Reçu de recharge : célébration, nouveau solde, reçu détachable, partage |
| `/appel` | Appel en course chiffré : minuteur, micro, haut-parleur, SOS, raccrocher |
| `/chat` | Messagerie en course : réponses rapides, message vocal transcrit, envoi |
| `/evaluation` | Fin de course : note étoilée, compliments, pourboire débité du portefeuille, chauffeur favori, message |
| `/compte` (onglet) | Profil, Pass Gold Club, solde, lieux favoris (ajout/suppression), préférences, sécurité, assistance, déconnexion |

## Couleurs

Palette « jeune et réaliste » définie dans `src/constants/theme.ts` : orange taxi d'Abidjan (`primary`) pour les actions, jaune soleil (`secondaryContainer`), vert, bleu et rose en accents, sur des fonds blancs et gris neutres. Chaque grande carte a sa couleur : portefeuille noir/jaune, Gold Club bleu, reçu vert.

## Style visuel

Sobre, dans l'esprit des apps de VTC réelles : une seule police (DM Sans), aplats de couleur sans dégradés décoratifs, ombres légères, coins modérés, carte de rue plate (`CityMap`) avec les taxis disponibles, barre d'onglets classique. Pas d'animations décoratives (rebonds, halos) ni de textes marketing.

## Adaptation aux écrans

- **Téléphones** : plein écran. Sous 360 px de large (`useCompact`), les éléments secondaires sont masqués ou compactés ; les cartes s'adaptent à la hauteur de l'écran.
- L'app cible uniquement les **téléphones Android et iPhone** (portrait, `supportsTablet: false`). Pour l'aperçu web, `ResponsiveShell` affiche l'app dans une colonne de 430 px sur les grands écrans.

## Organisation

- `src/app/` — routes (un fichier = un écran)
- `src/components/` — composants partagés (`ui.tsx`, `CityMap.tsx` carte illustrée SVG, en-têtes…)
- `src/data/wallet.tsx` — solde et historique partagés entre les écrans (recharges, courses, pourboires)
- `src/constants/theme.ts` — couleurs, typographies (Sora / DM Sans), ombres
- `src/constants/brand.ts` — nom de l'app et de la monnaie, à modifier en un seul endroit
- `src/data/mock.ts` — données de démonstration (à remplacer par l'API)
