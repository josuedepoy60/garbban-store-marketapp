// Logistique : flotte de chauffeurs, disponibilité par catégorie et attribution des courses.

import { haversineKm, type LatLng } from './geo.ts';
import type { Category } from './pricing.ts';
import { approachMinutes } from './traffic.ts';

export type DriverStatus = 'available' | 'busy' | 'offline';

export type Driver = {
  id: string;
  fullName: string;
  rating: number;
  trips: number;
  car: string;
  plate: string;
  category: Category;
  /** Chauffeur certifié : accepte le paiement en Vela Monnaie. */
  certified: boolean;
  /** Part des offres acceptées (taux d'acceptation, suivi par l'admin). */
  acceptRate: number;
  status: DriverStatus;
  position: LatLng;
  /** Gains nets crédités sur le compte chauffeur (paiements numériques). */
  earnings?: number;
  /** Commissions dues sur les courses encaissées en espèces. */
  debt?: number;
};

/** « Koffi Traoré » → « Koffi T. » */
export const shortName = (d: Pick<Driver, 'fullName'>) => {
  const [first, ...rest] = d.fullName.split(' ');
  return rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first;
};

export const INITIAL_FLEET: Driver[] = [
  {
    id: 'koffi',
    fullName: 'Koffi Traoré',
    rating: 4.9,
    trips: 862,
    car: 'Toyota Yaris · Blanche',
    plate: '8841 JJ 01',
    category: 'eco',
    certified: true,
    acceptRate: 0.95,
    status: 'available',
    position: { lat: 5.3561, lng: -3.9772 },
  },
  {
    id: 'awa',
    fullName: 'Awa Coulibaly',
    rating: 4.8,
    trips: 411,
    car: 'Hyundai Accent · Grise',
    plate: '2217 KL 01',
    category: 'eco',
    certified: true,
    acceptRate: 0.85,
    status: 'available',
    position: { lat: 5.3702, lng: -3.9915 },
  },
  {
    id: 'yao',
    fullName: 'Yao N\u2019Guessan',
    rating: 4.6,
    trips: 1290,
    car: 'Toyota Corolla · Noire',
    plate: '5530 HG 01',
    category: 'eco',
    certified: false,
    acceptRate: 0.8,
    status: 'available',
    position: { lat: 5.3289, lng: -4.0112 },
  },
  {
    id: 'moussa',
    fullName: 'Moussa Diabaté',
    rating: 4.7,
    trips: 530,
    car: 'Suzuki Dzire · Blanche',
    plate: '9012 JK 01',
    category: 'eco',
    certified: true,
    acceptRate: 0.9,
    status: 'available',
    position: { lat: 5.2995, lng: -3.985 },
  },
  {
    id: 'adama',
    fullName: 'Adama Konaté',
    rating: 4.6,
    trips: 1760,
    car: 'Toyota Corolla · Grise',
    plate: '4410 KD 01',
    category: 'covoiturage',
    certified: true,
    acceptRate: 0.9,
    status: 'available',
    position: { lat: 5.3651, lng: -3.9712 },
  },
  {
    id: 'jules',
    fullName: 'Jules Aka',
    rating: 4.4,
    trips: 920,
    car: 'Kia Rio · Blanche',
    plate: '1832 HK 01',
    category: 'covoiturage',
    certified: false,
    acceptRate: 0.75,
    status: 'available',
    position: { lat: 5.331, lng: -4.015 },
  },
  {
    id: 'serge',
    fullName: 'Serge Kouamé',
    rating: 4.9,
    trips: 702,
    car: 'Toyota Camry · Grise',
    plate: '1147 KA 01',
    category: 'confort',
    certified: true,
    acceptRate: 0.9,
    status: 'available',
    position: { lat: 5.3688, lng: -3.9603 },
  },
  {
    id: 'fatou',
    fullName: 'Fatou Bamba',
    rating: 4.8,
    trips: 356,
    car: 'Kia K5 · Blanche',
    plate: '6620 JM 01',
    category: 'confort',
    certified: true,
    acceptRate: 0.85,
    status: 'available',
    position: { lat: 5.3012, lng: -3.9877 },
  },
  {
    id: 'eric',
    fullName: 'Éric Gnagne',
    rating: 4.5,
    trips: 988,
    car: 'Hyundai Sonata · Noire',
    plate: '3395 HF 01',
    category: 'confort',
    certified: false,
    acceptRate: 0.8,
    status: 'available',
    position: { lat: 5.3278, lng: -4.0201 },
  },
  {
    id: 'ibrahim',
    fullName: 'Ibrahim Ouattara',
    rating: 4.7,
    trips: 244,
    car: 'Toyota RAV4 · Blanc',
    plate: '7781 KB 01',
    category: 'confort_plus',
    certified: true,
    acceptRate: 0.85,
    status: 'available',
    position: { lat: 5.3598, lng: -3.982 },
  },
  {
    id: 'nadia',
    fullName: 'Nadia Yéo',
    rating: 4.8,
    trips: 318,
    car: 'Hyundai Tucson · Grise',
    plate: '2290 KE 01',
    category: 'confort_plus',
    certified: true,
    acceptRate: 0.9,
    status: 'available',
    position: { lat: 5.322, lng: -4.015 },
  },
  {
    id: 'mariam',
    fullName: 'Mariam Sanogo',
    rating: 4.9,
    trips: 615,
    car: 'Mercedes Classe E · Noire',
    plate: '0099 KC 01',
    category: 'boss',
    certified: true,
    acceptRate: 0.9,
    status: 'available',
    position: { lat: 5.3601, lng: -3.999 },
  },
  {
    id: 'paul',
    fullName: 'Paul Brou',
    rating: 4.7,
    trips: 480,
    car: 'BMW Série 5 · Noire',
    plate: '5102 KF 01',
    category: 'boss',
    certified: true,
    acceptRate: 0.8,
    status: 'offline',
    position: { lat: 5.319, lng: -4.018 },
  },
];

