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

Palette premium définie dans `src/constants/theme.ts` : noir profond (`primary`) pour les actions, jaune soleil (`secondaryContainer`), vert, bleu et rose en accents, sur des fonds blancs et gris neutres. Chaque grande carte a sa couleur : portefeuille noir/jaune, Gold Club bleu, reçu vert.

## Logique métier et logistique

Le code métier est pur TypeScript, sans interface, dans `src/logic/`, et testé par `npm test` (29 tests, runner natif de Node) :

- `places.ts` : 16 lieux d'Abidjan (GPS réels, rive nord/sud de la lagune) et recherche sans accents.
- `traffic.ts` : vitesse selon l'heure (pointe 7-10 h et 17-20 h), points noirs (Adjamé, Riviera 2), deux itinéraires à chaque trajet : voie express / Pont HKB (péage 500 F) ou direct / Pont FHB (gratuit, bouchons).
- `pricing.ts` : grille par catégorie (prise en charge + km + minute, minimum), 300 F par arrêt, majoration offre/demande plafonnée à ×1,5, arrondi à 50 F, attente offerte 3 min puis 50 F/min, annulation gratuite 2 min puis 500 F, points fidélité.
- `fleet.ts` : flotte de chauffeurs (catégorie, position, statut, note, certification Vela Monnaie) et attribution au plus proche dans un rayon de 8 km ; le favori passe devant s'il arrive au plus 5 min après.
- `ride.ts` : cycle de vie d'une course, sous forme de machine à états : recherche → acceptée → chauffeur arrivé → en course → terminée, ou annulée / aucun chauffeur.
- `schedule.ts` : réservation entre 30 min et 7 jours à l'avance, recherche du chauffeur 15 min avant, refus des réservations à moins d'une heure d'écart.

`src/data/ride.tsx` (RideProvider) orchestre le tout :

- il fait avancer la course (démo : 1 s = 1 min) ;
- il débite le portefeuille à l'arrivée, ou passe en espèces si le solde est insuffisant ;
- il libère le chauffeur à destination et met à jour sa note ;
- il enregistre l'historique.

Le portefeuille, la course en cours, l'historique, les réservations et la flotte sont sauvegardés sur l'appareil (AsyncStorage).

## Style visuel

Sobre, dans l'esprit des apps de VTC réelles : une seule police (DM Sans), aplats de couleur sans dégradés décoratifs, ombres légères, coins modérés, carte de rue plate (`CityMap`) avec les taxis disponibles, barre d'onglets classique. Pas d'animations décoratives (rebonds, halos) ni de textes marketing.

Icônes : [Phosphor](https://phosphoricons.com) (`phosphor-react-native`) via le composant `Icon`, qui garde les noms Material (`src/components/icons.ts` fait la correspondance). Trait fin par défaut, version pleine pour l'onglet actif, les étoiles et les validations. Les opérateurs Mobile Money (Wave, Orange Money, MTN MoMo, Moov) ont leurs pastilles aux couleurs de la marque (`OperatorBadge`).

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
