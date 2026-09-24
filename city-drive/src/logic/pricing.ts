// Grille tarifaire City Drive (FCFA), d'après le cahier des charges et les tarifs saisis dans Vela
// (fare_settings, ride_class_settings). Le prix annoncé à la commande est fixe : seuls l'attente
// au-delà du temps offert et les annulations tardives s'y ajoutent.

import type { RouteOption } from './traffic.ts';

/** Catégories définies dans Vela (ride_class_settings). */
export type Category = 'covoiturage' | 'eco' | 'confort' | 'confort_plus' | 'boss';
export type MissionType = 'course' | 'livraison';

export type Fare = { base: number; perKm: number; perMin: number };

/** fare_settings : base + prix au km + prix à la minute, par type de mission. */
export const FARES: Record<MissionType, Fare> = {
  course: { base: 500, perKm: 150, perMin: 25 },
  livraison: { base: 350, perKm: 100, perMin: 15 },
};

/** ride_class_settings : coefficient appliqué au tarif de base. */
export const COEFFICIENTS: Record<Category, number> = {
  covoiturage: 0.7,
  eco: 1,
  confort: 1.4,
  confort_plus: 1.7,
  boss: 2.5,
};

export const MIN_FARE = 1000; // à confirmer
/** Majoration de nuit (22 h – 5 h) et aux heures de pointe, réglable par l'admin. */
export const MAJORATION = 0.2;
export const STOP_FEE = 300;
export const MAX_STOPS = 5; // à confirmer
export const BOOKING_FEE = 200; // course programmée
/** Attente offerte au départ et à chaque arrêt. */
export const FREE_WAIT_MIN = 3;
export const WAIT_FEE_PER_MIN = 50;
export const CANCEL_FEE = 500;
/** Annulation gratuite pendant ce délai après l'acceptation du chauffeur. */
export const FREE_CANCEL_MIN = 2;
/** Commission Garbban par mission (hypothèse à valider). */
export const COMMISSION_RATE = 0.15;
/** 1 point de fidélité par tranche de 100 F payée. */
export const POINTS_PER_100F = 1;

/** Arrondi aux 10 F supérieurs (retrouve les exemples du cahier des charges). */
export const roundFare = (n: number) => Math.ceil(Math.round(n) / 10) * 10;

/** Nuit (22 h – 5 h) ou heures de pointe (7 h – 10 h, 17 h – 20 h). */
export function isMajorated(date: Date): boolean {
  const h = date.getHours();
  return h >= 22 || h < 5 || (h >= 7 && h < 10) || (h >= 17 && h < 20);
}

export const majorationAt = (date: Date) => (isMajorated(date) ? 1 + MAJORATION : 1);

export type Quote = {
  category: Category;
  base: number;
  distance: number; // part kilométrique
  time: number; // part temps
  coefficient: number;
  majoration: number; // 1 ou 1,2
  stops: number;
  booking: number;
  toll: number;
  total: number;
};

/**
 * Prix = (base + distance + durée) × coefficient de catégorie × majoration, au moins 1 000 F,
 * puis frais d'arrêts, de réservation et péage.
 */
export function quote(
  category: Category,
  route: Pick<RouteOption, 'km' | 'minutes' | 'toll'>,
  opts: { stops?: number; scheduled?: boolean; majoration?: number; type?: MissionType } = {},
): Quote {
  const f = FARES[opts.type ?? 'course'];
  const coefficient = COEFFICIENTS[category];
  const majoration = Math.max(1, opts.majoration ?? 1);
  const distance = Math.round(route.km * f.perKm);
  const time = Math.round(route.minutes * f.perMin);
  const ride = Math.max(MIN_FARE, (f.base + distance + time) * coefficient * majoration);
  const stops = (opts.stops ?? 0) * STOP_FEE;
  const booking = opts.scheduled ? BOOKING_FEE : 0;
  return {
    category,
    base: f.base,
    distance,
    time,
    coefficient,
    majoration,
    stops,
    booking,
    toll: route.toll,
    total: roundFare(ride + stops + booking + route.toll),
  };
}

/** Frais d'attente une fois le temps offert écoulé. */
export const waitingFee = (waitedMin: number) => Math.max(0, Math.floor(waitedMin) - FREE_WAIT_MIN) * WAIT_FEE_PER_MIN;

/** Frais d'annulation : gratuit avant l'acceptation et pendant les 2 premières minutes. */
export function cancellationFee(minutesSinceAccept: number | null): number {
  if (minutesSinceAccept === null) return 0;
  return minutesSinceAccept < FREE_CANCEL_MIN ? 0 : CANCEL_FEE;
}

/**
 * Partage d'une mission entre Garbban et le chauffeur. Le péage est reversé en entier au chauffeur.
 * En espèces, le chauffeur encaisse tout : la commission devient une dette, déduite du prochain paiement numérique.
 */
export function settlement(fare: number, toll: number, cash: boolean) {
  const commission = Math.round((fare - toll) * COMMISSION_RATE);
  return { commission, driverNet: fare - commission, driverDebt: cash ? commission : 0 };
}

/** Part de chacun en covoiturage (arrondie aux 10 F supérieurs). */
export function splitFare(total: number, passengers: number): number {
  return roundFare(total / Math.max(1, passengers));
}

export const loyaltyPoints = (paid: number) => Math.floor(paid / 100) * POINTS_PER_100F;