/** Rayon de recherche des chauffeurs en ligne (km). */
export const DISPATCH_RADIUS_KM = 3;
/** Délai de réponse d'un chauffeur à une offre, avant passage au suivant (s). */
export const OFFER_TIMEOUT_S = 20;
/** Écart d'approche toléré pour privilégier le chauffeur favori (min). */
export const FAVORITE_TOLERANCE_MIN = 5;

export type Candidate = { driver: Driver; eta: number };

function candidates(fleet: Driver[], pickup: LatLng, category: Category, date: Date, exclude: string[] = []): Candidate[] {
  return fleet
    .filter((d) => d.status === 'available' && d.category === category && !exclude.includes(d.id))
    .filter((d) => haversineKm(d.position, pickup) <= DISPATCH_RADIUS_KM)
    .map((driver) => ({ driver, eta: approachMinutes(driver.position, pickup, date) }))
    .sort((a, b) => a.eta - b.eta || b.driver.rating - a.driver.rating);
}

/** Nombre de chauffeurs libres et délai d'approche du plus proche, par catégorie. */
export function availability(fleet: Driver[], pickup: LatLng, category: Category, date = new Date()) {
  const list = candidates(fleet, pickup, category, date);
  return { count: list.length, eta: list[0]?.eta ?? null };
}

/**
 * Chauffeur à qui proposer la mission : le plus proche encore disponible (ceux qui ont déjà
 * refusé ou laissé expirer l'offre sont exclus). Le favori passe devant s'il n'arrive pas
 * plus de 5 min après le meilleur ; le paiement en portefeuille exige un chauffeur certifié.
 */
export function dispatch(
  fleet: Driver[],
  pickup: LatLng,
  category: Category,
  opts: { preferredId?: string | null; requireCertified?: boolean; exclude?: string[]; date?: Date } = {},
): Candidate | null {
  let list = candidates(fleet, pickup, category, opts.date ?? new Date(), opts.exclude);
  if (opts.requireCertified) list = list.filter((c) => c.driver.certified);
  if (!list.length) return null;
  const fav = opts.preferredId ? list.find((c) => c.driver.id === opts.preferredId) : undefined;
  if (fav && fav.eta - list[0].eta <= FAVORITE_TOLERANCE_MIN) return fav;
  return list[0];
}

/** Met à jour un chauffeur de la flotte (statut, position, note…). */
export const updateDriver = (fleet: Driver[], id: string, patch: Partial<Driver>) => fleet.map((d) => (d.id === id ? { ...d, ...patch } : d));

/** Nouvelle moyenne après une note (pondérée par le nombre de courses). */
export const nextRating = (d: Driver, stars: number) => Math.round(((d.rating * d.trips + stars) / (d.trips + 1)) * 100) / 100;

/**
 * Paiement du chauffeur à la fin d'une mission. En espèces, il garde tout et doit la commission ;
 * en paiement numérique, son net est crédité, moins sa dette espèces éventuelle.
 */
export function applyPayout(d: Driver, p: { commission: number; driverNet: number; cash: boolean }): Driver {
  const debt = d.debt ?? 0;
  if (p.cash) return { ...d, debt: debt + p.commission };
  const deducted = Math.min(debt, p.driverNet);
  return { ...d, debt: debt - deducted, earnings: (d.earnings ?? 0) + p.driverNet - deducted };
}
