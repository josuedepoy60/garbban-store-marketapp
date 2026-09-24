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

Les règles suivent le cahier des charges City Drive.

Le code métier est pur TypeScript, sans interface, dans `src/logic/`. Il est testé par `npm test` (34 tests, runner natif de Node) :

- `pricing.ts` : tarifs repris de Vela.
  - Formule : prix = (base + km + minutes) × coefficient de catégorie.
  - Barème course : 500 F de base + 150 F/km + 25 F/min. Barème livraison : 350 F de base + 100 F/km + 15 F/min.
  - Coefficients : Covoiturage 0,7, Éco 1, Confort 1,4, Confort Plus 1,7, Boss 2,5.
  - Majoration de +20 % la nuit (22 h – 5 h) et aux heures de pointe, prix minimum de 1 000 F.
  - 300 F par arrêt (5 arrêts au plus, 3 min d'attente offertes à chacun).
  - Commission de 15 %. En espèces, elle devient une dette du chauffeur, déduite de son prochain paiement numérique.
- `fleet.ts` : chauffeurs Vela, avec catégorie, position, statut, note, certification et taux d'acceptation.
  - La mission va au chauffeur le plus proche dans un rayon de 3 km. Sans réponse sous 20 s, ou en cas de refus, elle passe au suivant.
  - Le chauffeur favori passe devant s'il arrive au plus 5 min après le plus proche.
  - Seul un chauffeur certifié accepte la Vela Monnaie et le Mobile Money.
- `ride.ts` : cycle de vie d'une course, sous forme de machine à états : recherche → acceptée → arrivé → en cours → terminée, ou annulée / aucun chauffeur.
- `schedule.ts` : réservation entre 1 h et 7 jours à l'avance. Le chauffeur réservé est confirmé ou remplacé 30 min avant le départ.
- `traffic.ts` et `places.ts` : vitesses selon l'heure, points noirs, choix entre Pont HKB (péage) et Pont FHB, et 16 lieux d'Abidjan.

`src/data/ride.tsx` (RideProvider) orchestre le tout :

- il envoie les offres aux chauffeurs l'une après l'autre et fait avancer la course (démo : 1 s = 1 min) ;
- il règle la course en Vela Monnaie, en Mobile Money (Wave, Orange, MTN, Moov) ou en espèces ;
- il calcule la commission et paie le chauffeur ;
- il tient l'historique à jour.

Le portefeuille, les courses, les réservations et la flotte sont sauvegardés sur l'appareil (AsyncStorage). Le branchement sur la base Supabase de Vela est à faire.

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
