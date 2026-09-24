// Grille tarifaire City Drive (FCFA). Le prix annoncé à la commande est garanti :
// seuls l'attente au-delà du temps offert et les annulations tardives s'y ajoutent.

import type { RouteOption } from './traffic.ts';

export type Category = 'eco' | 'confort' | 'van' | 'moto';

export type Tariff = { base: number; perKm: number; perMin: number; minimum: number };

export const TARIFFS: Record<Category, Tariff> = {
  moto: { base: 200, perKm: 90, perMin: 10, minimum: 500 },
  eco: { base: 500, perKm: 150, perMin: 20, minimum: 1000 },
  confort: { base: 700, perKm: 200, perMin: 25, minimum: 1500 },
  van: { base: 1000, perKm: 280, perMin: 30, minimum: 2500 },
};

export const STOP_FEE = 300;
export const BOOKING_FEE = 200; // course programmée
export const FREE_WAIT_MIN = 3;
export const WAIT_FEE_PER_MIN = 50;
export const CANCEL_FEE = 500;
/** Annulation gratuite pendant ce délai après l'acceptation du chauffeur. */
export const FREE_CANCEL_MIN = 2;
export const MAX_SURGE = 1.5;
/** 1 point de fidélité par tranche de 100 F payée. */
export const POINTS_PER_100F = 1;

/** Arrondi commercial à 50 F supérieurs. */
export const roundFare = (n: number) => Math.ceil(n / 50) * 50;

export type Quote = {
  category: Category;
  distance: number; // part kilométrique
  time: number; // part temps
  base: number;
  stops: number;
  booking: number;
  toll: number;
  surge: number; // multiplicateur appliqué hors péage et frais
  total: number;
};

/**
 * Majoration selon l'offre et la demande : 1 si au moins 3 chauffeurs libres par demande,
 * jusqu'à ×1,5 quand il n'y en a plus aucun.
 */
export function surgeFor(availableDrivers: number, demand = 1): number {
  if (demand <= 0) return 1;
  const ratio = availableDrivers / demand;
  if (ratio >= 3) return 1;
  if (ratio <= 0) return MAX_SURGE;
  return Math.round((1 + (MAX_SURGE - 1) * (1 - ratio / 3)) * 10) / 10;
}

export function quote(
  category: Category,
  route: Pick<RouteOption, 'km' | 'minutes' | 'toll'>,
  opts: { stops?: number; scheduled?: boolean; surge?: number } = {},
): Quote {
  const t = TARIFFS[category];
  const surge = Math.min(MAX_SURGE, Math.max(1, opts.surge ?? 1));
  const distance = Math.round(route.km * t.perKm);
  const time = Math.round(route.minutes * t.perMin);
  const ride = Math.max(t.minimum, (t.base + distance + time) * surge);
  const stops = (opts.stops ?? 0) * STOP_FEE;
  const booking = opts.scheduled ? BOOKING_FEE : 0;
  // Les motos ne passent pas le péage HKB : le péage n'est facturé qu'aux voitures.
  const toll = category === 'moto' ? 0 : route.toll;
  return { category, distance, time, base: t.base, stops, booking, toll, surge, total: roundFare(ride + stops + booking + toll) };
}

/** Frais d'attente une fois le temps offert écoulé. */
export const waitingFee = (waitedMin: number) => Math.max(0, Math.floor(waitedMin) - FREE_WAIT_MIN) * WAIT_FEE_PER_MIN;

/** Frais d'annulation : gratuit avant l'acceptation et pendant les 2 premières minutes. */
export function cancellationFee(minutesSinceAccept: number | null): number {
  if (minutesSinceAccept === null) return 0;
  return minutesSinceAccept < FREE_CANCEL_MIN ? 0 : CANCEL_FEE;
}

/** Part de chacun en covoiturage (arrondie à 50 F, le demandeur paie le reste). */
export function splitFare(total: number, passengers: number): number {
  return roundFare(total / Math.max(1, passengers));
}

export const loyaltyPoints = (paid: number) => Math.floor(paid / 100) * POINTS_PER_100F;
