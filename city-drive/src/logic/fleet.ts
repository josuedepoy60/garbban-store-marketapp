// Logistique : flotte de chauffeurs, disponibilité par catégorie et attribution des courses.

import { haversineKm, type LatLng } from './geo.ts';
import type { Category } from './pricing.ts';
import { approachMinutes, periodOf } from './traffic.ts';

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
  status: DriverStatus;
  position: LatLng;
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
    status: 'available',
    position: { lat: 5.3702, lng: -3.9915 },
  },
  {
    id: 'yao',
    fullName: 'Yao N’Guessan',
    rating: 4.6,
    trips: 1290,
    car: 'Toyota Corolla · Noire',
    plate: '5530 HG 01',
    category: 'eco',
    certified: false,
    status: 'available',
    position: { lat: 5.3389, lng: -4.0012 },
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
    status: 'busy',
    position: { lat: 5.3251, lng: -4.0182 },
  },
  {
    id: 'serge',
    fullName: 'Serge Kouamé',
    rating: 4.9,
    trips: 702,
    car: 'Toyota RAV4 · Grise',
    plate: '1147 KA 01',
    category: 'confort',
    certified: true,
    status: 'available',
    position: { lat: 5.3688, lng: -3.9603 },
  },
  {
    id: 'fatou',
    fullName: 'Fatou Bamba',
    rating: 4.8,
    trips: 356,
    car: 'Kia Sportage · Blanche',
    plate: '6620 JM 01',
    category: 'confort',
    certified: true,
    status: 'available',
    position: { lat: 5.3012, lng: -3.9877 },
  },
  {
    id: 'eric',
    fullName: 'Éric Gnagne',
    rating: 4.5,
    trips: 988,
    car: 'Hyundai Tucson · Noire',
    plate: '3395 HF 01',
    category: 'confort',
    certified: false,
    status: 'available',
    position: { lat: 5.3478, lng: -4.0301 },
  },
  {
    id: 'ibrahim',
    fullName: 'Ibrahim Ouattara',
    rating: 4.7,
    trips: 244,
    car: 'Toyota HiAce · Blanc',
    plate: '7781 KB 01',
    category: 'van',
    certified: true,
    status: 'available',
    position: { lat: 5.3304, lng: -4.0095 },
  },
  {
    id: 'adama',
    fullName: 'Adama Konaté',
    rating: 4.6,
    trips: 1760,
    car: 'Yamaha Crypton',
    plate: 'M 4410 01',
    category: 'moto',
    certified: true,
    status: 'available',
    position: { lat: 5.3651, lng: -3.9712 },
  },
  {
    id: 'jules',
    fullName: 'Jules Aka',
    rating: 4.4,
    trips: 920,
    car: 'Honda Wave',
    plate: 'M 1832 01',
    category: 'moto',
    certified: false,
    status: 'available',
    position: { lat: 5.351, lng: -3.9899 },
  },
  {
    id: 'mariam',
    fullName: 'Mariam Sanogo',
    rating: 4.9,
    trips: 615,
    car: 'Mercedes Classe C · Noire',
    plate: '0099 KC 01',
    category: 'confort',
    certified: true,
    status: 'offline',
    position: { lat: 5.3601, lng: -3.999 },
  },
];

/** Rayon au-delà duquel un chauffeur n'est pas proposé (km). */
export const DISPATCH_RADIUS_KM = 8;
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

/** Demande estimée par chauffeur libre : double aux heures de pointe. */
export const demandAt = (date: Date) => (periodOf(date) === 'pointe' ? 2 : 1);

/**
 * Attribue le chauffeur disponible le plus proche. Le favori passe devant s'il n'arrive
 * pas plus de 5 min après le meilleur ; le paiement en portefeuille exige un chauffeur certifié.
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
